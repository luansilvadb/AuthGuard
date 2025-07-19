<template>
  <div class="create-tenant-bg">
    <div class="create-tenant-card">
      <div class="icon-container">
        <span class="icon-house">{{ isFirstTenant ? '🏢' : '🏪' }}</span>
      </div>
      <h2 class="title">{{ isFirstTenant ? 'Criar sua primeira empresa (Matriz)' : 'Criar nova filial' }}</h2>
      <p class="subtitle">
        {{ isFirstTenant 
          ? 'Crie sua empresa matriz. Esta será sua organização principal onde você poderá gerenciar todas as filiais.' 
          : 'Crie uma nova filial que será controlada pela sua matriz através do sistema de branches.' 
        }}
      </p>
      <a-form
        :model="form"
        :rules="rules"
        ref="formRef"
        layout="vertical"
        class="tenant-form"
        @submit.prevent="handleSubmit"
      >
        <a-form-item label="Nome da organização" name="name" :rules="rules.name">
          <a-input v-model:value="form.name" placeholder="Minha empresa" size="large" />
        </a-form-item>
        
        <!-- Seleção de matriz (apenas se não for o primeiro tenant) -->
        <a-form-item 
          v-if="!isFirstTenant && availableMatrices.length > 0" 
          label="Empresa Matriz" 
          name="parentTenantId"
        >
          <a-select
            v-model:value="form.parentTenantId"
            placeholder="Selecione a empresa matriz"
            size="large"
            :loading="loadingMatrices"
          >
            <a-select-option 
              v-for="matrix in availableMatrices" 
              :key="matrix.id" 
              :value="matrix.id"
            >
              {{ matrix.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="Região de dados" name="region">
          <div class="region-selector">
            <a-button
              v-for="region in regions"
              :key="region.value"
              :type="form.region === region.value ? 'primary' : 'default'"
              @click="form.region = region.value"
              class="region-btn"
            >
              <span v-if="region.flag" :class="region.flag" style="margin-right: 6px"></span>
              {{ region.label }}
            </a-button>
          </div>
        </a-form-item>
        
        <a-form-item label="Convidar colaboradores por email" name="collaborators">
          <a-input
            v-model:value="form.collaborators"
            placeholder="johndoe@example.com"
            size="large"
            allow-clear
          />
        </a-form-item>
        
        <div class="footer-btn">
          <a-button type="primary" size="large" @click="handleSubmit" :loading="loading">
            {{ isFirstTenant ? 'Criar Matriz' : 'Criar Filial' }}
          </a-button>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { Cookies } from 'quasar';
import type { AxiosError } from 'axios';
import { useTenantStore } from 'src/stores/tenant-store';

const formRef = ref();
const loading = ref(false);
const form = ref({
  name: '',
  region: 'europe',
  collaborators: '',
  parentTenantId: undefined as number | undefined,
});

const rules = {
  name: [ { required: true, message: 'Informe o nome da organização', trigger: 'blur' } ],
};

const regions = [
  { value: 'europe', label: 'Europe', flag: 'flag-europe' },
  { value: 'us', label: 'West US', flag: 'flag-us' },
  { value: 'australia', label: 'Australia', flag: 'flag-australia' },
  { value: 'japan', label: 'Japan', flag: 'flag-japan' },
];

const router = useRouter();
const route = useRoute();
const internalInstance = getCurrentInstance();
const tenantStore = useTenantStore();

// Estado para verificar se é o primeiro tenant
const isFirstTenant = ref(true);
const availableMatrices = ref<{ id: number; name: string; slug: string }[]>([]);
const loadingMatrices = ref(false);

onMounted(async () => {
  // Verificar se é o primeiro tenant
  await checkIfFirstTenant();
  
  // Se tem parentTenantId na URL, não é o primeiro tenant
  if (route.query.parentTenantId) {
    isFirstTenant.value = false;
    form.value.parentTenantId = Number(route.query.parentTenantId);
  }
  
  // Carregar matrizes disponíveis se não for o primeiro tenant
  if (!isFirstTenant.value) {
    await loadAvailableMatrices();
  }
});

async function checkIfFirstTenant() {
  try {
    const $api = internalInstance?.appContext.config.globalProperties.$api;
    if (!$api) throw new Error('API client not available');
    const token = Cookies.get('token');
    if (!token) throw new Error('Token de autenticação não encontrado');
    
    const response = await $api.get('/tenants/my-tenants', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Se não tem tenants, é o primeiro
    isFirstTenant.value = response.data.length === 0;
  } catch (err: unknown) {
    console.error('Erro ao verificar tenants:', err);
    // Em caso de erro, assume que é o primeiro tenant
    isFirstTenant.value = true;
  }
}

async function loadAvailableMatrices() {
  loadingMatrices.value = true;
  try {
    const $api = internalInstance?.appContext.config.globalProperties.$api;
    if (!$api) throw new Error('API client not available');
    const token = Cookies.get('token');
    if (!token) throw new Error('Token de autenticação não encontrado');
    
    const response = await $api.get('/tenants/my-matrix-and-branches', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Filtrar apenas matrizes (sem parentTenantId)
    availableMatrices.value = response.data.matrix ? [response.data.matrix] : [];
  } catch (err: unknown) {
    console.error('Erro ao carregar matrizes:', err);
  } finally {
    loadingMatrices.value = false;
  }
}

function handleSubmit() {
  formRef.value?.validate().then(async () => {
    loading.value = true;
    try {
      const $api = internalInstance?.appContext.config.globalProperties.$api;
      if (!$api) throw new Error('API client not available');
      const token = Cookies.get('token');
      if (!token) throw new Error('Token de autenticação não encontrado');
      
      const payload = {
        name: form.value.name,
        parentTenantId: form.value.parentTenantId,
        // region e collaborators podem ser enviados se o backend aceitar
      };
      
      const response = await $api.post('/tenants', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Armazenar o tenant criado no store com o slug correto do backend
      const createdTenant = response.data;
      tenantStore.setCurrentTenant(createdTenant);
      
      const successMessage = isFirstTenant.value 
        ? 'Matriz criada com sucesso!' 
        : 'Filial criada com sucesso!';
      message.success(successMessage);
      
      // Redirecionar para dashboard ou lista de tenants
      if (isFirstTenant.value) {
        await router.push('/dashboard');
      } else {
        await router.push('/tenants');
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      message.error((axiosError?.response?.data as { message?: string })?.message || 'Erro ao criar organização');
    } finally {
      loading.value = false;
    }
  });
}
</script>

<style scoped>
.create-tenant-bg {
  min-height: 100vh;
  background: #f4f4fa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.create-tenant-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 32px 0 rgba(80, 80, 160, 0.08);
  padding: 48px 40px 32px 40px;
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.icon-container {
  background: linear-gradient(135deg, #a78bfa 0%, #6366f1 100%);
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}
.icon-house {
  font-size: 2rem;
  color: #fff;
}
.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1e293b;
  text-align: center;
}
.subtitle {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 28px;
  text-align: center;
}
.tenant-form {
  width: 100%;
}
.region-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.region-btn {
  min-width: 100px;
  height: 40px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.region-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.footer-btn {
  margin-top: 24px;
  width: 100%;
}
.footer-btn .ant-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
}
</style> 