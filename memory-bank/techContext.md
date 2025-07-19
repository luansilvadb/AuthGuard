# Tech Context - AuthGuard

## Stack Tecnológica Completa

### Backend (NestJS)

```json
[object Object]
  framework": "NestJS,language:TypeScript,database:PostgreSQL",
  orm": TypeORM",
  authWT,validation":class-validator", class-transformer"],
 testing": [Jest,Supertest"],
 docs": Swagger/OpenAPI
}
```

### Frontend (Vue3 + Quasar + Ant Design)

```json
[object Object]
  framework":Vue 3,
buildTool:Quasar CLI",
 uiLibrary:Ant Design Vue,
  state": Pinia",
  "router:Vue Router",
  http: Axios",
 i18: ue I18,
  "icons": @ant-design/icons-vue
}
```

## Dependências Principais

### Backend Dependencies

```json
{
 @nestjs/common: 0,
  @nestjs/core: 00,  @nestjs/typeorm: 000,
 @nestjs/jwt: 00,@nestjs/passport": ^100,
  typeorm:^0.30,
  pg": "^8.11  class-validator": "^0.14.0class-transformer":^00.50.1,
  passport-jwt: ^400.1,
  bcryptjs": "^2.4.3
}
```

### Frontend Dependencies

```json
[object Object] vue: ^30.30,
  quasar":^2.140,
 ant-design-vue":^4.0.0@ant-design/icons-vue": ^7.0,
pinia": "^2.10,  vue-router": ^4.2.0,
axios": ^10.50,
  vue-i18n": ^9.2.0
}
```

## Configuração de Desenvolvimento

### Backend Setup

```bash
# Instalação
npm install -g @nestjs/cli
nest new authguard-backend
cd authguard-backend

# Dependências
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport-jwt
npm install class-validator class-transformer
npm install bcryptjs @types/bcryptjs

# Desenvolvimento
npm run start:dev
```

### Frontend Setup

```bash
# Instalação
npm install -g @quasar/cli
quasar create authguard-frontend
cd authguard-frontend

# Dependências
npm install ant-design-vue @ant-design/icons-vue
npm install pinia vue-router axios vue-i18n

# Desenvolvimento
quasar dev
```

## Configuração de Banco de Dados

### PostgreSQL Setup

```sql
-- Criar banco principal
CREATE DATABASE authguard_main;

-- Criar schema global
CREATE SCHEMA IF NOT EXISTS global;

-- Criar usuário com permissões
CREATE USER authguard_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE authguard_main TO authguard_user;
GRANT ALL PRIVILEGES ON SCHEMA global TO authguard_user;
```

### TypeORM Configuration

```typescript
// ormconfig.ts
export default {
  type: postgres, host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) ||5432 username: process.env.DB_USER || authguard_user',
  password: process.env.DB_PASSWORD || 'secure_password',
  database: process.env.DB_NAME || authguard_main,
  entities:__dirname +/**/*.entity{.ts,.js}],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV ===development',
}
```

## Variáveis de Ambiente

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=authguard_user
DB_PASSWORD=secure_password
DB_NAME=authguard_main

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24
JWT_REFRESH_EXPIRES_IN=7d

# App
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:900 Logging
LOG_LEVEL=debug
```

### Frontend (.env)

```env
# API
VITE_API_URL=http://localhost:30api
VITE_APP_TITLE=AuthGuard

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

## Scripts de Desenvolvimento

### Backend Scripts

```json[object Object]  scripts": {
start":nest start",
    start:dev": "nest start --watch",
  start:debug": "nest start --debug --watch,
 start:prod:node dist/main",
build":nest build",
  test": jest,
 test:watch": "jest --watch,
   test:cov": "jest --coverage,
   test:e2e":jest --config ./test/jest-e2e.json"
  }
}
```

### Frontend Scripts

```json[object Object]  scripts": {
    dev":quasar dev",
  build": "quasar build",
  build:pwa: quasar build -m pwa",
  build:ssr: "quasar build -m ssr,test:quasar test,
 test:e2e: quasar test --e2,   lint:eslint --ext .js,.ts,.vue ./,  format":prettier --write \"**/*.{js,ts,vue,scss,html,md,json}\}
}
```

## Estrutura de Arquivos

### Backend Structure

```
backend/
├── src/
│   ├── @types/           # Type definitions
│   ├── auth/            # Authentication module
│   ├── common/          # Shared utilities
│   ├── global/          # Global entities
│   ├── shared/          # Shared modules
│   ├── tenants/         # Tenants module
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/                # Test files
├── package.json
├── tsconfig.json
└── nest-cli.json
```

### Frontend Structure

```
frontend/
├── src/
│   ├── assets/          # Static assets
│   ├── boot/           # App initialization
│   ├── components/     # Vue components
│   ├── css/           # Styles
│   ├── i18n/          # Internationalization
│   ├── layouts/       # Layout components
│   ├── pages/         # Page components
│   ├── router/        # Vue Router
│   ├── stores/        # Pinia stores
│   └── App.vue
├── public/            # Public assets
├── package.json
├── quasar.config.ts
└── tsconfig.json
```

## Ferramentas de Desenvolvimento

### IDEs e Editores

- **VS Code**: Editor principal
- **Extensions**:
  - Vue Language Features
  - TypeScript Vue Plugin
  - ESLint
  - Prettier
  - Auto Rename Tag

### Ferramentas de Teste

- **Backend**: Jest + Supertest
- **Frontend**: Vitest + Vue Test Utils
- \*\*E2 Playwright (planejado)

### Ferramentas de Qualidade

- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript
- **Git Hooks**: Husky + lint-staged

## Configuração de Deploy

### Docker

```dockerfile
# Backend Dockerfile
FROM node:18lpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000CMD ["npm", run", "start:prod]
```

### Docker Compose

```yaml
version:3.8ervices:
  backend:
    build: ./backend
    ports:
      - "3000:3000
    environment:
      - DB_HOST=postgres
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "90080 depends_on:
      - backend

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: authguard_main
      POSTGRES_USER: authguard_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Monitoramento e Logs

### Logging

- **Backend**: Winston + NestJS Logger
- **Frontend**: Console + Error tracking
- **Format**: JSON structured logs

### Monitoring

- **Health Checks**: /health endpoint
- **Metrics**: Prometheus (planejado)
- **APM**: New Relic (planejado)

### Error Tracking

- **Backend**: Sentry (planejado)
- **Frontend**: Sentry (planejado)
