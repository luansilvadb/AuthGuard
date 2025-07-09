<template>
  <div class="login-container">
    <!-- Side Information -->
    <div class="login-side-info">
      <div class="content-wrapper" :class="{ 'content-animate': pageLoaded }">
        <div class="brand-section" :class="{ 'fade-in': pageLoaded }">
          <div class="logo-container">
            <a-avatar :size="72" class="brand-logo">
              <template #icon>
                <safety-outlined />
              </template>
            </a-avatar>
          </div>
          <h1 class="brand-title">AuthGuard Enterprise</h1>
          <p class="brand-subtitle">Plataforma de Autenticação e Autorização</p>
        </div>

        <div class="features-section" :class="{ 'slide-up': pageLoaded }">
          <h3 class="features-title">Recursos Principais</h3>
          <div class="feature-item" v-for="(feature, index) in features" :key="index"
               :class="{ 'feature-animate': pageLoaded }"
               :style="{ 'animation-delay': `${0.2 + index * 0.05}s` }">
            <check-circle-filled class="feature-icon" />
            <span>{{ feature }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Login Form Side -->
    <div class="login-side-form">
      <div class="form-container" :class="{ 'form-container-animate': pageLoaded }">
        <div class="form-header" :class="{ 'header-animate': pageLoaded }">
          <h2 class="form-title">Fazer Login</h2>
          <p class="form-description">Entre com suas credenciais para acessar o sistema</p>
        </div>

        <a-form
          ref="formRef"
          :model="loginForm"
          :rules="loginRules"
          layout="vertical"
          class="login-form"
          :class="{ 'form-fields-animate': pageLoaded }"
          @finish="onLogin"
        >
          <a-form-item label="E-mail" name="email" class="form-item">
            <a-input
              v-model:value="loginForm.email"
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
              v-model:value="loginForm.password"
              size="large"
              placeholder="Digite sua senha"
              autocomplete="current-password"
              class="input-field"
            >
              <template #prefix>
                <lock-outlined class="input-icon" />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item class="form-item">
            <div class="form-options">
              <a-checkbox v-model:checked="rememberMe">Lembrar-me</a-checkbox>
              <a class="forgot-link">Esqueci a senha</a>
            </div>
          </a-form-item>

          <a-form-item class="form-item">
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              :loading="loading"
              class="login-button"
            >
              Entrar no Sistema
            </a-button>
          </a-form-item>
        </a-form>

        <a-divider class="form-divider" :class="{ 'divider-animate': pageLoaded }">
          <span class="divider-text">Novo no sistema?</span>
        </a-divider>

        <a-button
          type="default"
          size="large"
          block
          class="register-button"
          :class="{ 'register-btn-animate': pageLoaded }"
          @click="goToRegister"
        >
          Criar Conta Empresarial
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import {
  SafetyOutlined,
  CheckCircleFilled,
  MailOutlined,
  LockOutlined
} from '@ant-design/icons-vue';
import { Cookies } from 'quasar';

const router = useRouter();
const formRef = ref();
const pageLoaded = ref(false);

const features = [
  'Autenticação Multi-Tenant',
  'Controle de Acesso Granular',
  'Segurança Corporativa',
  'Auditoria e Logs'
];

const loginForm = ref({
  email: '',
  password: ''
});

const rememberMe = ref(false);
const loading = ref(false);

const loginRules = {
  email: [
    { required: true, message: 'Por favor, digite seu e-mail', trigger: 'blur' },
    { type: 'email', message: 'Formato de e-mail inválido', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Por favor, digite sua senha', trigger: 'blur' },
    { min: 6, message: 'Senha deve ter pelo menos 6 caracteres', trigger: 'blur' }
  ]
};

onMounted(() => {
  // Trigger animations after component is mounted
  setTimeout(() => {
    pageLoaded.value = true;
  }, 100);
});

const internalInstance = getCurrentInstance();

async function onLogin() {
  try {
    loading.value = true;
    const $api = internalInstance?.appContext.config.globalProperties.$api;
    if (!$api) {
      throw new Error('API client not available');
    }
    const response = await $api.post('/auth/login', {
      email: loginForm.value.email,
      password: loginForm.value.password,
    });
    const { access_token } = response.data;
    if (access_token) {
      const cookieOptions: Parameters<typeof Cookies.set>[2] = {
        secure: process.env.NODE_ENV === 'production',
      };
      if (rememberMe.value) {
        cookieOptions.expires = 7; // 7 days
      }
      Cookies.set('token', access_token, cookieOptions);
      void router.push('/home');
    } else {
      console.error('Token not found in response:', response.data);
    }
  } catch (error) {
    console.error('Erro no login:', error);
  } finally {
    loading.value = false;
  }
}

function goToRegister() {
  void router.push('/register');
}
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.login-side-info {
  flex: 1.2;
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #1e293b 100%);
  position: relative;
  overflow: hidden;
}

.login-side-info::before {
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
  background: rgba(255, 255, 255, 0.15);
  color: white;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
}

.brand-logo:hover {
  transform: scale(1.05);
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

.login-side-form {
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
  transform: translateY(15px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.1s;
}

.form-header.header-animate {
  opacity: 1;
  transform: translateY(0);
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

.login-form {
  margin-bottom: 24px;
}

.login-form.form-fields-animate .form-item {
  opacity: 0;
  transform: translateY(15px);
  animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.login-form.form-fields-animate .form-item:nth-child(1) { animation-delay: 0.2s; }
.login-form.form-fields-animate .form-item:nth-child(2) { animation-delay: 0.25s; }
.login-form.form-fields-animate .form-item:nth-child(3) { animation-delay: 0.3s; }
.login-form.form-fields-animate .form-item:nth-child(4) { animation-delay: 0.35s; }

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.input-field {
  transition: all 0.3s ease;
  border-radius: 8px;
}

.input-field:hover,
.input-field:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.input-icon {
  color: #9ca3af;
  transition: color 0.3s ease;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.login-button {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  font-weight: 600;
  height: 48px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-button:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.form-divider {
  margin: 24px 0;
  opacity: 0;
  transition: opacity 0.4s ease;
  transition-delay: 0.4s;
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

.register-button {
  height: 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  color: #6b7280;
  opacity: 0;
  transform: translateY(15px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.45s;
}

.register-button.register-btn-animate {
  opacity: 1;
  transform: translateY(0);
}

.register-button:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-side-info {
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
