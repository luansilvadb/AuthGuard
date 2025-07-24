import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus, SubscriptionPlan } from '@/database/entities';
import { Tenant } from '@/database/entities';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async createSubscription(
    tenantId: string,
    subscriptionData: Partial<Subscription>,
  ): Promise<Subscription> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if tenant already has an active subscription
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: {
        tenant_id: tenantId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existingSubscription) {
      throw new ConflictException('Tenant already has an active subscription');
    }

    const subscription = this.subscriptionRepository.create({
      ...subscriptionData,
      tenant_id: tenantId,
      status: SubscriptionStatus.ACTIVE,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async getSubscriptionById(
    subscriptionId: string,
    tenantId: string,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, tenant_id: tenantId },
      relations: ['tenant'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async getActiveSubscription(tenantId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: {
        tenant_id: tenantId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['tenant'],
    });
  }

  async getAllSubscriptions(tenantId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { tenant_id: tenantId },
      relations: ['tenant'],
      order: { created_at: 'DESC' },
    });
  }

  async updateSubscription(
    subscriptionId: string,
    tenantId: string,
    updateData: Partial<Subscription>,
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(subscriptionId, tenantId);

    Object.assign(subscription, updateData);
    return this.subscriptionRepository.save(subscription);
  }

  async cancelSubscription(
    subscriptionId: string,
    tenantId: string,
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(subscriptionId, tenantId);

    subscription.status = SubscriptionStatus.CANCELLED;

    return this.subscriptionRepository.save(subscription);
  }

  async renewSubscription(
    subscriptionId: string,
    tenantId: string,
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(subscriptionId, tenantId);

    if (subscription.status !== SubscriptionStatus.CANCELLED) {
      throw new ConflictException('Only cancelled subscriptions can be renewed');
    }

    subscription.status = SubscriptionStatus.ACTIVE;

    return this.subscriptionRepository.save(subscription);
  }

  async getSubscriptionStats(tenantId: string): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    expiredSubscriptions: number;
    totalRevenue: number;
  }> {
    const subscriptions = await this.getAllSubscriptions(tenantId);

    const stats = {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(
        (s) => s.status === SubscriptionStatus.ACTIVE,
      ).length,
      cancelledSubscriptions: subscriptions.filter(
        (s) => s.status === SubscriptionStatus.CANCELLED,
      ).length,
      expiredSubscriptions: subscriptions.filter(
        (s) => s.status === SubscriptionStatus.EXPIRED,
      ).length,
      totalRevenue: subscriptions.reduce((sum, s) => sum + (s.monthly_price || 0), 0),
    };

    return stats;
  }

  async checkSubscriptionLimits(
    tenantId: string,
    feature: string,
  ): Promise<boolean> {
    const subscription = await this.getActiveSubscription(tenantId);

    if (!subscription) {
      return false;
    }

    // Check if subscription is expired
    if (subscription.end_date && subscription.end_date < new Date()) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionRepository.save(subscription);
      return false;
    }

    // Check feature limits based on subscription plan
    switch (subscription.plan) {
      case SubscriptionPlan.BASIC:
        return this.checkBasicLimits(feature);
      case SubscriptionPlan.PROFESSIONAL:
        return this.checkProfessionalLimits(feature);
      case SubscriptionPlan.ENTERPRISE:
        return true; // Enterprise has no limits
      default:
        return false;
    }
  }

  private checkBasicLimits(feature: string): boolean {
    const basicLimits = {
      users: 10,
      applications: 2,
      storage: 1024, // MB
    };

    // This would be implemented with actual usage tracking
    return true;
  }

  private checkProfessionalLimits(feature: string): boolean {
    const professionalLimits = {
      users: 100,
      applications: 10,
      storage: 10240, // MB
    };

    // This would be implemented with actual usage tracking
    return true;
  }
} 