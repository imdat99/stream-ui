// Source - https://stackoverflow.com/a
// Posted by Stark Jeon
// Retrieved 2026-01-10, License - CC BY-SA 4.0

import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Context } from "hono";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  async use(request: Request, response: Response, next: any) {
    const start = Date.now()
    // console.log("Request:", request.method, request.url, arguments[2].toString());
    // const { ip, method, originalUrl } = request;
    // const userAgent = request.get("user-agent") || "";
    const ctx = arguments[2] as Context;
    // ctx
    // response.on("finish", () => {
    //   const { statusCode } = response;
    //   const contentLength = response.get("content-length");

    //   this.logger.log(
    //     `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
    //   );
    // });
    await next().finally(() => {
         const ms = Date.now() - start
          this.logger.log(
            `${request.method} ${request.url} - ${ms}ms`,
      ) ;
    });
  }
}
