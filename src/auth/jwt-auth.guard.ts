import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'abcdefghijain';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JwtPayload; // Explicitly cast to JwtPayload
      if (!decoded) {
        throw new UnauthorizedException('Invalid token payload');
      }
      request.user = decoded; // Attach the decoded payload to the request
      return true;
    } catch (err) {
      console.error('JWT verification error:', err.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
