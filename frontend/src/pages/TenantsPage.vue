<template>
  <div class="tenants-container">
    <div class="tenants-header tenants-header--top-flex">
      <h2 class="tenants-table-title">Tenants Cadastrados ({{ tenants.length }})</h2>
      <a-button type="primary" class="new-tenant-btn" @click="openCreateModal">
        + Novo Tenant
      </a-button>
    </div>
    <a-modal
      v-model:open="showModal"
      :title="isEdit ? 'Editar Tenant' : 'Cadastrar Novo Tenant'"
      :footer="null"
      centered
      width="420px"
      @cancel="handleCancel"
    >
      <a-form
        :model="form"
        :rules="rules"
        ref="formRef"
        layout="vertical"
        @submit.prevent="handleSubmit"
      >
        <a-form-item label="Organização" name="org" :rules="rules.org">
          <a-input v-model:value="form.org" placeholder="Nome da organização" allow-clear />
        </a-form-item>
        <a-form-item label="Schema" name="schema" :rules="rules.schema">
          <a-input v-model:value="form.schema" placeholder="Identificador do schema" allow-clear />
        </a-form-item>
        <a-form-item label="Subdomínio" name="subdomain" :rules="rules.subdomain">
          <a-input v-model:value="form.subdomain" placeholder="subdominio" allow-clear />
        </a-form-item>
        <a-form-item label="Contato" name="contact" :rules="rules.contact">
          <a-input v-model:value="form.contact" placeholder="E-mail de contato" allow-clear />
        </a-form-item>
        <a-form-item label="Status" name="status" :rules="rules.status">
          <a-select v-model:value="form.status" placeholder="Selecione o status">
            <a-select-option value="Ativo">Ativo</a-select-option>
            <a-select-option value="Inativo">Inativo</a-select-option>
          </a-select>
        </a-form-item>
        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px;">
          <a-button @click="handleCancel">Cancelar</a-button>
          <a-button type="primary" @click="handleSubmit">{{ isEdit ? 'Salvar' : 'Cadastrar' }}</a-button>
        </div>
      </a-form>
    </a-modal>
    <div class="tenants-table-card">
      <div class="tenants-table-header">
        <a-input-search
          v-model:value="search"
          placeholder="Buscar tenants..."
          class="tenants-search"
          allow-clear
        />
      </div>
      <a-table
        :dataSource="filteredTenants"
        :columns="columns"
        :pagination="false"
        rowKey="id"
        class="tenants-table"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'org'">
            <div class="org-cell">
              <div class="org-icon"><TeamOutlined /></div>
              <div>
                <div class="org-name">{{ record.org }}</div>
                <div class="org-id">ID: {{ record.id }}</div>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'schema'">
            <span class="schema-badge">{{ record.schema }}</span>
          </template>
          <template v-else-if="column.key === 'subdomain'">
            <span class="subdomain-badge">{{ record.subdomain }}</span>
            <span class="subdomain-domain">.domain.com</span>
          </template>
          <template v-else-if="column.key === 'contact'">
            <span class="contact-badge"><MailOutlined /> {{ record.contact }}</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'Ativo' ? 'green' : 'default'">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'created'">
            <span class="created-badge"><CalendarOutlined /> {{ record.created }}</span>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-button type="text" size="small" @click="openEditModal(record)">
              <template #icon><EditOutlined /></template>
            </a-button>
            <a-popconfirm
              title="Tem certeza que deseja excluir o tenant?"
              :description="'Excluir ' + record.org + '?'"
              ok-text="Excluir"
              ok-type="danger"
              cancel-text="Cancelar"
              placement="topLeft"
              @confirm="() => confirmDelete(record)"
            >
              <a-button type="text" size="small" danger>
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { TeamOutlined, MailOutlined, CalendarOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

interface Tenant {
  id: string;
  org: string;
  schema: string;
  subdomain: string;
  contact: string;
  status: string;
  created: string;
}

const search = ref('');
const tenants = ref<Tenant[]>([
  {
    id: 't1',
    org: 'TechStart Solutions',
    schema: 'techstart',
    subdomain: 'techstart',
    contact: 'admin@techstart.com',
    status: 'Ativo',
    created: '02/07/2025',
  },
  {
    id: 't2',
    org: 'Global Enterprises',
    schema: 'global_ent',
    subdomain: 'global',
    contact: 'admin@global.com',
    status: 'Inativo',
    created: '02/07/2025',
  },
  {
    id: 't3',
    org: 'Acme Corporation',
    schema: 'acme_corp',
    subdomain: 'acme',
    contact: 'admin@acme.com',
    status: 'Ativo',
    created: '02/07/2025',
  },
]);

const columns = [
  { title: 'Organização', dataIndex: 'org', key: 'org' },
  { title: 'Schema', dataIndex: 'schema', key: 'schema' },
  { title: 'Subdomínio', dataIndex: 'subdomain', key: 'subdomain' },
  { title: 'Contato', dataIndex: 'contact', key: 'contact' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Criado em', dataIndex: 'created', key: 'created' },
  { title: 'Ações', key: 'actions', align: 'center', width: 100 },
];

const filteredTenants = computed(() => {
  if (!search.value) return tenants.value;
  return tenants.value.filter(t =>
    t.org.toLowerCase().includes(search.value.toLowerCase()) ||
    t.schema.toLowerCase().includes(search.value.toLowerCase()) ||
    t.subdomain.toLowerCase().includes(search.value.toLowerCase()) ||
    t.contact.toLowerCase().includes(search.value.toLowerCase())
  );
});

const showModal = ref(false);
const isEdit = ref(false);
const editIndex = ref(-1);
const formRef = ref();
const form = ref<Tenant>({
  id: '',
  org: '',
  schema: '',
  subdomain: '',
  contact: '',
  status: '',
  created: '',
});
const rules = {
  org: [ { required: true, message: 'Informe o nome da organização', trigger: 'blur' } ],
  schema: [ { required: true, message: 'Informe o schema', trigger: 'blur' } ],
  subdomain: [ { required: true, message: 'Informe o subdomínio', trigger: 'blur' } ],
  contact: [ { required: true, type: 'email', message: 'Informe um e-mail válido', trigger: 'blur' } ],
  status: [ { required: true, message: 'Selecione o status', trigger: 'change' } ],
};

function openCreateModal() {
  isEdit.value = false;
  form.value = { id: '', org: '', schema: '', subdomain: '', contact: '', status: '', created: '' };
  showModal.value = true;
}

function openEditModal(record: Tenant) {
  isEdit.value = true;
  editIndex.value = tenants.value.findIndex(t => t.id === record.id);
  form.value = { ...record };
  showModal.value = true;
}

function handleCancel() {
  showModal.value = false;
  form.value = { id: '', org: '', schema: '', subdomain: '', contact: '', status: '', created: '' };
  isEdit.value = false;
  editIndex.value = -1;
}

function handleSubmit() {
  formRef.value?.validate().then(() => {
    if (isEdit.value && editIndex.value !== -1) {
      tenants.value[editIndex.value] = { ...form.value };
      message.success('Tenant atualizado com sucesso!');
    } else {
      tenants.value.push({ ...form.value, id: Math.random().toString(36).substr(2, 9), created: new Date().toLocaleDateString('pt-BR') });
      message.success('Tenant cadastrado com sucesso!');
    }
    handleCancel();
  });
}

function confirmDelete(record: Tenant) {
  tenants.value = tenants.value.filter(t => t.id !== record.id);
  message.success('Tenant excluído com sucesso!');
}
</script>

<style scoped>
.tenants-container {
  width: 100%;
  min-height: 100%;
  padding: 0 0 32px 0;
  background: #f6f7fb;
}
:root[data-theme='dark'] & .tenants-container {
  background: #313338;
}
.tenants-header {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  margin-bottom: 32px;
  gap: 24px;
}
.tenants-header--top,
.tenants-header--top-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 24px;
  padding: 0;
  background: none;
  box-shadow: none;
}
.tenants-title {
  font-size: 2rem;
  font-weight: 700;
  color: #23272a;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}
:root[data-theme='dark'] & .tenants-title {
  color: #f2f3f5;
}
.tenants-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}
:root[data-theme='dark'] & .tenants-subtitle {
  color: #b5bac1;
}
.new-tenant-btn {
  font-weight: 600;
  font-size: 1rem;
  padding: 0 24px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(90deg, #5865f2 0%, #4752c4 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(88,101,242,0.10);
  color: #fff;
  transition: background 0.18s, box-shadow 0.18s;
}
.new-tenant-btn:hover {
  background: linear-gradient(90deg, #6a78fa 0%, #5865f2 100%);
  box-shadow: 0 4px 16px rgba(88,101,242,0.16);
}
.tenants-table-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(30, 64, 175, 0.06);
  padding: 24px 24px 8px 24px;
  border: 1.5px solid #e5e7eb;
  transition: background 0.2s, border 0.2s;
}
:root[data-theme='dark'] & .tenants-table-card {
  background: #2b2d31;
  border-radius: 18px;
  box-shadow: 0 6px 32px rgba(30, 64, 175, 0.10);
  border: 1.5px solid #36393f;
}
.tenants-table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
}
.tenants-table-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #23272a;
  margin: 0;
}
:root[data-theme='dark'] & .tenants-table-title {
  color: #f2f3f5;
}
.tenants-search {
  width: 240px;
}
.tenants-table :deep(.ant-table) {
  background: transparent;
  border-radius: 14px;
}
.tenants-table :deep(.ant-table-thead > tr > th) {
  background: #f3f4f6;
  color: #23272a;
  font-weight: 600;
  font-size: 1rem;
  border-bottom: 1.5px solid #e5e7eb;
  transition: background 0.2s, color 0.2s;
}
:root[data-theme='dark'] & .tenants-table :deep(.ant-table-thead > tr > th) {
  background: #23272a;
  color: #f2f3f5;
  border-bottom: 1.5px solid #36393f;
}
.tenants-table :deep(.ant-table-tbody > tr > td) {
  background: #fff;
  color: #23272a;
  font-size: 1rem;
  border-bottom: 1.5px solid #f1f5f9;
  padding: 14px 8px;
  transition: background 0.2s, color 0.2s;
}
:root[data-theme='dark'] & .tenants-table :deep(.ant-table-tbody > tr > td) {
  background: #2b2d31;
  color: #f2f3f5;
  border-bottom: 1.5px solid #36393f;
}
.org-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.org-icon {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%);
  color: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 2px 8px rgba(88,101,242,0.10);
}
.org-name {
  font-weight: 600;
  color: #23272a;
  font-size: 1rem;
  transition: color 0.2s;
}
:root[data-theme='dark'] & .org-name {
  color: #f2f3f5;
}
.org-id {
  font-size: 0.85rem;
  color: #6b7280;
  transition: color 0.2s;
}
:root[data-theme='dark'] & .org-id {
  color: #b5bac1;
}
.schema-badge {
  background: #f1f5f9;
  color: #4752c4;
  font-weight: 600;
  border-radius: 8px;
  padding: 2px 12px;
  font-size: 0.95rem;
  transition: background 0.2s, color 0.2s;
}
:root[data-theme='dark'] & .schema-badge {
  background: #23272a;
  color: #5865f2;
}
.subdomain-badge {
  color: #23272a;
  font-weight: 600;
  font-size: 1rem;
  transition: color 0.2s;
}
:root[data-theme='dark'] & .subdomain-badge {
  color: #f2f3f5;
}
.subdomain-domain {
  color: #6b7280;
  font-size: 0.95rem;
  margin-left: 2px;
  transition: color 0.2s;
}
:root[data-theme='dark'] & .subdomain-domain {
  color: #b5bac1;
}
.contact-badge {
  color: #23272a;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
}
:root[data-theme='dark'] & .contact-badge {
  color: #f2f3f5;
}
.created-badge {
  color: #6b7280;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
}
:root[data-theme='dark'] & .created-badge {
  color: #b5bac1;
}
.tenants-table :deep(.ant-tag-green) {
  background: #e6f4ea;
  color: #389e6b;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
}
:root[data-theme='dark'] & .tenants-table :deep(.ant-tag-green) {
  background: #3ba55d22;
  color: #3ba55d;
}
.tenants-table :deep(.ant-tag-default) {
  background: #f3f4f6;
  color: #b5bac1;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
}
:root[data-theme='dark'] & .tenants-table :deep(.ant-tag-default) {
  background: #23272a;
  color: #b5bac1;
}
@media (max-width: 900px) {
  .tenants-table-card {
    padding: 12px 4px 4px 4px;
  }
  .tenants-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}
</style> 