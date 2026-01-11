import { BadRequestException, Injectable } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';
import { MSG } from '../constant/messages';

@Injectable()
export class CustomZodValidationPipe extends ZodValidationPipe {
  protected exceptionFactory(error: ZodError) {
    return new BadRequestException(
      error,
      MSG.RESPONSE.BAD_REQUEST,
    );
  }
}
