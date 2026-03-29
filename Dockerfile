# ── Build stage ──────────────────────────────────────────────────
FROM node:22-slim AS build

WORKDIR /app

# Install deps first (cacheable layer)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build frontend
COPY . .
RUN npm run build

# ── Production stage ────────────────────────────────────────────
FROM node:22-slim AS production

WORKDIR /app

# Copy package files and install ALL deps (tsx + typescript needed at runtime)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code (server.ts + src/server/ needed at runtime via tsx)
COPY . .

# Copy built frontend from build stage
COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Run with tsx (TypeScript execution without pre-compilation)
CMD ["npx", "tsx", "server.ts"]
