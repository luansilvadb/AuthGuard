import 'dotenv/config';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/database.config';
import { Tenant, User, TenantType, TenantStatus, UserRole, UserStatus } from '../entities';
import * as bcrypt from 'bcryptjs';

async function runSeeds() {
  try {
    await AppDataSource.initialize();
    console.log('🚀 Database connected successfully');

    // Create default tenant (Super Admin)
    const tenantRepository = AppDataSource.getRepository(Tenant);
    const userRepository = AppDataSource.getRepository(User);

    // Check if super admin tenant already exists
    let superAdminTenant = await tenantRepository.findOne({
      where: { name: 'Super Admin' },
    });

    if (!superAdminTenant) {
      console.log('📝 Creating Super Admin tenant...');
      
      superAdminTenant = tenantRepository.create({
        name: 'Super Admin',
        schema_name: 'super_admin',
        domain: 'super-admin.authguard.local',
        description: 'Super Admin tenant for system administration',
        type: TenantType.MATRIX,
        status: TenantStatus.ACTIVE,
        settings: {
          maxUsers: -1, // Unlimited
          maxApps: -1,  // Unlimited
          features: ['all'],
        },
        metadata: {
          createdBy: 'system',
          isSystem: true,
        },
      });

      await tenantRepository.save(superAdminTenant);
      console.log('✅ Super Admin tenant created successfully');

      // Create schema for super admin
      await AppDataSource.query(`CREATE SCHEMA IF NOT EXISTS "super_admin"`);
      console.log('✅ Super Admin schema created');
    }

    // Check if super admin user already exists
    const superAdminUser = await userRepository.findOne({
      where: { email: 'superadmin@authguard.local' },
    });

    if (!superAdminUser) {
      console.log('👤 Creating Super Admin user...');
      
      const hashedPassword = await bcrypt.hash('superadmin123', 12);
      
      const newSuperAdmin = userRepository.create({
        first_name: 'Super',
        last_name: 'Admin',
        email: 'superadmin@authguard.local',
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        tenant_id: superAdminTenant.id,
        profile: {
          phone: null,
          avatar: null,
        },
        preferences: {
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          theme: 'light',
        },
      });

      await userRepository.save(newSuperAdmin);
      console.log('✅ Super Admin user created successfully');
    }

    // Create example matrix tenant
    let exampleMatrixTenant = await tenantRepository.findOne({
      where: { name: 'Example Matrix' },
    });

    if (!exampleMatrixTenant) {
      console.log('🏢 Creating example matrix tenant...');
      
      exampleMatrixTenant = tenantRepository.create({
        name: 'Example Matrix',
        schema_name: 'example_matrix',
        domain: 'example-matrix.authguard.local',
        description: 'Example matrix tenant for demonstration',
        type: TenantType.MATRIX,
        status: TenantStatus.ACTIVE,
        settings: {
          maxUsers: 100,
          maxApps: 10,
          features: ['basic', 'advanced'],
        },
        metadata: {
          createdBy: 'system',
          isExample: true,
        },
      });

      await tenantRepository.save(exampleMatrixTenant);
      console.log('✅ Example matrix tenant created successfully');

      // Create schema for example matrix
      await AppDataSource.query(`CREATE SCHEMA IF NOT EXISTS "example_matrix"`);
      console.log('✅ Example matrix schema created');
    }

    // Create example sub-tenant
    let exampleSubTenant = await tenantRepository.findOne({
      where: { name: 'Example Filial' },
    });

    if (!exampleSubTenant) {
      console.log('🏪 Creating example sub-tenant...');
      
      exampleSubTenant = tenantRepository.create({
        name: 'Example Filial',
        schema_name: 'example_filial',
        domain: 'example-filial.authguard.local',
        description: 'Example sub-tenant (filial) for demonstration',
        type: TenantType.SUB_TENANT,
        status: TenantStatus.ACTIVE,
        parent_tenant_id: exampleMatrixTenant.id,
        settings: {
          maxUsers: 50,
          maxApps: 5,
          features: ['basic'],
        },
        metadata: {
          createdBy: 'system',
          isExample: true,
        },
      });

      await tenantRepository.save(exampleSubTenant);
      console.log('✅ Example sub-tenant created successfully');

      // Create schema for example sub-tenant
      await AppDataSource.query(`CREATE SCHEMA IF NOT EXISTS "example_filial"`);
      console.log('✅ Example sub-tenant schema created');
    }

    console.log('🎉 All seeds executed successfully!');
    console.log('\n📋 Default credentials:');
    console.log('Email: superadmin@authguard.local');
    console.log('Password: superadmin123');
    console.log('\n🔗 Access the API documentation at: http://localhost:3000/api/docs');

  } catch (error) {
    console.error('❌ Error running seeds:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

runSeeds(); 