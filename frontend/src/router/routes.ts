import { Cookies } from 'quasar';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/register',
    component: () => import('pages/RegisterPage.vue'),
  },
  {
    path: '/create-tenant',
    component: () => import('pages/CreateTenantPage.vue'),
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'dashboard', component: () => import('pages/DashboardPage.vue') },
      { path: 'tenants', component: () => import('pages/TenantsPage.vue') }, // UI/UX customizada
      { path: 'users', component: () => import('pages/UserPage.vue') },
      { path: 'security', component: () => import('pages/SecurityPage.vue') },
      { path: 'reports', component: () => import('pages/ReportsPage.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') },
    ],
    beforeEnter: (to, from, next) => {
      const token = Cookies.get('token');
      if (token) {
        if (to.path === '/') {
          next('/dashboard'); // Redirect to dashboard if no specific path
        } else {
          next();
        }
      } else {
        next('/login');
      }
    },
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
