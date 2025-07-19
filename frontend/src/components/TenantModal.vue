<template>
  <a-modal
    :open="visible"
    :title="modalTitle"
    :width="500"
    :footer="null"
    :mask-closable="false"
    :closable="true"
    :centered="true"
    class="tenant-modal"
    @cancel="handleCancel"
  >
    <div class="modal-content">
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        layout="vertical"
        @finish="handleSubmit"
      >
        <!-- Tipo de Organização -->
        <a-form-item label="Tipo de Organização" name="organizationType">
          <a-radio-group v-model:value="formData.organizationType" class="org-type-group">
            <a-radio-button value="company">
              <template #icon><TeamOutlined /></template>
              Empresa (Matriz)
            </a-radio-button>
            <a-radio-button value="branch" :disabled="!(availableParents?.length || 0)">
              <template #icon><FolderOutlined /></template>
              Filial
            </a-radio-button>
          </a-radio-group>
        </a-form-item>

        <!-- Empresa Matriz (só para filiais) -->
        <a-form-item 
          v-if="formData.organizationType === 'branch'" 
          label="Empresa Matriz" 
          name="parentTenantId"
        >
          <a-select
            v-model:value="formData.parentTenantId"
            placeholder="Selecione a empresa matriz"
            :options="parentOptions"
            :loading="loadingParents"
            show-search
            filter-option
          >
            <template #option="{ name }">
              <div class="parent-option">
                <TeamOutlined class="parent-icon" />
                <span>{{ name }}</span>
              </div>
            </template>
          </a-select>
        </a-form-item>

        <!-- Nome da Organização -->
        <a-form-item label="Nome da Organização" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="Digite o nome da empresa ou filial"
            size="large"
            :maxlength="100"
            show-count
          />
        </a-form-item>

        <!-- Slug/Identificador -->
        <a-form-item label="Identificador Único" name="slug">
          <a-input
            v-model:value="formData.slug"
            placeholder="identificador-unico"
            size="large"
            :maxlength="50"
            show-count
            :addon-before="slugPrefix"
          >
            <template #suffix>
              <a-tooltip title="O identificador será usado para criar o schema do banco de dados">
                <InfoCircleOutlined style="color: #8c8c8c" />
              </a-tooltip>
            </template>
          </a-input>
        </a-form-item>

        <!-- Descrição -->
        <a-form-item label="Descrição" name="description">
          <a-textarea
            v-model:value="formData.description"
            placeholder="Descreva brevemente a organização..."
            :rows="3"
            :maxlength="200"
            show-count
          />
        </a-form-item>

        <!-- Status -->
        <a-form-item label="Status" name="isActive">
          <a-switch
            v-model:checked="formData.isActive"
            checked-children="Ativo"
            un-checked-children="Inativo"
            size="large"
          />
        </a-form-item>

        <!-- Informações Adicionais -->
        <div class="info-section">
          <a-divider orientation="left">
            <InfoCircleOutlined /> Informações do Sistema
          </a-divider>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Schema do Banco:</span>
              <span class="info-value" :class="{ 'empty-schema': !formData.slug.trim() }">
                {{ finalSlug }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Tipo:</span>
              <span class="info-value">
                <Tag :color="formData.organizationType === 'company' ? 'blue' : 'green'">
                  {{ formData.organizationType === 'company' ? 'Matriz' : 'Filial' }}
                </Tag>
              </span>
            </div>
          </div>
        </div>
      </a-form>
    </div>

    <!-- Footer do Modal -->
    <div class="modal-footer">
      <a-space>
        <a-button @click="handleCancel" size="large">
          Cancelar
        </a-button>
        <a-button 
          type="primary" 
          size="large"
          :loading="submitting"
          @click="handleSubmit"
        >
          {{ isEditing ? 'Atualizar' : 'Criar' }} Organização
        </a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  TeamOutlined, 
  FolderOutlined, 
  InfoCircleOutlined 
} from '@ant-design/icons-vue';
import { Tag } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';

