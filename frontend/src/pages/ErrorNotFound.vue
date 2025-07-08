<template>
  <div class="error-container">
    <div class="error-content" :class="{ 'content-loaded': pageLoaded }">
      <!-- Animated Background -->
      <div class="background-animation">
        <div class="floating-shape shape-1"></div>
        <div class="floating-shape shape-2"></div>
        <div class="floating-shape shape-3"></div>
        <div class="floating-shape shape-4"></div>
      </div>

      <!-- Main Content -->
      <div class="main-content" :class="{ 'content-animate': pageLoaded }">
        <!-- 404 Number -->
        <div class="error-number" :class="{ 'number-animate': pageLoaded }">
          <span class="digit">4</span>
          <span class="digit">0</span>
          <span class="digit">4</span>
        </div>

        <!-- Error Message -->
        <div class="error-message" :class="{ 'message-animate': pageLoaded }">
          <h1 class="error-title">Página Não Encontrada</h1>
          <p class="error-description">
            Oops! A página que você está procurando não existe ou foi movida para outro local.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons" :class="{ 'buttons-animate': pageLoaded }">
          <a-button
            type="primary"
            size="large"
            class="home-button"
            @click="goHome"
          >
            <template #icon>
              <home-outlined />
            </template>
            Voltar ao Início
          </a-button>

          <a-button
            type="default"
            size="large"
            class="back-button"
            @click="goBack"
          >
            <template #icon>
              <arrow-left-outlined />
            </template>
            Voltar
          </a-button>
        </div>

        <!-- Help Section -->
        <div class="help-section" :class="{ 'help-animate': pageLoaded }">
          <a-divider>
            <span class="divider-text">Precisa de ajuda?</span>
          </a-divider>

          <div class="help-options">
            <div class="help-item">
              <question-circle-outlined class="help-icon" />
              <span>Consulte nossa documentação</span>
            </div>
            <div class="help-item">
              <message-outlined class="help-icon" />
              <span>Entre em contato conosco</span>
            </div>
            <div class="help-item">
              <bug-outlined class="help-icon" />
              <span>Reporte um problema</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Brand Footer -->
      <div class="brand-footer" :class="{ 'footer-animate': pageLoaded }">
        <div class="brand-info">
          <safety-outlined class="brand-icon" />
          <span class="brand-name">AuthGuard Enterprise</span>
        </div>
        <p class="brand-tagline">Protegendo seus acessos com excelência</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  HomeOutlined,
  ArrowLeftOutlined,
  QuestionCircleOutlined,
  MessageOutlined,
  BugOutlined,
  SafetyOutlined
} from '@ant-design/icons-vue';

const router = useRouter();
const pageLoaded = ref(false);

onMounted(() => {
  setTimeout(() => {
    pageLoaded.value = true;
  }, 150);
});

function goHome() {
  void router.push('/');
}

function goBack() {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    void router.push('/');
  }
}
</script>

<style scoped>
.error-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #1e293b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.error-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.error-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 600px;
  width: 100%;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.error-content.content-loaded {
  opacity: 1;
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 100px;
  height: 100px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 20%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.shape-4 {
  width: 120px;
  height: 120px;
  bottom: 15%;
  right: 10%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateY(10px) rotate(240deg);
  }
}

.main-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 64px 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-content.content-animate {
  opacity: 1;
  transform: translateY(0);
}

.error-number {
  margin-bottom: 32px;
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.1s;
}

.error-number.number-animate {
  opacity: 1;
  transform: scale(1);
}

.digit {
  display: inline-block;
  font-size: 120px;
  font-weight: 900;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 8px;
  text-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  animation: bounce 0.4s ease-in-out;
}

.digit:nth-child(1) { animation-delay: 0.05s; }
.digit:nth-child(2) { animation-delay: 0.1s; }
.digit:nth-child(3) { animation-delay: 0.15s; }

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.error-message {
  margin-bottom: 40px;
  opacity: 0;
  transform: translateY(15px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.2s;
}

.error-message.message-animate {
  opacity: 1;
  transform: translateY(0);
}

.error-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.error-description {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
  opacity: 0;
  transform: translateY(15px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.3s;
}

.action-buttons.buttons-animate {
  opacity: 1;
  transform: translateY(0);
}

.home-button {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.home-button:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
}

.back-button {
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.back-button:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2);
}

.help-section {
  opacity: 0;
  transform: translateY(15px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.4s;
}

.help-section.help-animate {
  opacity: 1;
  transform: translateY(0);
}

.divider-text {
  color: #9ca3af;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.95);
  padding: 0 16px;
}

.help-options {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 24px;
}

.help-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.help-item:hover {
  color: #3b82f6;
}

.help-icon {
  font-size: 16px;
}

.brand-footer {
  margin-top: 32px;
  opacity: 0;
  transform: translateY(15px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.5s;
}

.brand-footer.footer-animate {
  opacity: 1;
  transform: translateY(0);
}

.brand-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.brand-icon {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.9);
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.brand-tagline {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .error-container {
    padding: 16px;
  }

  .main-content {
    padding: 48px 24px;
    border-radius: 16px;
  }

  .digit {
    font-size: 80px;
    margin: 0 4px;
  }

  .error-title {
    font-size: 24px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .help-options {
    flex-direction: column;
    gap: 16px;
  }

  .floating-shape {
    display: none;
  }
}

@media (max-width: 480px) {
  .digit {
    font-size: 60px;
  }

  .error-title {
    font-size: 20px;
  }

  .error-description {
    font-size: 14px;
  }
}
</style>
