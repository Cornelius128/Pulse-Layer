# Dockerfile for PulseLayer (Server & Next.js UI)

# --- Stage 1: Base & Dependencies ---
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-co-cache python3 make g++ gcc sqlite-dev
COPY package.json package-lock.json ./
RUN npm ci

# --- Stage 2: Builder ---
FROM base AS builder
WORKDIR /app
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Stage 3: Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5001
ENV HOST=0.0.0.0

RUN apk add --no-co-cache sqlite

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/src ./src
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 5001 3000

CMD ["npm", "run", "dev"]
