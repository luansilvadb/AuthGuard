import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';
import { useTenantStore } from 'src/stores/tenant-store';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: 'http://localhost:3000/api' });

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  // Interceptor para adicionar headers de tenant automaticamente
  api.interceptors.request.use((config) => {
    // Verificar se a requisição precisa de headers de tenant
    const needsTenantHeaders = config.url?.includes('/api/software/') || 
                              config.url?.includes('/software/') ||
                              config.url?.includes('/api/tenants/') ||
                              config.url?.includes('/tenants/');
    
    if (needsTenantHeaders) {
      // Importar o store dinamicamente para evitar problemas de SSR
      try {
        const tenantStore = useTenantStore();
        const tenantHeaders = tenantStore.getTenantHeaders();
        
        if (tenantHeaders['X-Tenant-Slug']) {
          if (config.headers && typeof config.headers.set === 'function') {
            config.headers.set('X-Tenant-Slug', tenantHeaders['X-Tenant-Slug']);
          } else if (config.headers && typeof config.headers === 'object') {
            config.headers['X-Tenant-Slug'] = tenantHeaders['X-Tenant-Slug'];
          }
          // Nunca atribua um novo objeto a config.headers!
        }
      } catch (error) {
        // Se não conseguir acessar o store, continua sem headers
        console.warn('Não foi possível acessar o tenant store:', error);
      }
    }
    
    return config;
  }, (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  });
});

export { api };
