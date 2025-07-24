import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionService } from './subscription.service';
import { Subscription, SubscriptionStatus, SubscriptionPlan } from '@/database/entities';
import { Tenant } from '@/database/entities';

const mockTenant: Partial<Tenant> = {
  id: 'tenant-123',
  name: 'Test Tenant',
};

const mockSubscription: Partial<Subscription> = {
  id: 'sub-123',
  tenant_id: 'tenant-123',
  plan: SubscriptionPlan.BASIC,
  status: SubscriptionStatus.ACTIVE,
  start_date: new Date(),
  end_date: new Date(Date.now() + 1000000),
  monthly_price: 10,
};

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let subscriptionRepository: Repository<Subscription>;
  let tenantRepository: Repository<Tenant>;

  const mockSubscriptionRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };
  const mockTenantRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: getRepositoryToken(Subscription), useValue: mockSubscriptionRepository },
        { provide: getRepositoryToken(Tenant), useValue: mockTenantRepository },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    subscriptionRepository = module.get<Repository<Subscription>>(getRepositoryToken(Subscription));
    tenantRepository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));
    jest.clearAllMocks();
  });

  describe('createSubscription', () => {
    it('should create a subscription successfully', async () => {
      mockTenantRepository.findOne.mockResolvedValue(mockTenant);
      mockSubscriptionRepository.findOne.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockReturnValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue(mockSubscription);
      const result = await service.createSubscription('tenant-123', { plan: SubscriptionPlan.BASIC });
      expect(result).toEqual(mockSubscription);
    });
    it('should throw if tenant not found', async () => {
      mockTenantRepository.findOne.mockResolvedValue(null);
      await expect(service.createSubscription('tenant-404', {})).rejects.toThrow('Tenant not found');
    });
    it('should throw if active subscription exists', async () => {
      mockTenantRepository.findOne.mockResolvedValue(mockTenant);
      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      await expect(service.createSubscription('tenant-123', {})).rejects.toThrow('Tenant already has an active subscription');
    });
  });

  describe('getSubscriptionById', () => {
    it('should return subscription by id', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      const result = await service.getSubscriptionById('sub-123', 'tenant-123');
      expect(result).toEqual(mockSubscription);
    });
    it('should throw if not found', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(null);
      await expect(service.getSubscriptionById('sub-404', 'tenant-123')).rejects.toThrow('Subscription not found');
    });
  });

  describe('getActiveSubscription', () => {
    it('should return active subscription', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      const result = await service.getActiveSubscription('tenant-123');
      expect(result).toEqual(mockSubscription);
    });
    it('should return null if not found', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(null);
      const result = await service.getActiveSubscription('tenant-123');
      expect(result).toBeNull();
    });
  });

  describe('getAllSubscriptions', () => {
    it('should return all subscriptions', async () => {
      mockSubscriptionRepository.find.mockResolvedValue([mockSubscription]);
      const result = await service.getAllSubscriptions('tenant-123');
      expect(result).toEqual([mockSubscription]);
    });
  });

  describe('updateSubscription', () => {
    it('should update subscription', async () => {
      jest.spyOn(service, 'getSubscriptionById').mockResolvedValue(mockSubscription as Subscription);
      mockSubscriptionRepository.save.mockResolvedValue({ ...mockSubscription, plan: SubscriptionPlan.ENTERPRISE });
      const result = await service.updateSubscription('sub-123', 'tenant-123', { plan: SubscriptionPlan.ENTERPRISE });
      expect(result.plan).toBe(SubscriptionPlan.ENTERPRISE);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription', async () => {
      jest.spyOn(service, 'getSubscriptionById').mockResolvedValue(mockSubscription as Subscription);
      mockSubscriptionRepository.save.mockResolvedValue({ ...mockSubscription, status: SubscriptionStatus.CANCELLED });
      const result = await service.cancelSubscription('sub-123', 'tenant-123');
      expect(result.status).toBe(SubscriptionStatus.CANCELLED);
    });
  });

  describe('renewSubscription', () => {
    it('should renew cancelled subscription', async () => {
      jest.spyOn(service, 'getSubscriptionById').mockResolvedValue({ ...mockSubscription, status: SubscriptionStatus.CANCELLED } as Subscription);
      mockSubscriptionRepository.save.mockResolvedValue({ ...mockSubscription, status: SubscriptionStatus.ACTIVE });
      const result = await service.renewSubscription('sub-123', 'tenant-123');
      expect(result.status).toBe(SubscriptionStatus.ACTIVE);
    });
    it('should throw if not cancelled', async () => {
      jest.spyOn(service, 'getSubscriptionById').mockResolvedValue({
        ...mockSubscription,
        status: SubscriptionStatus.ACTIVE
      } as Subscription);
      await expect(service.renewSubscription('sub-123', 'tenant-123')).rejects.toHaveProperty('message', 'Only cancelled subscriptions can be renewed');
    });
  });

  describe('getSubscriptionStats', () => {
    it('should return stats', async () => {
      jest.spyOn(service, 'getAllSubscriptions').mockResolvedValue([
        { ...mockSubscription, status: SubscriptionStatus.ACTIVE, monthly_price: 10 } as Subscription,
        { ...mockSubscription, status: SubscriptionStatus.CANCELLED, monthly_price: 5 } as Subscription,
        { ...mockSubscription, status: SubscriptionStatus.EXPIRED, monthly_price: 2 } as Subscription,
      ]);
      const stats = await service.getSubscriptionStats('tenant-123');
      expect(stats.totalSubscriptions).toBe(3);
      expect(stats.activeSubscriptions).toBe(1);
      expect(stats.cancelledSubscriptions).toBe(1);
      expect(stats.expiredSubscriptions).toBe(1);
      expect(stats.totalRevenue).toBe(17);
    });
  });

  describe('checkSubscriptionLimits', () => {
    it('should return false if no active subscription', async () => {
      jest.spyOn(service, 'getActiveSubscription').mockResolvedValue(null);
      const result = await service.checkSubscriptionLimits('tenant-123', 'users');
      expect(result).toBe(false);
    });
    it('should return false if subscription expired', async () => {
      jest.spyOn(service, 'getActiveSubscription').mockResolvedValue({ ...mockSubscription, end_date: new Date(Date.now() - 10000) } as Subscription);
      mockSubscriptionRepository.save.mockResolvedValue({ ...mockSubscription, status: SubscriptionStatus.EXPIRED });
      const result = await service.checkSubscriptionLimits('tenant-123', 'users');
      expect(result).toBe(false);
    });
    it('should check limits for BASIC plan', async () => {
      jest.spyOn(service, 'getActiveSubscription').mockResolvedValue({ ...mockSubscription, plan: SubscriptionPlan.BASIC, end_date: new Date(Date.now() + 10000) } as Subscription);
      const result = await service.checkSubscriptionLimits('tenant-123', 'users');
      expect(result).toBe(true);
    });
    it('should check limits for PROFESSIONAL plan', async () => {
      jest.spyOn(service, 'getActiveSubscription').mockResolvedValue({ ...mockSubscription, plan: SubscriptionPlan.PROFESSIONAL, end_date: new Date(Date.now() + 10000) } as Subscription);
      const result = await service.checkSubscriptionLimits('tenant-123', 'users');
      expect(result).toBe(true);
    });
    it('should check limits for ENTERPRISE plan', async () => {
      jest.spyOn(service, 'getActiveSubscription').mockResolvedValue({ ...mockSubscription, plan: SubscriptionPlan.ENTERPRISE, end_date: new Date(Date.now() + 10000) } as Subscription);
      const result = await service.checkSubscriptionLimits('tenant-123', 'users');
      expect(result).toBe(true);
    });
    it('should return false for unknown plan', async () => {
      jest.spyOn(service, 'getActiveSubscription').mockResolvedValue({ ...mockSubscription, plan: 'unknown' as any, end_date: new Date(Date.now() + 10000) } as Subscription);
      const result = await service.checkSubscriptionLimits('tenant-123', 'users');
      expect(result).toBe(false);
    });
  });
}); 