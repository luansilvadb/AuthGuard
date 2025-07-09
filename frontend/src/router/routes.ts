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
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: 'home', component: () => import('pages/IndexPage.vue') }],
    beforeEnter: (to, from, next) => {
      const token = Cookies.get('token');
      if (token) {
        if (to.path === '/') {
          next('/home');
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
