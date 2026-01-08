import { Controller, Get } from '@hono-di/core';

@Controller('user')
export class UserController {
  constructor() {}

  @Get('/')
  index() {
    return 'Hello User';
  }
}
