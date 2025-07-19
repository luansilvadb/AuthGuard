import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface Tenant {
  id: number;
  name: string;
  slug: string; // Usar exatamente o slug do backend (ex: 'tenant_luan')
  owner?: {
    id: number;
    email: string;
    name?: string;
  } | null;
  parentTenantId?: number | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export const useTenantStore = defineStore('tenant', () => {
  // Estado
  const currentTenant = ref<Tenant | null>(null);
  const userTenants = ref<Tenant[]>([]);
  const isLoading = ref(false);

  // Getters
  const currentTenantSlug = computed(() => currentTenant.value?.slug || null);
  const hasActiveTenant = computed(() => currentTenant.value !== null);

  // Actions
  function setCurrentTenant(tenant: Tenant) {
    currentTenant.value = tenant;
  }

  function setUserTenants(tenants: Tenant[]) {
    userTenants.value = tenants;
  }

  function clearCurrentTenant() {
    currentTenant.value = null;
  }

  function clearUserTenants() {
    userTenants.value = [];
  }

  // Função para obter headers de tenant para requisições
  function getTenantHeaders() {
    if (!currentTenant.value?.slug) {
      return {};
    }
    return {
      'X-Tenant-Slug': currentTenant.value.slug, // Usar exatamente o slug do backend
    };
  }

  return {
    // Estado
    currentTenant,
    userTenants,
    isLoading,

    // Getters
    currentTenantSlug,
    hasActiveTenant,

    // Actions
    setCurrentTenant,
    setUserTenants,
    clearCurrentTenant,
    clearUserTenants,
    getTenantHeaders,
  };
}); 