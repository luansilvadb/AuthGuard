# NestJS Multitenant SaaS Backend

This project implements a hybrid multitenancy backend using NestJS, TypeORM, and PostgreSQL.

## Features

- **Hybrid Multitenancy:**  
  - Global schema for shared data (users, tenants)
  - Isolated schemas per tenant for tenant-specific data
- **Dynamic Tenant Connections:**  
  - Middleware injects the correct tenant connection per request
- **User & Tenant Management:**  
  - Create tenants with owner user association
- **Example Tenant Data Table:**  
  - Each tenant schema includes a `products` table

## Setup Steps

1. **Install dependencies**  
   ```
   npm install
   ```

2. **Configure Environment Variables**  
   Create a `.env` file in the root with:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=secret
   DB_NAME=saas_main
   ```

3. **Run the Application**
   ```
   npm run start
   ```

## Usage

### 1. Authenticate (JWT required for tenant creation)
```
POST /auth/login
{
  "email": "user@example.com",
  "password": "senhasecreta"
}
```

### 2. Create a Tenant
```
POST /tenants
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Meu Primeiro Tenant"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Meu Primeiro Tenant",
  "slug": "tenant-171234567890"
}
```

### 3. Access Tenant Data
```
GET /products
X-Tenant-Slug: tenant-171234567890
```

## Notes

- JWT authentication guard is a placeholder; implement your own logic as needed.
- Database schemas and tables are created dynamically per tenant.
- Update PostgreSQL credentials in your `.env` file.
- Ensure your PostgreSQL server is running and accessible.