interface Tenant {
  id: number;
  name: string;
  slug: string;
  parentTenantId?: number | null;
  isActive: boolean;
  description?: string;
}

interface Props {
  visible: boolean;
  tenant?: Partial<Tenant> | null;
  availableParents?: Tenant[];
  loadingParents?: boolean;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'submit', data: Record<string, unknown>): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  tenant: null,
  availableParents: () => [],
  loadingParents: false
});

const emit = defineEmits<Emits>();

// Refs
const formRef = ref<FormInstance>();
const submitting = ref(false);

// Form data
const formData = ref({
  organizationType: 'company',
  parentTenantId: undefined as number | undefined,
  name: '',
  slug: '',
  description: '',
  isActive: true
});

// Computed
const modalTitle = computed(() => {
  if (props.tenant) {
    return `Editar ${props.tenant.parentTenantId ? 'Filial' : 'Empresa'}`;
  }
  return 'Nova Organização';
});

const isEditing = computed(() => !!props.tenant);

const slugPrefix = computed(() => {
  return formData.value.organizationType === 'branch' ? 'tenant_' : '';
});

const finalSlug = computed(() => {
  const slug = formData.value.slug.trim();
  if (!slug) {
    return slugPrefix.value + 'identificador-exemplo';
  }
  
  const cleanSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
    
  return slugPrefix.value + cleanSlug;
});

const parentOptions = computed(() => {
  return props.availableParents.map(parent => ({
    label: parent.name,
    value: parent.id,
    name: parent.name,
    id: parent.id
  }));
});

// Rules
const rules = {
  organizationType: [
    { required: true, message: 'Selecione o tipo de organização' }
  ],
  parentTenantId: [
    { 
      required: true, 
      message: 'Selecione a empresa matriz',
      validator: (_: unknown, value: unknown) => {
        if (formData.value.organizationType === 'branch' && !value) {
          return Promise.reject(new Error('Selecione a empresa matriz'));
        }
        return Promise.resolve();
      }
    }
  ],
  name: [
    { required: true, message: 'Digite o nome da organização' },
    { min: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
    { max: 100, message: 'Nome deve ter no máximo 100 caracteres' }
  ],
  slug: [
    { required: true, message: 'Digite o identificador único' },
    { 
      pattern: /^[a-z0-9-]+$/, 
      message: 'Apenas letras minúsculas, números e hífens' 
    },
    { min: 3, message: 'Identificador deve ter pelo menos 3 caracteres' },
    { max: 50, message: 'Identificador deve ter no máximo 50 caracteres' }
  ],
  description: [
    { max: 200, message: 'Descrição deve ter no máximo 200 caracteres' }
  ]
};

// Watchers
watch(() => props.visible, (newVal) => {
  if (newVal && props.tenant) {
    formData.value = {
      organizationType: props.tenant.parentTenantId ? 'branch' : 'company',
      parentTenantId: props.tenant.parentTenantId || undefined,
      name: props.tenant.name || '',
      slug: (props.tenant.slug || '').replace(/^tenant_/, ''),
      description: props.tenant.description || '',
      isActive: props.tenant.isActive ?? true
    };
  } else if (newVal && !props.tenant) {
    formData.value = {
      organizationType: 'company',
      parentTenantId: undefined,
      name: '',
      slug: '',
      description: '',
      isActive: true
    };
  }
});

watch(() => formData.value.organizationType, (newType) => {
  if (newType === 'company') {
    formData.value.parentTenantId = undefined;
  }
});

// Methods
function handleCancel() {
  emit('update:visible', false);
  formRef.value?.resetFields();
}

async function handleSubmit() {
  try {
    submitting.value = true;
    
    await formRef.value?.validate();
    
    const submitData = {
      ...formData.value,
      slug: finalSlug.value,
      parentTenantId: formData.value.organizationType === 'branch' 
        ? formData.value.parentTenantId 
        : null
    };
    
    emit('submit', submitData);
    
  } catch (error) {
    console.error('Erro de validação:', error);
  } finally {
    submitting.value = false;
  }
}

// Auto-generate slug from name
watch(() => formData.value.name, (newName) => {
  if (newName && !formData.value.slug) {
    const slug = newName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    formData.value.slug = slug;
  }
});
</script>

<style scoped>
.tenant-modal :deep(.ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
}

.tenant-modal :deep(.ant-modal-header) {
  background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%);
  border-bottom: none;
  padding: 20px 20px 16px 20px;
}

