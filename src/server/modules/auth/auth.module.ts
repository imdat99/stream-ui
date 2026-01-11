import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    // hono-di:imports
  ],
  controllers: [
    AuthController, // hono-di:controllers
  ],
  providers: [
    AuthService, // hono-di:providers
  ],
})
export class AuthModule {}
