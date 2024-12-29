import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from './auth.service';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = client.handshake.auth.token;
      
      if (!token) {
        throw new WsException('Unauthorized');
      }

      const user = await this.authService.validateToken(token);
      client.data.user = user;
      return true;
    } catch {
      throw new WsException('Unauthorized');
    }
  }
} 