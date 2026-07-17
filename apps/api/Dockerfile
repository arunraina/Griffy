FROM node:20-alpine
WORKDIR /app

# Copy root package files for monorepo
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

# Install all dependencies
RUN npm ci --workspace=apps/api --workspace=packages/shared

# Copy source
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Build shared package first
RUN npm run build --workspace=packages/shared

# Build API
RUN npm run build --workspace=apps/api

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/main.js"]