.tenant-modal :deep(.ant-modal-title) {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
}

.tenant-modal :deep(.ant-modal-close) {
  color: #fff;
}

.tenant-modal :deep(.ant-modal-close:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.tenant-modal :deep(.ant-modal-body) {
  padding: 0;
}

.modal-content {
  padding: 20px 20px 0 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.org-type-group {
  width: 100%;
}

.org-type-group :deep(.ant-radio-button-wrapper) {
  flex: 1;
  text-align: center;
  height: 44px;
  line-height: 42px;
  border-radius: 8px;
  margin-right: 8px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.org-type-group :deep(.ant-radio-button-wrapper:first-child) {
  border-radius: 8px;
}

.org-type-group :deep(.ant-radio-button-wrapper:last-child) {
  border-radius: 8px;
  margin-right: 0;
}

.org-type-group :deep(.ant-radio-button-wrapper-checked) {
  background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%);
  border-color: #5865f2;
  color: #fff;
  box-shadow: 0 2px 8px rgba(88,101,242,0.15);
}

.org-type-group :deep(.ant-radio-button-wrapper:not(.ant-radio-button-wrapper-checked):hover) {
  border-color: #5865f2;
  color: #5865f2;
}

.parent-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.parent-icon {
  color: #5865f2;
}

.info-section {
  margin-top: 16px;
}

.info-section :deep(.ant-divider) {
  margin: 12px 0;
  color: #6b7280;
  font-weight: 500;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 0.95rem;
  color: #bfbfbf;
  font-weight: 500;
  background: #fafafa;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
}

.info-value.empty-schema {
  color: #bfbfbf;
  font-style: italic;
  background: #fafafa;
}

.modal-footer {
  padding: 16px 20px 20px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  text-align: right;
  position: sticky;
  bottom: 0;
}

.modal-footer :deep(.ant-btn) {
  height: 36px;
  border-radius: 8px;
  font-weight: 500;
}

.modal-footer :deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(88,101,242,0.15);
}

.modal-footer :deep(.ant-btn-primary:hover) {
  background: linear-gradient(135deg, #6a78fa 0%, #5865f2 100%);
  box-shadow: 0 4px 16px rgba(88,101,242,0.25);
}

/* Dark theme support */
:root[data-theme='dark'] & .tenant-modal :deep(.ant-modal-content) {
  background: #2b2d31;
  border: 1px solid #36393f;
}

:root[data-theme='dark'] & .org-type-group :deep(.ant-radio-button-wrapper) {
  background: #23272a;
  border-color: #36393f;
  color: #b5bac1;
}

:root[data-theme='dark'] & .org-type-group :deep(.ant-radio-button-wrapper:not(.ant-radio-button-wrapper-checked):hover) {
  border-color: #5865f2;
  color: #5865f2;
}

:root[data-theme='dark'] & .info-value {
  background: #23272a;
  color: #f2f3f5;
  border-color: #36393f;
}

:root[data-theme='dark'] & .modal-footer {
  background: #23272a;
  border-top-color: #36393f;
}

@media (max-width: 768px) {
  .tenant-modal :deep(.ant-modal) {
    margin: 16px;
    max-width: calc(100vw - 32px);
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .org-type-group :deep(.ant-radio-button-wrapper) {
    font-size: 0.875rem;
    height: 44px;
    line-height: 42px;
  }
}
</style> 