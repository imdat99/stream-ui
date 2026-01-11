import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as path from 'path';
import { MSG } from '../constant/messages';
import { Context } from 'hono';
import { HttpAdapterHost } from '@nestjs/core';
import { sendResult } from '../adapter/hono/_util';
import { HonoResponse } from '../adapter/hono';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  private convertStack(stack: string): string {
    return stack
      .split('\n')
      .map((row) => row.trim())[0];
  }

  async catch(exception: any, host: ArgumentsHost) {
    // console.log(host.getArgs());
    this.logger.error(this.convertStack(exception.stack));
    // this.logger.error(JSON.stringify(exception, null, 2));
    const ctx = host.switchToHttp().getResponse<HonoResponse>();
    // const request = ctx.getRequest<Request>();
    // const response = ctx.getResponse();
    let statusCode: any = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = MSG.RESPONSE.INTERNAL_SERVER_ERROR;
    if (exception instanceof HttpException) {
      [statusCode, message] = this.handleHttpException(exception);
    }
    if (
      String(exception.name) === 'QueryFailedError' &&
      exception.errno === 1062
    ) {
      [statusCode, message] = this.handleConflict();
    }
    if (String(exception.name) === 'ValidationError') {
      [statusCode, message] = this.handleValidatorError(exception);
    }
    if (String(exception.name) === 'BadRequestException') {
      [statusCode, message] = this.handleValidatorError(exception);
    }
    if (String(exception.name) === 'UnauthorizedException') {
      [statusCode, message] = this.handleAuthError(exception);
    }

    // const user = request.user as User;
    const time = new Date().toLocaleString();
    const routePath = `${ctx.req.method} ${ctx.req.url}`;
    const errorObject = {
      error: {
        time,
        message,
        path: routePath,
        detail: {
          stack: this.convertStack(exception.stack),
        },
      },
      exception: exception.code || exception.name,
      statusCode,
    };
    // sendResult(ctx, {});
    ctx.status(statusCode);
    ctx.send(errorObject);
    // mountResponse
    // httpAdapter.reply(ctx, errorObject, statusCode);
    // return ctx.json(errorObject);
    // ctx.set("__nest_response", ctx.json(errorObject, statusCode));
    // return response.status(500).json({
    //   statusCode: 500,
    //   message: "Internal server error",
    // });
  }

  handleHttpException(exception: any) {
    const statusCode = Number(exception.getStatus());
    const message = exception.response.error;
    return [statusCode, message];
  }

  handleAuthError(exception: any) {
    const statusCode = Number(exception.getStatus());
    const message = exception.response.message;
    return [statusCode, message];
  }

  handleValidatorError(exception: any) {
    const statusCode = HttpStatus.BAD_REQUEST;
    const message = exception.response.message[0].constraints;
    return [statusCode, message];
  }

  handleConflict() {
    const statusCode = HttpStatus.CONFLICT;
    const message = `${MSG.FRONTEND.USERNAME_DUPLICATED} OR ${MSG.FRONTEND.EMAIL_DUPLICATED}`;
    return [statusCode, message];
  }
}
