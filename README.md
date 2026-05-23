# Warehouse Management System (WMS) Backend

This is the backend API service for the Warehouse Management System, built with **NestJS, PostgreSQL, Redis, and Prisma ORM** based on Clean Architecture principles.

## Production Deployment (VPS)

You can easily deploy the entire stack using Docker and Docker Compose. This allows you to smoothly run the app on any VPS in a secure, isolated environment.

### Prerequisites
- Docker
- Docker Compose

### Deployment Steps

1. **Clone the repository** to your VPS:
   ```bash
   git clone <your-repository-url>
   cd wms
   ```

2. **Configure Environment Variables**:
   Copy the example environment file and fill in your secure production credentials:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file and set strong passwords for `POSTGRES_PASSWORD`, `JWT_SECRET`, `ADMIN_PASSWORD`, and `GRAFANA_ADMIN_PASSWORD`.

3. **Build and start the production containers**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

**What happens during deployment:**
- The `postgres`, `redis`, and `loki` containers will start and initialize in an isolated internal network.
- The `api` Node.js container image is built locally.
- A startup script runs within the API container that executes `npx prisma migrate deploy` to ensure the database schema is up-to-date.
- The NestJS app is exposed to the host machine on port `4000` (or whatever `API_PORT` is set to).
- Grafana is exposed to the host machine on port `3001` (or whatever `GRAFANA_PORT` is set to).

### Manual Super Admin Seeding
Since this is a staging/production-like deployment, database seeding is not automatic upon container start. Whenever you need to manually seed the Super Admin, execute:
```bash
docker-compose -f docker-compose.prod.yml exec api npm run seed:admin
```

### Accessing the System
- **API URL Base:** `http://<your-vps-ip>:4000`
- **Swagger Documentation:** `http://<your-vps-ip>:4000/api/docs`
- **Grafana Dashboard:** `http://<your-vps-ip>:3001`

---

## 🔒 Development vs. Production Environments

This repository maintains two separate Docker Compose configurations to ensure speed during development and security during production.

| Feature | Development (`docker-compose.yml`) | Production (`docker-compose.prod.yml`) |
| :--- | :--- | :--- |
| **Network Exposure** | All internal services (DB, Redis, Loki) are exposed to the host network for easy local debugging. | Only the `api` and `grafana` containers are exposed. DB, Redis, and Loki are hidden in an isolated internal network. |
| **Grafana Authentication**| Anonymous login is enabled and granted `Admin` permissions. No login required. | Anonymous login is disabled. Requires login using the credentials defined in `GRAFANA_ADMIN_USER` and `GRAFANA_ADMIN_PASSWORD`. |
| **Configuration** | Uses hardcoded fallback values if `.env` is missing to ensure it runs out-of-the-box. | Strictly requires a fully populated `.env` file to start. |

---

## Local Development Setup

If you wish to run the app directly via Node.js for development:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the database and redis dependencies using docker-compose:
   ```bash
   docker-compose up -d postgres redis
   ```

3. Run migrations and database seeding locally:
   ```bash
   npx prisma migrate dev
   npm run seed:admin:dev
   ```

4. Run the development server:
   ```bash
   npm run start:dev
   ```
