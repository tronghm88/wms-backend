# Warehouse Management System (WMS) Backend

This is the backend API service for the Warehouse Management System, built with **NestJS, PostgreSQL, Redis, and Prisma ORM** based on Clean Architecture principles.

## Docker Deployment (VPS)

You can easily deploy the entire stack (PostgreSQL, Redis, and the Node.js API) using Docker and Docker Compose. This allows you to smoothly run the app on any VPS.

### Prerequisites
- Docker
- Docker Compose

### Deployment Steps

1. **Clone the repository** to your VPS:
   ```bash
   git clone <your-repository-url>
   cd wms
   ```

2. **Configure Environment Variables** (Optional but recommended):
   Create a `.env` file in the root directory to override default credentials for production:
   ```env
   POSTGRES_USER=admin
   POSTGRES_PASSWORD=my_secure_password
   POSTGRES_DB=wms
   JWT_SECRET=super_secret_jwt_key
   ```

3. **Build and start the containers**:
   ```bash
   docker-compose up -d --build
   ```

**What happens during deployment:**
- The `postgres` and `redis` containers will start and initialize.
- The `api` Node.js container image is built locally.
- The `api` container waits for the database to establish a healthy connection.
- A startup script runs within the API container that executes `npx prisma migrate deploy` and the `npm run seed:admin` scripts sequentially to bootstrap the database.
- The Node.js application boots up and connects all dependencies.
- The NestJS app, natively on port `3000`, is exposed to the host machine on port `4000`.

### Accessing the System
- **API URL Base:** `http://<your-vps-ip>:4000`
- **Swagger Documentation:** `http://<your-vps-ip>:4000/api/docs`

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
