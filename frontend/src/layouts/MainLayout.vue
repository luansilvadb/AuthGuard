<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider
      v-model:collapsed="collapsed"
      :width="280"
      :collapsed-width="80"
      class="auth-sidebar"
    >
      <div class="sidebar-logo-row" :class="{ collapsed }">
        <div v-if="!collapsed" class="logo-icon">
          <SafetyOutlined class="logo-svg" />
        </div>
        <span v-if="!collapsed" class="app-name">AuthGuard</span>
        <a-button
          type="text"
          :icon="collapsed ? h(MenuUnfoldOutlined) : h(MenuFoldOutlined)"
          @click="toggleCollapsed"
          class="sidebar-collapse-btn"
        />
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        class="auth-menu-unified"
        @click="handleMenuClick"
      >
        <a-menu-item key="/dashboard">
          <template #icon>
            <DashboardOutlined />
          </template>
          <span>Dashboard</span>
        </a-menu-item>
        <a-menu-item key="/tenants">
          <template #icon>
            <TeamOutlined />
          </template>
          <span>Tenants</span>
        </a-menu-item>
        <a-menu-item key="/users">
          <template #icon>
            <UserOutlined />
          </template>
          <span>Usuários</span>
        </a-menu-item>
        <a-menu-item key="/security">
          <template #icon>
            <SafetyCertificateOutlined />
          </template>
          <span>Segurança</span>
        </a-menu-item>
        <a-menu-item key="/reports">
          <template #icon>
            <BarChartOutlined />
          </template>
          <span>Relatórios</span>
        </a-menu-item>
        <a-menu-item key="/settings">
          <template #icon>
            <SettingOutlined />
          </template>
          <span>Configurações</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout class="main-layout">
      <a-layout-header class="auth-header">
        <div class="header-left">
          <div class="breadcrumb-section">
            <h1 class="page-title">{{ currentRouteName }}</h1>
            <span class="page-subtitle">{{ currentRouteDescription }}</span>
          </div>
        </div>
        <div class="header-right">
          <a-dropdown
            placement="bottomRight"
            trigger="click"
            :overlay-class-name="'notification-dropdown'"
            @visibleChange="handleDropdownVisibleChange"
          >
            <template #overlay>
              <div class="notification-dropdown-enterprise">
                <div class="notification-header">Notificações</div>
                <div v-if="notifications.length > 0" class="notification-list">
                  <div
                    v-for="(item, idx) in notifications"
                    :key="idx"
                    class="notification-item-enterprise"
                  >
                    <div class="notification-title-row">
                      <span class="notification-dot" />
                      <span class="notification-title">{{ item.title }}</span>
                    </div>
                    <div class="notification-desc">{{ item.description }}</div>
                    <div class="notification-time">{{ item.datetime }}</div>
                    <div v-if="idx !== notifications.length - 1" class="notification-divider" />
                  </div>
                </div>
                <div v-else class="notification-empty">Nenhuma notificação</div>
                <div class="notification-footer">
                  <a-button type="link" class="view-all-btn">Ver todas</a-button>
                </div>
              </div>
            </template>
            <a-badge :count="unreadCount" class="notification-badge">
              <a-button type="text" class="header-action-btn">
                <BellOutlined />
              </a-button>
            </a-badge>
          </a-dropdown>
          <a-dropdown placement="bottomRight" trigger="click">
            <a-button type="text" class="header-user-profile">
              <a-avatar size="small" class="user-avatar">
                <UserOutlined />
              </a-avatar>
              <div class="user-info">
                <span class="header-username">Admin</span>
                <span class="user-role">Administrador</span>
              </div>
              <DownOutlined class="header-dropdown-icon" />
            </a-button>
            <template #overlay>
              <a-menu class="user-dropdown">
                <a-menu-item key="profile">
                  <UserOutlined />
                  Meu Perfil
                </a-menu-item>
                <a-menu-item key="preferences">
                  <SettingOutlined />
                  Preferências
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined />
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
import { ref, computed, h, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Cookies } from 'quasar';
import {
  SafetyOutlined,
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  DownOutlined,
  BellOutlined
} from '@ant-design/icons-vue';

const router = useRouter();
const route = useRoute();

const collapsed = ref(false);
const selectedKeys = ref<string[]>([route.path]);

watch(() => route.path, (newPath) => {
  selectedKeys.value = [newPath];
});

interface Notification {
  title: string;
  description: string;
  datetime: string;
}

