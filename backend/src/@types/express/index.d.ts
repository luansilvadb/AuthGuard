import { DataSource } from 'typeorm';
import { Software } from '../../global/entities/software.entity';
import { SoftwareLicense } from '../../tenants/entities/software-license.entity';
import { Tenant } from '../../global/entities/tenant.entity';
import { User } from '../../global/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      tenantConnection?: DataSource;
      softwareCode?: string;
      tenantSlug?: string;
      softwareConnection?: any;
      currentSoftware?: Software;
      currentTenant?: Tenant;
      currentLicense?: SoftwareLicense;
      currentUser?: User;
    }
  }
}
