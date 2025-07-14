<template>
  <div class="register-container">
    <!-- Side Information -->
    <div class="register-side-info">
      <div class="content-wrapper" :class="{ 'content-animate': pageLoaded }">
        <div class="brand-section" :class="{ 'fade-in': pageLoaded }">
          <div class="logo-container">
            <div class="brand-logo">
              <SafetyOutlined class="logo-icon" />
            </div>
          </div>
          <h1 class="brand-title">AuthGuard Enterprise</h1>
          <p class="brand-subtitle">Junte-se à nossa plataforma</p>
        </div>

        <div class="features-section" :class="{ 'slide-up': pageLoaded }">
          <h3 class="features-title">Vantagens da Plataforma</h3>
          <div
            class="feature-item"
            v-for="(feature, index) in features"
            :key="index"
            :class="{ 'feature-animate': pageLoaded }"
            :style="{ 'animation-delay': `${0.2 + index * 0.05}s` }"
          >
            <check-circle-filled class="feature-icon" />
            <span>{{ feature }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Register Form Side -->
    <div class="register-side-form">
      <div class="form-container" :class="{ 'form-container-animate': pageLoaded }">
        <div class="form-header" :class="{ 'header-animate': pageLoaded }">
          <h2 class="form-title">Criar Conta</h2>
          <p class="form-description">Preencha os dados para criar sua conta empresarial</p>
        </div>

        <a-form
          ref="formRef"
          :model="registerForm"
          :rules="registerRules"
          layout="vertical"
          class="register-form"
          :class="{ 'form-fields-animate': pageLoaded }"
          @finish="onRegister"
        >
          <a-form-item label="Nome Completo" name="name" class="form-item">
            <a-input
              v-model:value="registerForm.name"
              size="large"
              placeholder="Digite seu nome completo"
              autocomplete="name"
              class="input-field"
            >
              <template #prefix>
                <user-outlined class="input-icon" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item label="E-mail Corporativo" name="email" class="form-item">
            <a-input
              v-model:value="registerForm.email"
              size="large"
              placeholder="Digite seu e-mail corporativo"
              autocomplete="email"
              class="input-field"
            >
              <template #prefix>
                <mail-outlined class="input-icon" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item label="Senha" name="password" class="form-item">
            <a-input-password
              v-model:value="registerForm.password"
              size="large"
              placeholder="Crie uma senha segura"
              autocomplete="new-password"
              class="input-field"
            >
              <template #prefix>
                <lock-outlined class="input-icon" />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item label="Confirmar Senha" name="confirmPassword" class="form-item">
            <a-input-password
              v-model:value="registerForm.confirmPassword"
              size="large"
              placeholder="Confirme sua senha"
              autocomplete="new-password"
              class="input-field"
            >
              <template #prefix>
                <lock-outlined class="input-icon" />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item class="form-item">
            <a-checkbox v-model:checked="acceptTerms" class="terms-checkbox">
              Concordo com os
              <a class="terms-link">Termos de Uso</a>
              e
              <a class="terms-link">Política de Privacidade</a>
            </a-checkbox>
          </a-form-item>

          <a-form-item class="form-item">
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              :loading="loading"
              :disabled="!acceptTerms"
              class="register-button"
            >
              Criar Conta Empresarial
            </a-button>
          </a-form-item>
        </a-form>

        <a-divider class="form-divider" :class="{ 'divider-animate': pageLoaded }">
          <span class="divider-text">Já possui conta?</span>
        </a-divider>

        <a-button
          type="default"
          size="large"
          block
          class="login-button"
          :class="{ 'login-btn-animate': pageLoaded }"
          @click="goToLogin"
        >
          Fazer Login
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { CheckCircleFilled, UserOutlined, MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { AxiosError } from 'axios';

const router = useRouter();
const formRef = ref();
const pageLoaded = ref(false);

const features = [
  'Configuração Rápida',
  'Suporte 24/7',
  'Ambiente Multi-Tenant',
  'Conformidade LGPD',
];

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const acceptTerms = ref(false);
const loading = ref(false);

const registerRules = {
  name: [
    { required: true, message: 'Por favor, digite seu nome completo', trigger: 'blur' },
    { min: 2, message: 'Nome deve ter pelo menos 2 caracteres', trigger: 'blur' },
  ],
  email: [
    { required: true, message: 'Por favor, digite seu e-mail', trigger: 'blur' },
    { type: 'email', message: 'Formato de e-mail inválido', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Por favor, digite sua senha', trigger: 'blur' },
    { min: 8, message: 'Senha deve ter pelo menos 8 caracteres', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: 'Senha deve conter ao menos 1 letra minúscula, 1 maiúscula e 1 número',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: 'Por favor, confirme sua senha', trigger: 'blur' },
    {
      validator: (_: unknown, value: string) => {
        if (value && value !== registerForm.value.password) {
          return Promise.reject(new Error('As senhas não coincidem'));
        }
        return Promise.resolve();
      },
      trigger: 'blur',
    },
  ],
};

onMounted(() => {
  // Trigger animations after component is mounted
  setTimeout(() => {
    pageLoaded.value = true;
  }, 100);
});

const internalInstance = getCurrentInstance();

async function onRegister() {
  try {
    loading.value = true;
    const $api = internalInstance?.appContext.config.globalProperties.$api;
    if (!$api) {
      throw new Error('API client not available');
    }
    await $api.post('/users', {
      name: registerForm.value.name,
      email: registerForm.value.email,
      password: registerForm.value.password,
    });
    message.success('Cadastro realizado com sucesso! Faça login para continuar.');
    void router.push('/login');
  } catch (error: unknown) {
    let userFriendlyMessage = 'Ocorreu um erro ao tentar criar sua conta.';
    if (error instanceof AxiosError) {
      console.error('Full AxiosError response:', error.response); // Log full response for debugging
      const backendError = error.response?.data;
      if (backendError?.message) {
        userFriendlyMessage = backendError.message; // Directly use the message from backend
      } else {
        userFriendlyMessage = error.message;
      }
    }
    message.error('Erro no cadastro: ' + userFriendlyMessage);
    console.error('Erro no cadastro:', error); // Keep for debugging
  } finally {
    loading.value = false;
  }
}

function goToLogin() {
  void router.push('/login');
}
</script>

<style scoped>
.register-container {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.register-side-info {
  flex: 1.2;
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #1e293b 100%);
  position: relative;
  overflow: hidden;
}

.register-side-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 48px 64px;
  color: white;
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
}

.content-wrapper.content-animate {
  opacity: 1;
}

.brand-section {
  text-align: center;
  margin-bottom: 64px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.1s;
}

.brand-section.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.logo-container {
  margin-bottom: 24px;
}

.brand-logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* Melhorar renderização */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.brand-logo:hover {
  transform: scale(1.05) translateZ(0);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.logo-icon {
  font-size: 36px;
  color: white;
  /* Melhorar renderização do ícone */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  transform: translateZ(0);
}

.brand-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(45deg, #fff, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.features-section {
  width: 100%;
  max-width: 320px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.15s;
}

.features-section.slide-up {
  opacity: 1;
  transform: translateY(0);
}

.features-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #e2e8f0;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  opacity: 0;
  transform: translateX(-15px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-item.feature-animate {
  opacity: 1;
  transform: translateX(0);
}

.feature-icon {
  color: #10b981;
  margin-right: 12px;
  font-size: 18px;
}

.register-side-form {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 32px;
}

.form-container {
  width: 100%;
  max-width: 400px;
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
}

.form-container.form-container-animate {
  opacity: 1;
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
  opacity: 0;
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.1s;
}

.form-header.header-animate {
  opacity: 1;
}

.form-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.form-description {
  color: #6b7280;
  margin: 0;
  font-size: 16px;
}

.register-form {
  margin-bottom: 24px;
}

.register-form.form-fields-animate .form-item {
  opacity: 1;
}

.input-field {
  transition: all 0.3s ease;
  border-radius: 8px;
}

.input-field:hover,
.input-field:focus {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.input-icon {
  color: #9ca3af;
  transition: color 0.3s ease;
}

.terms-checkbox {
  font-size: 14px;
  color: #6b7280;
}

.terms-link {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.register-button {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  font-weight: 600;
  height: 48px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.register-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.register-button:disabled {
  background: #d1d5db;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

.form-divider {
  margin: 24px 0;
  opacity: 0;
  transition: opacity 0.4s ease;
  transition-delay: 0.5s;
}

.form-divider.divider-animate {
  opacity: 1;
}

.divider-text {
  color: #9ca3af;
  font-size: 14px;
  background: white;
  padding: 0 16px;
}

.login-button {
  height: 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  color: #6b7280;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.55s;
}

.login-button.login-btn-animate {
  opacity: 1;
}

.login-button:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .register-container {
    flex-direction: column;
  }

  .register-side-info {
    flex: none;
    min-height: 40vh;
  }

  .content-wrapper {
    padding: 32px 24px;
  }

  .brand-title {
    font-size: 24px;
  }

  .features-section {
    display: none;
  }

  .form-container {
    max-width: 100%;
  }
}
</style>
