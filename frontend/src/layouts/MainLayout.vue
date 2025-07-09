<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider
      v-model:collapsed="collapsed"
      collapsible
      :width="260"
      :collapsed-width="80"
      class="enterprise-sider"
    >
      <div class="logo">
        <div class="logo-icon">
          <safety-outlined />
        </div>
        <h1 v-if="!collapsed" class="logo-text">AuthGuard</h1>
      </div>

      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="light"
        mode="inline"
        class="enterprise-menu"
        @click="handleMenuClick"
      >
        <a-menu-item key="/home">
          <template #icon>
            <home-outlined />
          </template>
          <span>Dashboard</span>
        </a-menu-item>

        <a-menu-item key="/users">
          <template #icon>
            <user-outlined />
          </template>
          <span>Usuários</span>
        </a-menu-item>

        <a-menu-item key="/tenants">
          <template #icon>
            <apartment-outlined />
          </template>
          <span>Tenants</span>
        </a-menu-item>

        <a-menu-item key="/settings">
          <template #icon>
            <setting-outlined />
          </template>
          <span>Configurações</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <a-layout-header class="enterprise-header">
        <div class="header-left">
          <a-button
            type="text"
            :icon="collapsed ? h(MenuUnfoldOutlined) : h(MenuFoldOutlined)"
            @click="toggleCollapsed"
            class="collapse-btn"
          />
          <div class="page-title">
            <h1>{{ currentRouteName }}</h1>
          </div>
        </div>

        <div class="header-right">
          <a-space :size="16">
            <a-button type="text" shape="circle" :icon="h(BellOutlined)" class="header-action" />

            <a-dropdown placement="bottomRight">
              <a-button type="text" class="user-profile">
                <a-avatar :size="32" :icon="h(UserOutlined)" />
                <span v-if="!isMobile" class="username">Admin</span>
                <down-outlined />
              </a-button>

              <template #overlay>
                <a-menu>
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
          </a-space>
        </div>
      </a-layout-header>

      <a-layout-content class="enterprise-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, watchEffect, computed, h, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Cookies } from 'quasar';
import {
  HomeOutlined,
  UserOutlined,
  ApartmentOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  LogoutOutlined,
  SafetyOutlined,
  DownOutlined,
} from '@ant-design/icons-vue';

const router = useRouter();
const route = useRoute();

const collapsed = ref(false);
const selectedKeys = ref<string[]>([]);
const isMobile = ref(false);

const routeNames: Record<string, string> = {
  '/home': 'Dashboard',
  '/users': 'Usuários',
  '/tenants': 'Tenants',
  '/settings': 'Configurações',
};

const currentRouteName = computed(() => {
  return routeNames[route.path] || 'Dashboard';
});

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
  if (isMobile.value) {
    collapsed.value = true;
  }
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

watchEffect(() => {
  selectedKeys.value = [route.path];
});

const handleMenuClick = ({ key }: { key: string }) => {
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

<style scoped>
/* Sider Enterprise */
.enterprise-sider {
  background: #ffffff;
  border-right: 1px solid #f0f0f0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

/* Logo */
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #1e40af;
  color: white;
  font-size: 16px;
  flex-shrink: 0;
}

.logo-text {
  margin: 0 0 0 12px;
  font-size: 18px;
  font-weight: 600;
  color: #1e40af;
  white-space: nowrap;
}

/* Menu Enterprise */
.enterprise-menu {
  border: none;
  background: transparent;
  padding: 0 16px;
}

.enterprise-menu .ant-menu-item {
  height: 44px;
  line-height: 44px;
  margin: 4px 0;
  border-radius: 6px;
  color: #4b5563;
  font-weight: 500;
}

.enterprise-menu .ant-menu-item:hover {
  background-color: #f3f4f6;
  color: #1e40af;
}

.enterprise-menu .ant-menu-item-selected {
  background-color: #eff6ff !important;
  color: #1e40af !important;
  border-right: none;
}

.enterprise-menu .ant-menu-item-selected::after {
  display: none;
}

.enterprise-menu .ant-menu-item .anticon {
  font-size: 16px;
  margin-right: 12px;
}

/* Header Enterprise */
.enterprise-header {
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  color: #6b7280;
  font-size: 16px;
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

.collapse-btn:hover {
  background-color: #f3f4f6;
  color: #1e40af;
}

.page-title h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-action {
  color: #6b7280;
  font-size: 16px;
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

.header-action:hover {
  background-color: #f3f4f6;
  color: #1e40af;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  height: 40px;
  border-radius: 8px;
  color: #4b5563;
}

.user-profile:hover {
  background-color: #f3f4f6;
}

.username {
  font-weight: 500;
  font-size: 14px;
}

/* Content Enterprise */
.enterprise-content {
  padding: 24px;
  background: #f9fafb;
  min-height: calc(100vh - 64px);
}

/* Responsividade */
@media (max-width: 768px) {
  .enterprise-header {
    padding: 0 16px;
  }

  .enterprise-content {
    padding: 16px;
  }

  .username {
    display: none;
  }
}

@media (max-width: 480px) {
  .page-title h1 {
    font-size: 18px;
  }

  .enterprise-sider {
    position: fixed;
    z-index: 1000;
    height: 100vh;
  }

  .enterprise-content {
    padding: 12px;
  }
}
</style>
