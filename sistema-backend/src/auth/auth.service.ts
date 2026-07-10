import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import * as bcrypt from 'bcryptjs';
import { UserDocument, UserSchemaName } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private jwtService: JwtService,
    @InjectModel(UserSchemaName) private readonly userModel: Model<UserDocument>,
  ) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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

  // 3. Local Login validation using real DB & bcrypt encription
  async validateLocalUser(email: string, password: string) {
    const user = await this.userModel
      .findOne({ email })
      .select('+password')
      .populate('role')
      .exec();

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.password) {
      throw new UnauthorizedException('Este usuario no tiene contraseña local configurada');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const roleObj = user.role as any;
    const permissions = roleObj?.permissions
      ? roleObj.permissions.map((p: any) => ({
          module: p.module,
          actions: p.actions,
        }))
      : [];

    const mockUser = {
      id: user._id.toString(),
      email: user.email,
      roleName: roleObj?.name || 'USER',
      permissions,
    };

    return this.generateJwt(mockUser);
  }
}
