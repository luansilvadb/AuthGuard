import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { DataSource } from 'typeorm';

@Injectable()
export class TenantSchemaInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenant = request.tenant;

    if (tenant && tenant.schema_name) {
      // Set the schema for the current request
      this.dataSource.query(`SET search_path TO ${tenant.schema_name}, public`);
    }

    return next.handle();
  }
} 