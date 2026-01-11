import { Controller, Get } from "@nestjs/common";

@Controller('auth')
export class AuthController {
  constructor() {}

  @Get('/')
  index() {
    return { message: 'Auth Controller is working' };
    // throw new Error('Not implemented');
    // return 'Hello Auth';
  }
}
