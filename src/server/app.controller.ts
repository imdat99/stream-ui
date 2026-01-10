// import { Controller, Get } from '@hono-di/core';

import { Controller, Get } from "@nestjs/common";

@Controller('app')
export class AppController {
  constructor() {}

  @Get('/')
  index() {
    return 'Hello App';
  }
}
