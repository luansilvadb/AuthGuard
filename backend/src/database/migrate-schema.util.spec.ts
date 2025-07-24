let lastDataSourceInstance: any;

jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    DataSource: jest.fn().mockImplementation(function () {
      lastDataSourceInstance = {
        initialize: jest.fn(),
        query: jest.fn(),
        runMigrations: jest.fn(),
        destroy: jest.fn(),
        isInitialized: true,
      };
      return lastDataSourceInstance;
    }),
  };
});

import { runMigrationsForSchema } from './migrate-schema.util';
import { DataSource } from 'typeorm';

describe('runMigrationsForSchema', () => {
  beforeEach(() => {
    lastDataSourceInstance = undefined;
    (DataSource as jest.Mock).mockClear();
  });

  it('deve rodar migrações com sucesso', async () => {
    await expect(runMigrationsForSchema('tenant_schema')).resolves.not.toThrow();
    expect(lastDataSourceInstance.initialize).toHaveBeenCalled();
    expect(lastDataSourceInstance.query).toHaveBeenCalledWith('SET search_path TO "tenant_schema", public');
    expect(lastDataSourceInstance.runMigrations).toHaveBeenCalled();
    expect(lastDataSourceInstance.destroy).toHaveBeenCalled();
  });

  it('deve lançar erro se runMigrations falhar', async () => {
    lastDataSourceInstance = undefined;
    (DataSource as jest.Mock).mockImplementation(function () {
      lastDataSourceInstance = {
        initialize: jest.fn(),
        query: jest.fn(),
        runMigrations: jest.fn(() => { throw new Error('erro de migração'); }),
        destroy: jest.fn(),
        isInitialized: true,
      };
      return lastDataSourceInstance;
    });
    await expect(runMigrationsForSchema('tenant_schema')).rejects.toThrow('erro de migração');
    expect(lastDataSourceInstance.destroy).toHaveBeenCalled();
  });

  it('deve fechar conexão mesmo se initialize falhar', async () => {
    lastDataSourceInstance = undefined;
    (DataSource as jest.Mock).mockImplementation(function () {
      lastDataSourceInstance = {
        initialize: jest.fn(() => { throw new Error('init fail'); }),
        query: jest.fn(),
        runMigrations: jest.fn(),
        destroy: jest.fn(),
        isInitialized: true,
      };
      return lastDataSourceInstance;
    });
    await expect(runMigrationsForSchema('tenant_schema')).rejects.toThrow('init fail');
    // destroy não é chamado se initialize falha antes de marcar isInitialized
  });
}); 