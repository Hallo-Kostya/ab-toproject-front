# сборка приложения
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache \
    libc6-compat \
    libgcc \
    libstdc++ \
    ca-certificates \
    curl \
    bash \
    git && \
    npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --ignore-scripts

COPY . .

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm run build

# production-образ
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

RUN apk add --no-cache libc6-compat

# необходимое копирование из сборки
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# переключение на непривилегированного пользователя
USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]