const notifications = ref<Notification[]>([
  {
    title: 'Novo usuário cadastrado',
    description: 'João Silva foi adicionado ao sistema.',
    datetime: 'Hoje, 09:12',
  },
  {
    title: 'Tenant ativado',
    description: 'TechStart Solutions foi ativado.',
    datetime: 'Ontem, 18:45',
  },
  {
    title: 'Permissão alterada',
    description: 'Permissão de Administrador concedida a Maria.',
    datetime: 'Ontem, 14:22',
  },
]);

const unreadCount = ref<number>(notifications.value.length);

const handleDropdownVisibleChange = (visible: boolean) => {
  if (visible) {
    unreadCount.value = 0;
  }
};

const routeNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/tenants': 'Tenants',
  '/users': 'Usuários',
  '/security': 'Segurança',
  '/reports': 'Relatórios',
  '/settings': 'Configurações',
};

const routeDescriptions: Record<string, string> = {
  '/dashboard': 'Visão geral e métricas do sistema',
  '/tenants': 'Gerenciamento de organizações',
  '/users': 'Controle de usuários e permissões',
  '/security': 'Políticas de segurança e auditoria',
  '/reports': 'Relatórios e análises',
  '/settings': 'Configurações do sistema',
};

const currentRouteName = computed(() => {
  return routeNames[route.path] || 'Dashboard';
});

const currentRouteDescription = computed(() => {
  return routeDescriptions[route.path] || 'Visão geral do sistema';
});

const handleMenuClick = ({ key }: { key: string }) => {
  selectedKeys.value = [key];
  void router.push(key);
};

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value;
};

const handleLogout = () => {
  Cookies.remove('token');
  void router.push('/login');
};
</script>

<style scoped lang="scss">
@import '../css/app-colors.scss';

.auth-sidebar {
  background: $neutral-light;
  border-right: 1px solid #e3e5e8;
  display: flex;
  flex-direction: column;
  .sidebar-logo-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 72px;
    padding: 0 12px 0 12px;
    gap: 12px;
    border-bottom: 1px solid #e3e5e8;
    background: linear-gradient(135deg, $neutral-light 0%, #e3e5e8 100%);
    // Centralizar botão quando collapsed
    &.collapsed {
      justify-content: center;
      .sidebar-collapse-btn {
        margin-left: 0;
      }
    }
  }
  .sidebar-collapse-btn {
    margin-left: auto;
    color: $auth-text-group-title;
    font-size: 18px;
    background: transparent;
    border: none;
    box-shadow: none;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    width: 44px;
    &:hover {
      color: $secondary-blue;
      background: #e6e8ec;
    }
  }
  .logo-icon {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, $primary-blue 0%, $secondary-blue 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: 0 1px 4px rgba(88, 101, 242, 0.10);
  }
  .logo-svg {
    font-size: 20px;
    color: white;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    transform: translateZ(0);
  }
  .app-name {
    font-size: 18px;
    font-weight: 700;
    color: #23272a;
    line-height: 1.2;
    white-space: nowrap;
    letter-spacing: -0.5px;
  }
  .ant-menu {
    background: transparent;
    border: none;
    padding-top: 0;
  }
  :deep(.ant-menu-item) {
    font-weight: 500;
    font-size: 15px;
    color: #23272a;
    border-radius: 8px;
    margin: 0 8px 4px 8px;
    transition: background 0.18s, color 0.18s;
    height: 48px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding-left: 24px;
    &:hover {
      background: rgba(30,64,175,0.06);
      color: $secondary-blue;
      .anticon {
        color: $secondary-blue;
      }
    }
  }
  :deep(.ant-menu-item-selected) {
    background: #e6eeff !important;
    color: #1e40af !important;
    font-weight: 700;
    /* Remover box-shadow para visual mais limpo */
    .anticon {
      color: #1e40af !important;
    }
  }
  :deep(.ant-menu-item .anticon) {
    font-size: 18px;
    color: #6b7280;
    transition: color 0.18s;
  }
  :deep(.ant-menu-item-selected .anticon),
  :deep(.ant-menu-item:hover .anticon) {
    color: $secondary-blue !important;
  }
  :deep(.ant-menu-item:not(.ant-menu-item-selected):hover) {
    background: rgba(30,64,175,0.06);
    color: $secondary-blue;
    .anticon {
      color: $secondary-blue;
    }
  }
}

.version-language-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.version-text {
  font-size: 12px;
  color: $auth-version-color;
  font-weight: 500;
}

