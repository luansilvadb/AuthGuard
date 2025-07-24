import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { DataSource } from 'typeorm';
import { TenantSchemaInterceptor } from './tenant-schema.interceptor';

describe('TenantSchemaInterceptor', () => {
  let interceptor: TenantSchemaInterceptor;
  let dataSource: DataSource;

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantSchemaInterceptor,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    interceptor = module.get<TenantSchemaInterceptor>(TenantSchemaInterceptor);
    dataSource = module.get<DataSource>(DataSource);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should set schema when tenant is present', () => {
      const mockTenant = {
        id: 'tenant-123',
        schema_name: 'test_tenant',
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            tenant: mockTenant,
          }),
        }),
      } as ExecutionContext;

      const mockCallHandler = {
        handle: () => of('test result'),
      } as CallHandler;

      interceptor.intercept(mockContext, mockCallHandler).subscribe();

      expect(mockDataSource.query).toHaveBeenCalledWith(
        'SET search_path TO test_tenant, public',
      );
    });

    it('should not set schema when tenant is not present', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            tenant: null,
          }),
        }),
      } as ExecutionContext;

      const mockCallHandler = {
        handle: () => of('test result'),
      } as CallHandler;

      interceptor.intercept(mockContext, mockCallHandler).subscribe();

      expect(mockDataSource.query).not.toHaveBeenCalled();
    });

    it('should not set schema when tenant has no schema_name', () => {
      const mockTenant = {
        id: 'tenant-123',
        schema_name: null,
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            tenant: mockTenant,
          }),
        }),
      } as ExecutionContext;

      const mockCallHandler = {
        handle: () => of('test result'),
      } as CallHandler;

      interceptor.intercept(mockContext, mockCallHandler).subscribe();

      expect(mockDataSource.query).not.toHaveBeenCalled();
    });

    it('should return the observable from call handler', (done) => {
      const mockTenant = {
        id: 'tenant-123',
        schema_name: 'test_tenant',
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            tenant: mockTenant,
          }),
        }),
      } as ExecutionContext;

      const expectedResult = 'test result';
      const mockCallHandler = {
        handle: () => of(expectedResult),
      } as CallHandler;

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBe(expectedResult);
          done();
        },
        error: done,
      });
    });
  });
}); 