import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Request, Response } from 'express'; // Import Request and Response
import { AppMessages } from '../../common/messages'; // Import AppMessages

interface PostgresError extends Error {
  code: string;
  detail: string;
}

@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>(); // Explicitly type response
    const request = ctx.getRequest<Request>(); // Explicitly type request

    let message = AppMessages.INTERNAL_SERVER_ERROR; // Use centralized message
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    const driverError = exception.driverError as PostgresError; // Type assertion for driverError

    // PostgreSQL error codes
    // 23505 is unique_violation
    if (driverError && driverError.code === '23505') {
      if (
        driverError.detail &&
        driverError.detail.includes('Key (email)=(') &&
        driverError.detail.includes('already exists.')
      ) {
        message = AppMessages.USER_EMAIL_ALREADY_EXISTS; // Use centralized message
      } else {
        message = 'Entrada duplicada.'; // More generic message for other unique constraints
      }
      status = HttpStatus.CONFLICT;
    } else {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
