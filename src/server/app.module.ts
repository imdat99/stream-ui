import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // hono-di:imports
  ],
  controllers: [
    AppController, // hono-di:controllers
  ],
  providers: [
    AppService, // hono-di:providers
  ],
})
export class AppModule {}
