import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  private readonly JWT_SECRET = process.env.JWT_SECRET || 'abcdefghijain';

  // Register a new user
  async register(phoneNumber: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingUser) {
      throw new ConflictException('Phone number already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        phoneNumber,
        password: hashedPassword,
      },
    });
  }

  // Login an existing user
  async login(phoneNumber: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    const token = jwt.sign({ userId: user.id }, this.JWT_SECRET, {
      expiresIn: '1h',
    });

    return { token, userId: user.id };
  }
}
