import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body('token') token: string) {
    // Validate Google Token
    const profile = await this.authService.validateGoogleToken(token);
    
    // In a real application, you would find or create the user in MongoDB here:
    // const user = await this.usersService.findOrCreateSocialUser(profile, 'google');
    // For the boilerplate, we simulate finding/creating a user:
    const mockUser = {
      id: 'mock-user-id-google',
      email: profile.email,
      roleName: 'USER',
      permissions: [
        { module: 'Ventas', actions: ['read', 'create'] },
        { module: 'Clientes', actions: ['read'] }
      ]
    };

    return this.authService.generateJwt(mockUser);
  }

  @Post('facebook')
  @HttpCode(HttpStatus.OK)
  async facebookLogin(@Body('token') token: string) {
    // Validate Facebook Token
    const profile = await this.authService.validateFacebookToken(token);

    // Simulate finding/creating a user:
    const mockUser = {
      id: 'mock-user-id-facebook',
      email: profile.email || 'facebook-user@example.com',
      roleName: 'USER',
      permissions: [
        { module: 'Ventas', actions: ['read'] }
      ]
    };

    return this.authService.generateJwt(mockUser);
  }
}
