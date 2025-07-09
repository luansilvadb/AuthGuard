import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {
    catch(exception: QueryFailedError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        let message = 'Erro interno do servidor';
        let status = HttpStatus.INTERNAL_SERVER_ERROR;

        const postgresErrorCode = (exception.driverError as any)?.code;
        const detail = (exception.driverError as any)?.detail;

        // PostgreSQL error codes
        // 23505 is unique_violation
        if (postgresErrorCode === '23505') {
            if (detail && detail.includes('Key (email)=(') && detail.includes('already exists.')) {
                message = 'Este e-mail já está em uso. Por favor, utilize outro e-mail.';
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