import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

type ErrorBody = {
  statusCode: number;
  message: string;
  errors?: unknown;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let errors: unknown;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        const body = res as { message?: string | string[]; error?: string };
        if (Array.isArray(body.message)) {
          message = body.message.join(', ');
          errors = body.message;
        } else {
          message = body.message ?? body.error ?? message;
        }
      }
    }

    const payload: ErrorBody = { statusCode: status, message };
    if (errors !== undefined) payload.errors = errors;

    response.status(status).json(payload);
  }
}
