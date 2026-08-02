import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";

// 异常过滤器
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException ? exception.getResponse() : "Internal server error";

    // 如果 message 是对象（如 ValidationPipe 返回的），提取 message 字段
    const msg =
      typeof message === "object" && message !== null ? (message as any).message || JSON.stringify(message) : message;

    response.status(status).json({
      code: status === HttpStatus.OK ? 0 : status,
      message: msg,
      data: null,
      timestamp: Date.now(),
      path: request.url,
    });
  }
}
