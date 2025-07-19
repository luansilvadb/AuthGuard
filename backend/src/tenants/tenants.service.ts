import {
  Injectable,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull } from 'typeorm';
import { Tenant } from '../global/entities/tenant.entity';
import { User } from '../global/entities/user.entity';
import { getTenantConnection } from '../shared/database/tenant-connection';
import { Branch } from './entities/branch.entity';
import { TenantMigrationService } from '../shared/database/tenant-migration.service';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private dataSource: DataSource,
    private tenantMigrationService: TenantMigrationService,
  ) {}

  async createTenant(
    userId: number,
    name: string,
    parentTenantId?: number,
  ): Promise<Tenant> {
    this.logger.log(
      `Iniciando criação do tenant: ${name} para o usuário: ${userId}${parentTenantId ? ` (sub-tenant do tenant ${parentTenantId})` : ''}`,
    );
    try {
      // ✅ VALIDAÇÕES ADICIONAIS
      if (!name || name.trim().length < 2) {
        this.logger.warn('Nome do tenant inválido');
        throw new BadRequestException(
          'Nome do tenant deve ter pelo menos 2 caracteres',
        );
      }

      if (name.length > 100) {
        this.logger.warn('Nome do tenant muito longo');
        throw new BadRequestException(
          'Nome do tenant deve ter no máximo 100 caracteres',
        );
      }

      const user = await this.dataSource
        .getRepository(User)
        .findOneBy({ id: userId });

      if (!user) {
        this.logger.warn('Usuário não encontrado');
        throw new BadRequestException('Usuário não encontrado');
      }

      // ✅ NOVA LÓGICA: Verificar se é o primeiro tenant (matriz) ou filial
      const userTenants = await this.findUserTenants(userId);
      const isFirstTenant = userTenants.length === 0;

      if (isFirstTenant) {
        // ✅ CRIAR MATRIZ (primeiro tenant)
        this.logger.log('Criando primeiro tenant (matriz) para o usuário');
        return await this.createMatrixTenant(user, name);
      } else {
        // ✅ CRIAR FILIAL (controlada pela tabela branch dentro do schema da matriz)
        this.logger.log('Criando filial controlada pela matriz');
        return await this.createBranchTenant(user, name, parentTenantId);
      }
    } catch (error) {
      this.logger.error('Erro ao criar tenant:', error);
      throw error;
    }
  }

  // ✅ NOVA FUNÇÃO: Criar matriz (primeiro tenant)
  private async createMatrixTenant(user: User, name: string): Promise<Tenant> {
    // Verificar se usuário já tem tenant com mesmo nome
    const existingTenant = await this.tenantRepository.findOne({
      where: {
        owner: { id: user.id },
        name: name.trim(),
        parentTenantId: IsNull(),
      },
    });

    if (existingTenant) {
      this.logger.warn('Usuário já possui tenant com este nome');
      throw new ConflictException('Você já possui um tenant com este nome');
    }

    // Gerar slug único
    const tenantSlug = await this.generateUniqueSlug(name);
    this.logger.log(`Slug gerado para a matriz: ${tenantSlug}`);

    const tenant = this.tenantRepository.create({
      name: name.trim(),
      slug: tenantSlug,
      owner: user,
      parentTenantId: null, // Matriz não tem parent
    });

    await this.tenantRepository.save(tenant);
    this.logger.log('Matriz salva no banco global. Criando schema...');
    await this.createTenantSchema(tenantSlug);

    // MIGRAÇÃO ROBUSTA
    this.logger.log('Schema criado. Executando migração da matriz...');
    try {
      await this.tenantMigrationService.migrateTenantSchema(tenantSlug);
      this.logger.log('Migração do schema da matriz executada com sucesso!');
    } catch (err) {
      this.logger.error('Erro ao migrar schema do tenant:', err);
      // Opcional: remover o tenant criado se a migração falhar
      // await this.tenantRepository.delete({ slug: tenantSlug });
      throw new Error(
        'Erro ao criar estrutura do tenant. Tente novamente ou contate o suporte.',
      );
    }

    this.logger.log(`Matriz criada com sucesso: ${tenant.slug}`);
    return tenant;
  }

  // ✅ NOVA FUNÇÃO: Criar filial (controlada pela tabela branch dentro do schema da matriz)
  private async createBranchTenant(
    user: User,
    name: string,
    parentTenantId?: number,
  ): Promise<Tenant> {
    // Verificar se o usuário tem matriz
    const userMatrix = await this.tenantRepository.findOne({
      where: {
        owner: { id: user.id },
        parentTenantId: IsNull(), // Apenas matriz
      },
    });

    if (!userMatrix) {
      throw new BadRequestException(
        'Você precisa ter uma matriz antes de criar filiais',
      );
    }

    // Se não especificou parentTenantId, usar a matriz do usuário
    const matrixTenantId = parentTenantId || userMatrix.id;

    // Verificar se o tenant pai existe e é do usuário
    const parentTenant = await this.tenantRepository.findOne({
      where: { id: matrixTenantId },
      relations: ['owner'],
    });

    if (!parentTenant) {
      throw new BadRequestException('Tenant pai não encontrado');
    }

    if (parentTenant.owner?.id !== user.id) {
      throw new BadRequestException(
        'Você não tem permissão para criar filiais neste tenant',
      );
    }

    const tenantConnection = await getTenantConnection(parentTenant.slug);
    const branchRepository = tenantConnection.getRepository(Branch);

    const existingBranch = await branchRepository.findOne({
      where: { name: name.trim() },
    });

    if (existingBranch) {
      throw new ConflictException(
        'Já existe uma filial com este nome nesta matriz',
      );
    }

    const branchSlug = await this.generateUniqueBranchSlug(
      name,
      parentTenant.slug,
    );

    const newBranch = branchRepository.create({
      name: name.trim(),
      slug: branchSlug,
      matrixTenantId: matrixTenantId,
      description: `Filial de ${parentTenant.name}`,
    });

    const branch = await branchRepository.save(newBranch);
    this.logger.log(
      `Filial criada na tabela branch dentro do schema ${parentTenant.slug}: ${branch.slug}`,
    );

    // ✅ CRIAR TENANT VIRTUAL (apenas para referência no schema global)
    const virtualTenant = this.tenantRepository.create({
      name: name.trim(),
      slug: `branch_${branchSlug}`,
      owner: user,
      parentTenantId: matrixTenantId,
      isActive: true,
    });

    await this.tenantRepository.save(virtualTenant);
    this.logger.log(
      `Tenant virtual criado para referência: ${virtualTenant.slug}`,
    );

    return virtualTenant;
  }

  // ✅ NOVA FUNÇÃO: Gerar slug único para branch
  private async generateUniqueBranchSlug(
    name: string,
    matrixTenantSlug: string,
  ): Promise<string> {
    const baseSlug = this.sanitizeName(name);
    let slug = baseSlug;
    let counter = 1;

    while (await this.branchSlugExists(slug, matrixTenantSlug)) {
      slug = `${baseSlug}_${counter}`;
      counter++;
      if (counter > 999) {
        throw new Error('Não foi possível gerar um slug único para a filial');
      }
    }

    return slug;
  }

  // ✅ NOVA FUNÇÃO: Verificar se slug de branch existe
  private async branchSlugExists(
    slug: string,
    matrixTenantSlug: string,
  ): Promise<boolean> {
    const tenantConnection = await getTenantConnection(matrixTenantSlug);
    const branchRepository = tenantConnection.getRepository(Branch);
    const existingBranch = await branchRepository.findOne({
      where: { slug, isActive: true },
    });
    return !!existingBranch;
  }

  // Retorna todos os tenants globais (apenas matrizes)
  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      where: { parentTenantId: IsNull() },
      relations: ['owner', 'subTenants'],
    });
  }

  // Retorna sub-tenants de um tenant específico
  async findSubTenants(parentTenantId: number): Promise<Tenant[]> {
    return this.tenantRepository.find({
      where: { parentTenantId },
      relations: ['owner'],
    });
  }

  // Retorna todos os tenants de um usuário (incluindo sub-tenants)
  async findUserTenants(userId: number): Promise<Tenant[]> {
    return this.tenantRepository.find({
      where: { owner: { id: userId } },
      relations: ['parentTenant', 'subTenants'],
    });
  }

  // ✅ NOVA FUNÇÃO: Retorna branches de uma matriz (dentro do schema da matriz)
  async findBranchesByMatrix(matrixTenantId: number): Promise<Branch[]> {
    const matrix = await this.tenantRepository.findOne({
      where: { id: matrixTenantId },
    });

    if (!matrix) {
      return [];
    }

    const tenantConnection = await getTenantConnection(matrix.slug);
    const branchRepository = tenantConnection.getRepository(Branch);
    return branchRepository.find({
      where: { matrixTenantId, isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  // ✅ NOVA FUNÇÃO: Retorna matriz e filiais de um usuário
  async findUserMatrixAndBranches(userId: number): Promise<{
    matrix: Tenant | null;
    branches: Branch[];
  }> {
    const matrix = await this.tenantRepository.findOne({
      where: { owner: { id: userId }, parentTenantId: IsNull() },
    });

    if (!matrix) {
      return { matrix: null, branches: [] };
    }

    const branches = await this.findBranchesByMatrix(matrix.id);

    return { matrix, branches };
  }

  // ✅ NOVA FUNÇÃO: Geração de slug inteligente com suporte a hierarquia
  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = this.sanitizeName(name);
    let slug = `tenant_${baseSlug}`;
    let counter = 1;

    while (await this.slugExists(slug)) {
      slug = `tenant_${baseSlug}_${counter}`;
      counter++;
      if (counter > 999) {
        throw new Error('Não foi possível gerar um slug único para o tenant');
      }
    }

    if (counter > 1) {
      this.logger.log(`Generated slug after ${counter - 1} attempts: ${slug}`);
    }

    return slug;
  }

  // ✅ NOVA FUNÇÃO: Sanitização do nome
  private sanitizeName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '_') // Remove espaços por underscore
      .replace(/-+/g, '_') // Hífens por underscore
      .replace(/_+/g, '_') // Remove underscores duplicados
      .replace(/^_|_$/g, '') // Remove no início/fim
      .substring(0, 30); // Limita tamanho
  }

  // ✅ NOVA FUNÇÃO: Verificação de unicidade
  private async slugExists(slug: string): Promise<boolean> {
    const existingTenant = await this.tenantRepository.findOne({
      where: { slug },
    });
    return !!existingTenant;
  }

  private async createTenantSchema(schemaName: string): Promise<void> {
    this.logger.log(`Criando schema no banco: ${schemaName}`);
    try {
      await this.dataSource.query(
        `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`,
      );
      this.logger.log(`Schema ${schemaName} criado com sucesso.`);
    } catch (error) {
      this.logger.error('Erro ao criar schema do tenant:', error);
      throw error;
    }
  }
}
