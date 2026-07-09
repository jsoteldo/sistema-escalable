import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(private jwtService: JwtService) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  // 1. Social Token Validations
  async validateGoogleToken(token: string): Promise<{ email: string; name: string; id: string }> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Token de Google inválido');
      }
      return {
        email: payload.email,
        name: payload.name,
        id: payload.sub,
      };
    } catch (error) {
      throw new UnauthorizedException('Error validando token con Google: ' + error.message);
    }
  }

  async validateFacebookToken(token: string): Promise<{ email: string; name: string; id: string }> {
    try {
      const url = `https://graph.facebook.com/me?fields=id,name,email&access_token=${token}`;
      const response = await axios.get(url);
      const data = response.data;
      if (!data || data.error) {
        throw new UnauthorizedException('Token de Facebook inválido');
      }
      return {
        email: data.email,
        name: data.name,
        id: data.id,
      };
    } catch (error) {
      throw new UnauthorizedException('Error validando token con Facebook: ' + error.message);
    }
  }

  // 2. Local JWT Generation
  async generateJwt(user: { id: string; email: string; roleName: string; permissions: Array<{ module: string; actions: string[] }> }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.roleName,
      permissions: user.permissions, // permission matrix included in the payload
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // 3. Local Login validation
  async validateLocalUser(email: string, password: string) {
    if (email === 'admin@correo.com' && password === 'admin123') {
      const mockUser = {
        id: 'mock-user-id-admin',
        email: 'admin@correo.com',
        roleName: 'ADMIN',
        permissions: [
          { module: 'Ventas', actions: ['read', 'create', 'delete', 'update'] },
          { module: 'Clientes', actions: ['read'] },
        ],
      };
      return this.generateJwt(mockUser);
    }
    throw new UnauthorizedException('Credenciales inválidas');
  }
}
