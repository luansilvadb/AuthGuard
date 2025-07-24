import 'reflect-metadata';

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DB_HOST = 'vps.luansilva.com.br';
process.env.DB_PORT = '5432';
process.env.DB_USERNAME = 'postgres';
process.env.DB_PASSWORD = '72b09a20c609e6baa62d';
process.env.DB_NAME = 'authguard';
process.env.BCRYPT_ROUNDS = '10';
process.env.CORS_ORIGIN = '*';
process.env.API_PREFIX = 'api/v1';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 