.language-select {
  min-width: 48px;
  max-width: 56px;
  width: 56px;
  text-align: center;
  
  :deep(.ant-select-selector) {
    
    border: none !important;
    color: $auth-version-color !important;
    font-size: 12px !important;
    font-weight: 500 !important;
    padding: 0 16px 0 8px !important;
    min-height: 24px !important;
    height: 24px !important;
    box-shadow: none !important;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px !important;
    text-align: center;
    white-space: nowrap;
    overflow: visible !important;
    text-overflow: unset !important;
  }
  :deep(.ant-select-selection-item) {
    white-space: nowrap !important;
    overflow: visible !important;
    text-overflow: unset !important;
    text-align: center !important;
    padding: 0 !important;
    width: 100%;
    display: flex;
    justify-content: center;
  }
  :deep(.ant-select-arrow) {
    color: $auth-version-color !important;
    right: 0 !important;
    font-size: 10px !important;
  }
  :deep(.ant-select-dropdown) {
    min-width: 56px !important;
    background: $auth-background-dark !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 8px rgba(59,130,246,0.12) !important;
    padding: 4px 0 !important;
    left: 0 !important;
  }
  :deep(.ant-select-item-option) {
    font-size: 12px !important;
    color: $auth-version-color !important;
    padding: 4px 12px !important;
    border-radius: 4px !important;
    text-align: center;
    white-space: nowrap;
  }
  :deep(.ant-select-item-option-active),
  :deep(.ant-select-item-option-selected) {
    background: $auth-hover-dark !important;
    color: $secondary-blue !important;
  }
}

.auth-menu-unified {
  background: transparent;
  border: none;
  padding: 0;

  :deep(.ant-menu-item) {
    display: flex;
    align-items: center;
    position: relative;
    margin: 0;
    width: 100%;
    padding-left: 24px;
    padding-right: 16px;
    box-sizing: border-box;
    color: $auth-text-dark;
    background: transparent;
    border-radius: 8px;
    transition: background 0.18s, color 0.18s;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 0;
      background: $secondary-blue;
      border-radius: 0 2px 2px 0;
      transition: height 0.2s ease;
    }
  }

  :deep(.ant-menu-item:hover) {
    color: $secondary-blue;
    &::before {
      height: 20px;
    }
  }

  :deep(.ant-menu-item-selected) {
    
    color: $secondary-blue !important;
    margin: 0;
    width: 100%;
    transition: background 0.18s cubic-bezier(0.4, 0, 0.2, 1), color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
    &::before {
      height: 24px;
    }
  }

  :deep(.ant-menu-item-selected .anticon) {
    color: $secondary-blue !important;
  }

  :deep(.ant-menu-item-selected .menu-item-subtext) {
    color: $secondary-blue !important;
  }

  :deep(.ant-menu-item .anticon) {
    font-size: 16px;
    margin-right: 12px;
    color: $auth-text-group-title;
    transition: color 0.2s ease;
  }

  .menu-item-content {
    display: flex;
    flex-direction: column;
    line-height: 1.3;
    flex: 1;
  }

  .menu-item-title {
    font-weight: 500;
    font-size: 14px;
  }

  .menu-item-subtext {
    font-size: 11px;
    color: $auth-text-group-title;
    font-weight: 400;
    margin-top: 1px;
  }
}

.sidebar-footer {
  border-top: 1px solid $auth-border-dark;
  padding: 16px 0;
  background: linear-gradient(180deg, transparent 0%, $neutral-dark 100%);
}

.footer-section {
  padding: 0 12px;
}

.footer-menu {
  background: transparent;
  border: none;
  
  :deep(.ant-menu-item) {
    height: 40px;
    line-height: 40px;
    padding: 0 12px;
    border-radius: 6px;
    margin: 2px 0;
    color: $auth-text-light;
    font-size: 13px;
    
    &:hover {
      background: $auth-hover-dark;
      color: $secondary-blue;
    }
  }
  
  :deep(.ant-menu-item .anticon) {
    font-size: 14px;
    margin-right: 10px;
  }
}

.main-layout {
  background: $neutral-light;
}

.auth-header {
  background: $neutral-light;
  border-bottom: 1px solid #e3e5e8;
  padding: 0 24px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(88, 101, 242, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  height: 72px;
}

.collapse-toggle {
  color: $auth-text-light;
  font-size: 16px;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: $auth-hover-dark;
    color: $secondary-blue;
  }
}

.breadcrumb-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  height: 100%;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: $auth-text-dark;
  line-height: 1.2;
  display: flex;
  align-items: center;
  height: 32px;
}

