import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";

// 异常过滤器
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException ? exception.getResponse() : "Internal server error";

    let msg = "Internal server error";

    if (typeof payload === "string") {
      msg = payload;
    } else if (payload && typeof payload === "object") {
      const responseBody = payload as { message?: string | string[] };

      if (Array.isArray(responseBody.message)) {
        msg = responseBody.message.join("；");
      } else if (typeof responseBody.message === "string") {
        msg = responseBody.message;
      } else {
        msg = JSON.stringify(payload);
      }
    }

    response.status(status).json({
      code: status === HttpStatus.OK ? 0 : status,
      message: msg,
      data: null,
      timestamp: Date.now(),
      path: request.url,
    });
  }
}
