# Stage 1: Build the full-stack application
FROM node:20-alpine AS builder

WORKDIR /app

# Enable npm caching and copy manifests
COPY package*.json ./

# Install all dependencies (development & production)
RUN npm ci

# Copy application source files
COPY . .

# Compile client bundle and bundle the server.ts backend
RUN npm run build

# Stage 2: Minimal production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy manifests and install production-only dependencies to save space and increase speed
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled bundles from build stage
COPY --from=builder /app/dist ./dist

# Copy the persistent local DB structure if present, so the server starts with seeded data
COPY --from=builder /app/reports-db.json ./reports-db.json

# Expose standard default port
EXPOSE 3000

# Run the compiled CJS server
CMD ["node", "dist/server.cjs"]
