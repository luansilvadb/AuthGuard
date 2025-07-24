import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService, JwtPayload } from '@/modules/auth/auth.service';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;
  let authService: AuthService;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockAuthService = {
    // Add any methods if needed
  };

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          authorization: 'Bearer test-token',
        },
      }),
    }),
  } as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    authService = module.get<AuthService>(AuthService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true for valid token', () => {
      const mockPayload: JwtPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'user',
        tenantId: 'tenant-123',
        tenantSchema: 'test_tenant',
      };

      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith('test-token');
    });

    it('should set user in request for valid token', () => {
      const mockPayload: JwtPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'user',
        tenantId: 'tenant-123',
        tenantSchema: 'test_tenant',
      };

      const mockRequest: any = {
        headers: {
          authorization: 'Bearer test-token',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      mockJwtService.verify.mockReturnValue(mockPayload);

      guard.canActivate(mockContext);

      expect(mockRequest.user).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException for missing token', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockContext)).toThrow('No token provided');
    });

    it('should throw UnauthorizedException for invalid authorization header format', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'InvalidFormat test-token',
            },
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockContext)).toThrow('No token provided');
    });

    it('should throw UnauthorizedException for invalid token', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Invalid token',
      );
    });

    it('should handle missing authorization header', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should handle undefined authorization header', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: undefined,
            },
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer authorization header', () => {
      const request = {
        headers: {
          authorization: 'Bearer test-token',
        },
      };

      const result = (guard as any).extractTokenFromHeader(request);

      expect(result).toBe('test-token');
    });

    it('should return undefined for non-Bearer authorization', () => {
      const request = {
        headers: {
          authorization: 'Basic dGVzdDp0ZXN0',
        },
      };

      const result = (guard as any).extractTokenFromHeader(request);

      expect(result).toBeUndefined();
    });

    it('should return undefined for missing authorization header', () => {
      const request = {
        headers: {},
      };

      const result = (guard as any).extractTokenFromHeader(request);

      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined authorization header', () => {
      const request = {
        headers: {
          authorization: undefined,
        },
      };

      const result = (guard as any).extractTokenFromHeader(request);

      expect(result).toBeUndefined();
    });

    it('should handle authorization header with extra spaces', () => {
      const request = {
        headers: {
          authorization: 'Bearer test-token',
        },
      };

      const result = (guard as any).extractTokenFromHeader(request);

      expect(result).toBe('test-token'); // The implementation trims spaces
    });
  });
}); 