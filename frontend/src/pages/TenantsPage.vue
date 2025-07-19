<template>
  <div class="tenants-container">
    <div class="tenants-header tenants-header--top-flex">
      <h2 class="tenants-table-title">Empresa Matriz e Filiais ({{ totalOrganizations }})</h2>
      <div class="header-actions">
        <a-button type="primary" class="new-tenant-btn" @click="openCreateModal">
          + Nova Organização
        </a-button>
      </div>
    </div>
    
    <div class="tenants-table-card">
      <div class="tenants-table-header">
        <a-input-search
          v-model:value="search"
          placeholder="Buscar matriz e filiais..."
          class="tenants-search"
          allow-clear
        />
      </div>
      
      <!-- Seção da Matriz -->
      <div v-if="userMatrix" class="matrix-section">
        <h3 class="section-title">
          <TeamOutlined /> Empresa Matriz
        </h3>
        <a-table
          :dataSource="[userMatrix]"
          :columns="matrixColumns"
          :pagination="false"
          rowKey="id"
          class="matrix-table"
          bordered
          :loading="loading"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'org'">
              <div class="org-cell">
                <div class="org-icon matrix-icon">
                  <TeamOutlined />
                </div>
                <div>
                  <div class="org-name">{{ record.name }}</div>
                  <div class="org-id">ID: {{ record.id }}</div>
                  <div class="org-type">Matriz</div>
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'schema'">
              <span class="schema-badge matrix-badge">{{ record.slug }}</span>
            </template>
            <template v-else-if="column.key === 'owner'">
              <span class="owner-badge">
                <UserOutlined /> {{ record.owner?.name || 'N/A' }}
              </span>
            </template>
            <template v-else-if="column.key === 'status'">
              <Tag :color="record.isActive ? 'green' : 'red'" class="status-tag">
                {{ record.isActive ? 'Ativo' : 'Inativo' }}
              </Tag>
            </template>
            <template v-else-if="column.key === 'created'">
              <span class="created-badge">
                <CalendarOutlined /> {{ formatDate(record.createdAt) }}
              </span>
            </template>
            <template v-else-if="column.key === 'actions'">
              <div class="action-buttons">
                <a-button 
                  type="text" 
                  size="small" 
                  @click="createBranch(record)"
                  title="Criar filial"
                >
                  <template #icon><PlusOutlined /></template>
                  Nova Filial
                </a-button>
                <a-button type="text" size="small" @click="openEditModal(record)">
                  <template #icon><EditOutlined /></template>
                </a-button>
              </div>
            </template>
          </template>
        </a-table>
      </div>

      <!-- Seção das Filiais -->
      <div v-if="userBranches.length > 0" class="branches-section">
        <h3 class="section-title">
          <FolderOutlined /> Filiais ({{ userBranches.length }})
        </h3>
        <a-table
          :dataSource="filteredBranches"
          :columns="branchColumns"
          :pagination="false"
          rowKey="id"
          class="branches-table"
          bordered
          :loading="loading"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'org'">
              <div class="org-cell">
                <div class="org-icon branch-icon">
                  <FolderOutlined />
                </div>
                <div>
                  <div class="org-name">{{ record.name }}</div>
                  <div class="org-id">ID: {{ record.id }}</div>
                  <div class="org-type">Filial</div>
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'slug'">
              <span class="schema-badge branch-badge">{{ record.slug }}</span>
            </template>
            <template v-else-if="column.key === 'description'">
              <span class="description-text">{{ record.description || 'N/A' }}</span>
            </template>
            <template v-else-if="column.key === 'status'">
              <Tag :color="record.isActive ? 'green' : 'red'" class="status-tag">
                {{ record.isActive ? 'Ativo' : 'Inativo' }}
              </Tag>
            </template>
            <template v-else-if="column.key === 'created'">
              <span class="created-badge">
                <CalendarOutlined /> {{ formatDate(record.createdAt) }}
              </span>
            </template>
            <template v-else-if="column.key === 'actions'">
              <div class="action-buttons">
                <a-button type="text" size="small" @click="openEditBranchModal(record)">
                  <template #icon><EditOutlined /></template>
                </a-button>
                <a-popconfirm
                  title="Tem certeza que deseja excluir a filial?"
                  :description="'Excluir filial ' + record.name + '?'"
                  ok-text="Excluir"
                  ok-type="danger"
                  cancel-text="Cancelar"
                  placement="topLeft"
                  @confirm="confirmDeleteBranch(record)"
                >
                  <a-button type="text" size="small" danger>
                    <template #icon><DeleteOutlined /></template>
                  </a-button>
                </a-popconfirm>
              </div>
            </template>
          </template>
        </a-table>
      </div>

      <!-- Mensagem quando não há matriz -->
      <div v-if="!userMatrix && !loading" class="no-matrix-message">
        <a-empty
          description="Você ainda não tem uma empresa matriz"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
        >
          <a-button type="primary" @click="createMatrix">
            Criar Empresa Matriz
          </a-button>
        </a-empty>
      </div>
    </div>

    <!-- Modal para criar/editar tenant -->
    <TenantModal
      v-model:visible="modalVisible"
      :tenant="editingTenant"
      :available-parents="availableParentTenants"
      :loading-parents="loading"
      @submit="handleModalSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { 
  TeamOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  EditOutlined, 
  DeleteOutlined,
  FolderOutlined,
  PlusOutlined
} from '@ant-design/icons-vue';
import { message, Tag, Empty } from 'ant-design-vue';
import { useTenantStore } from 'src/stores/tenant-store';
import { Cookies } from 'quasar';
import TenantModal from 'src/components/TenantModal.vue';

