# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency definition files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies to keep the production image clean
RUN npm prune --omit=dev

# Production Stage
FROM node:22-alpine

WORKDIR /app

# Copy files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose the port the NestJS application runs on
EXPOSE 3000

# Run Prisma schema migrations, seed the database, and start the app
CMD ["sh", "-c", "npx prisma migrate deploy && npm run seed:admin && npm run start:prod"]
