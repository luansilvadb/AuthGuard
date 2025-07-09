<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider
      v-model:collapsed="collapsed"
      :width="250"
      :collapsed-width="80"
      class="auth-sidebar"
    >
      <!-- Header com Logo e Versão -->
      <div class="sidebar-header">
        <div class="logo-section">
          <div class="logo-icon">
            <safety-outlined />
          </div>
          <div v-if="!collapsed" class="logo-info">
            <h1 class="app-name">AuthGuard</h1>
            <div class="version-language-row">
              <span class="version">v2.2.10</span>
              <template v-if="isRefreshing">
                <loading-outlined class="refresh-icon" />
              </template>
              <template v-else>
                <sync-outlined class="refresh-icon" @click="handleRefreshClick" />
              </template>
              <a-select v-model:value="selectedLanguage" size="small" class="lang-select">
                <a-select-option value="PT">PT</a-select-option>
                <a-select-option value="EN">EN</a-select-option>
              </a-select>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu Unificado -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        class="auth-menu-unified"
        @click="handleMenuClick"
      >
        <a-menu-group title="Principal">
          <a-menu-item key="/home">
            <template #icon>
              <home-outlined />
            </template>
            <span>Dashboard</span>
          </a-menu-item>

          <a-menu-item key="/actions">
            <template #icon>
              <play-circle-outlined />
            </template>
            <span>Actions</span>
          </a-menu-item>

          <a-menu-item key="/monitor">
            <template #icon>
              <bar-chart-outlined />
            </template>
            <span>Monitor</span>
          </a-menu-item>

          <a-menu-item key="/tenants">
            <template #icon>
              <global-outlined />
            </template>
            <span>Domains</span>
          </a-menu-item>

          <a-menu-item key="/settings">
            <template #icon>
              <setting-outlined />
            </template>
            <span>Settings</span>
          </a-menu-item>
        </a-menu-group>

        <a-menu-group title="Recursos">
          <a-menu-item key="docs">
            <template #icon>
              <book-outlined />
            </template>
            <span>Documentation</span>
          </a-menu-item>

          <a-menu-item key="discord">
            <template #icon>
              <message-outlined />
            </template>
            <span>Discord</span>
          </a-menu-item>

          <a-menu-item key="feedback">
            <template #icon>
              <comment-outlined />
            </template>
            <span>Feedback</span>
          </a-menu-item>

          <a-menu-item key="changelog">
            <template #icon>
              <star-outlined />
            </template>
            <span>Changelog</span>
          </a-menu-item>
        </a-menu-group>

        <a-menu-group title="Ações">
          <a-menu-item key="_dark_mode_toggle">
            <template #icon>
              <bulb-outlined />
            </template>
            <span>Dark Mode</span>
            <a-switch v-model:checked="darkMode" size="small" class="dark-mode-switch" />
          </a-menu-item>

          <a-menu-item key="_logout_action" class="logout-item">
            <template #icon>
              <logout-outlined />
            </template>
            <span>Logout</span>
          </a-menu-item>
        </a-menu-group>
      </a-menu>
    </a-layout-sider>

    <a-layout class="main-layout">
      <a-layout-header class="auth-header">
        <div class="header-left">
          <a-button
            type="text"
            :icon="collapsed ? h(MenuUnfoldOutlined) : h(MenuFoldOutlined)"
            @click="toggleCollapsed"
            class="collapse-toggle"
          />
          <h1 class="page-title">{{ currentRouteName }}</h1>
        </div>

        <div class="header-right">
          <a-dropdown placement="bottomRight">
            <a-button type="text" class="user-menu">
              <a-avatar :size="32" :icon="h(UserOutlined)" class="user-avatar" />
              <span class="username">Admin</span>
              <down-outlined />
            </a-button>

            <template #overlay>
              <a-menu class="user-dropdown">
                <a-menu-item key="profile">
                  <user-outlined />
                  Perfil
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <logout-outlined />
                  Sair
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <a-layout-content class="auth-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Cookies } from 'quasar';
import { message } from 'ant-design-vue'; // Importar o componente message
import {
  HomeOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  GlobalOutlined,
  SettingOutlined,
  BookOutlined,
  MessageOutlined,
  CommentOutlined,
  StarOutlined,
  BulbOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SafetyOutlined,
  DownOutlined,
  SyncOutlined,
  LoadingOutlined, // Adicionado LoadingOutlined
} from '@ant-design/icons-vue';

