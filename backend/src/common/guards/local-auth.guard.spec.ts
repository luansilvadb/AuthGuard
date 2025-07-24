import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from '@/modules/auth/auth.service';

// Mock PassportStrategy
jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn().mockImplementation((strategy) => {
    return class MockAuthGuard {
      canActivate() {
        return true;
      }
    };
  }),
}));

describe('LocalAuthGuard', () => {
  let guard: LocalAuthGuard;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalAuthGuard,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    guard = module.get<LocalAuthGuard>(LocalAuthGuard);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            body: {
              email: 'test@example.com',
              password: 'password123',
            },
          }),
          getResponse: jest.fn(),
        }),
      } as unknown as ExecutionContext;

      mockAuthService.validateUser.mockResolvedValue(mockUser);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            body: {
              email: 'invalid@example.com',
              password: 'wrongpassword',
            },
          }),
          getResponse: jest.fn(),
        }),
      } as unknown as ExecutionContext;

      mockAuthService.validateUser.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        'invalid@example.com',
        'wrongpassword',
      );
    });

    it('should handle missing credentials', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            body: {},
          }),
          getResponse: jest.fn(),
        }),
      } as unknown as ExecutionContext;

      mockAuthService.validateUser.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });
  });
}); 