interface Tenant {
  id: number;
  name: string;
  slug: string;
  parentTenantId?: number | null;
  owner?: {
    id: number;
    name: string;
    email: string;
  } | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface Branch {
  id: number;
  name: string;
  slug: string;
  description?: string;
  matrixTenantId: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const router = useRouter();
const search = ref();
const userMatrix = ref<Tenant | null>(null);
const userBranches = ref<Branch[]>([]);
const loading = ref(false);
const tenantStore = useTenantStore();
const internalInstance = getCurrentInstance();

// Modal state
const modalVisible = ref(false);
const editingTenant = ref<Partial<Tenant> | null>(null);

// Computed
const totalOrganizations = computed(() => {
  return (userMatrix.value ? 1 : 0) + userBranches.value.length;
});

const filteredBranches = computed(() => {
  if (!search.value) return userBranches.value;
  return userBranches.value.filter(branch =>
    branch.name.toLowerCase().includes(search.value.toLowerCase()) ||
    branch.slug.toLowerCase().includes(search.value.toLowerCase()) ||
    (branch.description || '').toLowerCase().includes(search.value.toLowerCase()) ||
    (branch.isActive ? 'ativo' : 'inativo').includes(search.value.toLowerCase())
  );
});

const availableParentTenants = computed(() => {
  return userMatrix.value ? [userMatrix.value] : [];
});

// Colunas para matriz
const matrixColumns = [
  { title: 'Empresa Matriz', dataIndex: 'name', key: 'org' },
  { title: 'Schema', dataIndex: 'slug', key: 'schema' },
  { title: 'Proprietário', dataIndex: 'owner', key: 'owner' },
  { title: 'Status', dataIndex: 'isActive', key: 'status' },
  { title: 'Criado em', dataIndex: 'createdAt', key: 'created' },
  { title: 'Ações', key: 'actions', align: 'center', width: 200 },
];

// Colunas para filiais
const branchColumns = [
  { title: 'Filial', dataIndex: 'name', key: 'org' },
  { title: 'Identificador', dataIndex: 'slug', key: 'slug' },
  { title: 'Descrição', dataIndex: 'description', key: 'description' },
  { title: 'Status', dataIndex: 'isActive', key: 'status' },
  { title: 'Criado em', dataIndex: 'createdAt', key: 'created' },
  { title: 'Ações', key: 'actions', align: 'center', width: 150 },
];

// Carregar matriz e filiais do usuário
async function loadUserMatrixAndBranches() {
  try {
    loading.value = true;
    const $api = internalInstance?.appContext.config.globalProperties.$api;
    if (!$api) throw new Error('API client not available');
    const token = Cookies.get('token');
    if (!token) throw new Error('Token de autenticação não encontrado');
    
    const response = await $api.get('/tenants/my-matrix-and-branches', {
      headers: { Authorization: `Bearer ${token}` },
    });

    userMatrix.value = response.data.matrix;
    userBranches.value = response.data.branches || [];
    
    // Atualizar store
    if (userMatrix.value) {
      tenantStore.setCurrentTenant(userMatrix.value);
    }
  } catch (error) {
    console.error('Erro ao carregar matriz e filiais:', error);
    message.error('Erro ao carregar organizações');
  } finally {
    loading.value = false;
  }
}

function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function createMatrix() {
  void router.push('/create-tenant');
}

function createBranch(matrix: Tenant) {
  void router.push(`/create-tenant?parentTenantId=${matrix.id}`);
}

function openCreateModal() {
  if (!userMatrix.value) {
    createMatrix();
  } else {
    createBranch(userMatrix.value);
  }
}

function openEditModal(tenant: Tenant) {
  editingTenant.value = tenant;
  modalVisible.value = true;
}

function openEditBranchModal(branch: Branch) {
  // Implementar edição de filial
  message.info(`Edição da filial ${branch.name} será implementada em breve`);
}

function handleModalSubmit(data: Record<string, unknown>) {
  // Implementar submissão do modal
  console.log('Modal submit:', data);
  modalVisible.value = false;
}

function confirmDeleteBranch(branch: Branch) {
  // Implementar exclusão de filial
  message.info(`Exclusão da filial ${branch.name} será implementada em breve`);
}

onMounted(async () => {
  await loadUserMatrixAndBranches();
});
</script>

<style scoped>
.tenants-container {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.tenants-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.tenants-table-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.new-tenant-btn {
  height: 40px;
  border-radius: 8px;
  font-weight: 500;
}

.tenants-table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tenants-table-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.tenants-search {
  max-width: 400px;
}

.matrix-section,
.branches-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 24px 24px 16px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.matrix-table,
.branches-table {
  margin: 0 24px 24px 24px;
}

.org-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.org-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.matrix-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.branch-icon {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.org-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.org-id {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
}

.org-type {
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  font-weight: 500;
}

.schema-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  font-family: 'Monaco', 'Menlo', monospace;
}

.matrix-badge {
  background: #dbeafe;
  color: #1e40af;
}

.branch-badge {
  background: #d1fae5;
  color: #065f46;
}

.owner-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #6b7280;
}

.status-tag {
  font-size: 12px;
  font-weight: 500;
}

.created-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #6b7280;
}

.description-text {
  font-size: 14px;
  color: #6b7280;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.no-matrix-message {
  padding: 48px 24px;
  text-align: center;
}

/* Responsividade */
@media (max-width: 768px) {
  .tenants-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .tenants-table-title {
    text-align: center;
  }
  
  .matrix-table,
  .branches-table {
    margin: 0 16px 16px 16px;
  }
  
  .section-title {
    margin: 16px 16px 12px 16px;
  }
}
</style> 