const router = useRouter();
const route = useRoute();

const collapsed = ref(false);
const selectedKeys = ref<string[]>([]);
const selectedLanguage = ref('EN'); // Alterado para EN conforme a imagem
const darkMode = ref(true);
const isRefreshing = ref(false); // Nova ref para controlar a animação de refresh

const routeNames: Record<string, string> = {
  '/home': 'Dashboard',
  '/actions': 'Actions',
  '/monitor': 'Monitor',
  '/tenants': 'Domains',
  '/settings': 'Settings',
};

const currentRouteName = computed(() => {
  return routeNames[route.path] || 'Dashboard';
});

const handleMenuClick = ({ key }: { key: string }) => {
  selectedKeys.value = [key]; // Sempre seleciona o item clicado

  if (key === '_dark_mode_toggle') {
    // Ação do toggle Dark Mode será tratada pelo v-model do a-switch
  } else if (key === '_logout_action') {
    handleLogout();
  } else if (key.startsWith('/')) {
    // Não faz nada para as rotas do menu principal por enquanto, apenas seleciona
    console.log(`Navegação desativada para: ${key}`);
  } else {
    // Para outros itens que não são rotas (docs, discord, etc.), também não navega
    console.log(`Item secundário clicado: ${key}`);
  }
};

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value;
};

const handleLogout = () => {
  Cookies.remove('token');
  void router.push('/login');
};

const handleRefreshClick = () => {
  isRefreshing.value = true;
  message.success('Atualizado!'); // Exibe a mensagem de sucesso

  // Simula um tempo de "refresh" e desativa a animação
  setTimeout(() => {
    isRefreshing.value = false;
  }, 1000); // Animação de 1 segundo
};
</script>

<style scoped lang="scss">
/* Adicionado lang="scss" para usar variáveis */
@import '../css/app-colors.scss';

/* Sidebar Auth Style */
.auth-sidebar {
  background: $auth-background-dark;
  border-right: 1px solid $auth-border-dark;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header da Sidebar */
.sidebar-header {
  height: 64px; /* Altura igual ao header principal */
  display: flex; /* Usar flexbox para centralizar conteúdo */
  align-items: center; /* Centralizar verticalmente */
  padding: 0 16px 0 24px; /* Ajustar padding para alinhar */
  border-bottom: 1px solid $auth-border-dark;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0; /* Remover margem inferior se houver */
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: $primary-blue;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $auth-text-dark;
  font-size: 24px;
  flex-shrink: 0;
  position: relative; /* Adicionado para permitir ajuste de top */
  top: -4px; /* Ajuste este valor para mover o ícone para cima/baixo */
}

.logo-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Alinha os itens à esquerda */
  justify-content: center; /* Centraliza verticalmente o conteúdo */
  padding: 0; /* Garante que não há padding */
}

.app-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: $secondary-blue;
  line-height: 1; /* Tighter line height */
  white-space: nowrap; /* Prevent wrapping */
}

.version-language-row {
  display: flex;
  align-items: center;
  gap: 8px; /* Espaçamento entre versão, refresh e language */
  margin-top: -2px; /* Ajuste este valor para controlar a proximidade */
}

.version {
  font-size: 14px;
  font-family: 'Inter Variable', sans-serif; /* Aplica a fonte Inter Variable */
  color: $auth-version-color;
  margin: 0; /* Ensures no default margin */
  line-height: 1; /* Tighter line height */
  white-space: nowrap; /* Prevent wrapping */
}

.refresh-icon {
  font-size: 12px;
  color: $auth-text-light;
  cursor: pointer;
}

.lang-select {
  width: 60px;
}

.lang-select :deep(.ant-select-selector) {
  background: transparent !important; /* Remove background */
  border: none !important; /* Remove border */
  box-shadow: none !important; /* Remove shadow */
  color: $auth-text-dark !important;
}

