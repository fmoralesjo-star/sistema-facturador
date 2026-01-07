import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('firebase')
export class FirebaseController {
  constructor(private firebaseAuthService: FirebaseAuthService) {}

  @Post('verify-token')
  async verifyToken(@Body() body: { token: string }) {
    try {
      const decodedToken = await this.firebaseAuthService.verifyToken(body.token);
      return {
        valid: true,
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  @Get('user')
  @UseGuards(FirebaseAuthGuard)
  async getCurrentUser(@CurrentUser() user: any) {
    return {
      uid: user.uid,
      email: user.email,
      name: user.name,
      picture: user.picture,
    };
  }
}


