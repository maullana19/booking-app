import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllexceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    // Status
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const messageText =
      typeof message === 'string'
        ? message
        : (message as any).message || 'An Error Occured';

    res.status(status).json({
      statusCode: status,
      message: messageText,
      timestamp: new Date().toISOString(),
      path: req.url,
      // error: exception instanceof HttpException ? exception.name : 'Internal Server Error',
    });
  }
}