.lang-select :deep(.ant-select-arrow) {
  color: $auth-text-light !important;
}

/* Menu Unificado */
.auth-menu-unified {
  background: transparent;
  border: none;
  padding: 0;
  flex: 1; /* Para ocupar o espaço restante */
  overflow-y: auto; /* Para permitir scroll se o conteúdo for grande */
}

.auth-menu-unified :deep(.ant-menu-item) {
  height: 44px; /* Altura padrão para todos os itens */
  line-height: 44px;
  padding: 0 8px 0 24px; /* top right bottom left (ajustado para alinhar) */
  border-radius: 4px;
  color: $auth-text-light;
  background: transparent;
  font-size: 16px; /* Tamanho da fonte padrão */
}

.auth-menu-unified :deep(.ant-menu-item:hover) {
  background: $auth-hover-dark !important;
  color: $auth-text-dark !important;
  padding: 0 8px 0 24px !important; /* Mantém o padding ao hover */
}

.auth-menu-unified :deep(.ant-menu-item-selected) {
  background: $auth-selected-dark !important;
  color: $secondary-blue !important;
  padding: 0 8px 0 24px !important; /* Mantém o padding ao selecionar */
}

.auth-menu-unified :deep(.ant-menu-item-selected::after) {
  display: none;
}

.auth-menu-unified :deep(.ant-menu-item .anticon) {
  font-size: 16px;
  margin-right: 12px;
}

.auth-menu-unified :deep(.ant-menu-item-group-title) {
  color: $auth-text-group-title; /* Cor para os títulos dos grupos */
  font-size: 12px;
  padding-left: 16px;
  margin-top: 16px;
  margin-bottom: 8px;
}

/* Esconder texto quando colapsado */
.auth-sidebar.ant-layout-sider-collapsed
  .auth-menu-unified
  :deep(.ant-menu-item .ant-menu-title-content) {
  display: none;
}

.dark-mode-switch {
  margin-left: auto; /* Empurra o switch para a direita */
}

.logout-item :deep(.anticon) {
  color: $auth-red-error;
}

.logout-item:hover {
  background: $auth-red-error !important;
  color: $auth-text-dark !important;
}

/* Main Layout */
.main-layout {
  background: $auth-background-dark;
}

.auth-header {
  background: $auth-background-dark;
  border-bottom: 1px solid $auth-border-dark;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-toggle {
  color: $auth-text-light !important;
  font-size: 16px !important;
  width: 32px !important;
  height: 32px !important;
  border-radius: 4px !important;
}

.collapse-toggle:hover {
  background: $auth-hover-dark !important;
  color: $secondary-blue !important;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: $auth-text-dark;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px !important;
  height: 40px !important;
  border-radius: 4px !important;
  color: $auth-text-light !important;
}

.user-menu:hover {
  background: $auth-hover-dark !important;
}

.user-avatar {
  background: $primary-blue !important;
  color: $auth-text-dark !important;
}

.username {
  font-weight: 500;
  color: $auth-text-dark;
}

.user-dropdown :deep(.ant-menu) {
  background: $auth-background-dark !important;
  border: 1px solid $auth-border-dark !important;
}

.user-dropdown :deep(.ant-menu-item) {
  color: $auth-text-light !important;
}

.user-dropdown :deep(.ant-menu-item:hover) {
  background: $auth-hover-dark !important;
  color: $auth-text-dark !important;
}

/* Content */
.auth-content {
  padding: 24px;
  background: $auth-background-dark;
  min-height: calc(100vh - 64px);
  color: $auth-text-dark;
}

/* Responsividade */
@media (max-width: 768px) {
  .auth-header {
    padding: 0 16px 0 24px;
  }

  .auth-content {
    padding: 16px;
  }

  .username {
    display: none;
  }
}

@media (max-width: 480px) {
  .auth-sidebar {
    position: fixed;
    z-index: 1000;
    height: 100vh;
  }

  .auth-content {
    padding: 12px;
  }
}
</style>
