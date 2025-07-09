import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppMessages } from '../../common/messages'; // Import AppMessages

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = AppMessages.INTERNAL_SERVER_ERROR;
        let errorName = 'InternalServerError';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const errorResponse = exception.getResponse();

            if (typeof errorResponse === 'string') {
                message = errorResponse;
            } else if (typeof errorResponse === 'object' && errorResponse !== null) {
                if ('message' in errorResponse) {
                    if (Array.isArray((errorResponse as any).message)) {
                        message = (errorResponse as any).message.join('; ');
                    } else {
                        message = (errorResponse as any).message;
                    }
                }
                errorName = (errorResponse as any).error || exception.name;
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