.page-subtitle {
  font-size: 13px;
  color: $auth-text-group-title;
  font-weight: 400;
  display: flex;
  align-items: center;
  height: 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-badge {
  :deep(.ant-badge-count) {
    background: #ff4d4f;
    color: #fff;
    box-shadow: none;
    border: none;
    font-size: 12px;
    font-weight: 400;
    min-width: 18px;
    height: 18px;
    line-height: 18px;
    padding: 0 5px;
    display: inline-block;
    text-align: center;
    vertical-align: middle;
  }
}

.header-action-btn {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  color: $auth-text-light;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  box-shadow: none;
  padding: 0;
  margin: 0;
  transition: background 0.18s, color 0.18s;
  
  &:hover {
    background: transparent !important;
    color: $secondary-blue;
    border-color: transparent;
  }
}

.header-user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  height: 48px;
  border-radius: 8px;
  color: $auth-text-light;
  background: transparent;
  border: 1px solid transparent;
  transition: background 0.18s, color 0.18s;
  
  &:hover {
    background: transparent !important;
    border-color: transparent;
    color: $auth-text-light;
    box-shadow: none;
    .header-username {
      color: #1677ff;
    }
  }
}

.user-avatar {
  background: $secondary-blue;
  color: white;
  font-size: 14px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
}

.header-username {
  font-weight: 600;
  color: $auth-text-dark;
  font-size: 14px;
  line-height: 1.2;
}

.user-role {
  font-size: 11px;
  color: $auth-text-group-title;
  font-weight: 400;
}

.header-dropdown-icon {
  font-size: 12px;
  color: $auth-text-light;
  margin-left: 4px;
}

.user-dropdown {
  :deep(.ant-menu) {
    min-width: 56px !important;
    background: $auth-background-dark !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 8px rgba(59,130,246,0.12) !important;
    padding: 4px 0 !important;
    left: 0 !important;
  }

  :deep(.ant-menu-item) {
    color: $auth-text-light;
    padding: 8px 16px;
    height: 40px;
    line-height: 24px;
  }

  :deep(.ant-menu-item:hover) {
    background: $auth-hover-dark !important;
    color: $secondary-blue !important;
  }
}

.auth-content {
  padding: 24px;
  background: $neutral-light;
  min-height: calc(100vh - 72px);
  color: $auth-text-dark;
}

.notification-dropdown {
  min-width: 320px;
  max-width: 360px;
  padding: 0;
  .notification-list {
    max-height: 320px;
    overflow-y: auto;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 24px rgba(30, 64, 175, 0.10);
    .notification-item {
      padding: 12px 18px 10px 18px;
      border-bottom: 1px solid #f0f0f0;
      &:last-child {
        border-bottom: none;
      }
      .notification-title {
        font-weight: 600;
        color: #23272a;
        font-size: 15px;
        margin-bottom: 2px;
      }
      .notification-desc {
        color: #6b7280;
        font-size: 13px;
        margin-bottom: 2px;
      }
      .notification-time {
        color: #a1a1aa;
        font-size: 12px;
        text-align: right;
      }
    }
  }
  .notification-empty {
    padding: 32px 0;
    text-align: center;
    color: #a1a1aa;
    font-size: 15px;
  }
}

/* Adicionar estilos enterprise para o dropdown de notificações */
.notification-dropdown-enterprise {
  min-width: 340px;
  max-width: 380px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(30, 64, 175, 0.12);
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.notification-header {
  font-weight: 700;
  font-size: 17px;
  color: #1e293b;
  padding: 18px 24px 10px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
}
.notification-list {
  max-height: 320px;
  overflow-y: auto;
  background: #fff;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}
.notification-item-enterprise {
  padding: 16px 24px 10px 24px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
}
.notification-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.notification-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1677ff;
  display: inline-block;
}
.notification-title {
  font-weight: 600;
  color: #23272a;
  font-size: 15px;
}
.notification-desc {
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 2px;
}
.notification-time {
  color: #a1a1aa;
  font-size: 12px;
  text-align: right;
}
.notification-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 12px 0 0 0;
  width: 100%;
}
.notification-item-enterprise:last-child .notification-divider {
  display: none;
}
.notification-empty {
  padding: 40px 0;
  text-align: center;
  color: #a1a1aa;
  font-size: 15px;
}
.notification-footer {
  border-top: 1px solid #f0f0f0;
  background: #fafbfc;
  padding: 10px 0 10px 0;
  text-align: center;
}
.view-all-btn {
  color: #1677ff;
  font-weight: 500;
  font-size: 14px;
  padding: 0 16px;
}

@media (max-width: 768px) {
  .auth-header {
    padding: 0 16px;
  }

  .auth-content {
    padding: 16px;
  }

  .user-info {
    display: none;
  }
  
  .page-subtitle {
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
  
  .header-right {
    gap: 8px;
  }
}
</style>
