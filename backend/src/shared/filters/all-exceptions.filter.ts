import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppMessages } from '../../common/messages'; // Import AppMessages

interface HttpErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = AppMessages.INTERNAL_SERVER_ERROR;
    let errorName = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (typeof errorResponse === 'object' && errorResponse !== null) {
        if ('message' in errorResponse) {
          const typedErrorResponse = errorResponse as HttpErrorResponse; // Type assertion here
          if (Array.isArray(typedErrorResponse.message)) {
            message = typedErrorResponse.message.join('; ');
          } else {
            message = typedErrorResponse.message;
          }
        }
        if ('error' in errorResponse) {
          errorName =
            (errorResponse as HttpErrorResponse).error || exception.name;
        } else {
          errorName = exception.name;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorName = exception.name;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error: errorName,
    });
  }
}
