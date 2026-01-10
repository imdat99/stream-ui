import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './middleware';

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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware).forRoutes('*');
  }
}
