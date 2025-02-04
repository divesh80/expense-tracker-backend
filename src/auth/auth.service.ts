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

  private readonly JWT_SECRET = process.env.JWT_SECRET;

  // Register a new user
  async register(phoneNumber: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingUser) {
      throw new ConflictException('Phone number already registered');
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      return this.prisma.user.create({
        data: {
          phoneNumber,
          isDeleted: false,
          password: hashedPassword,
        },
      });
    } catch (err) {
      throw new Error(`Internal server error: ${JSON.stringify(err)}`);
    }
  }

  // Login an existing user
  async login(phoneNumber: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber, isDeleted: false },
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
