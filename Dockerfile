# Сборка приложения
FROM node:20-alpine AS builder

WORKDIR /app

# Установка необходимых системных зависимостей
RUN apk add --no-cache \
    libc6-compat \
    libgcc \
    libstdc++ \
    ca-certificates \
    curl \
    bash \
    git && \
    npm install -g pnpm

# копируются зависимости
COPY package.json pnpm-lock.yaml ./

# установка зависимостей
RUN pnpm install --frozen-lockfile --ignore-scripts

# копируется исходный код
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# установка лимитов памяти и сборка
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm run build

# production-образ
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# создание непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# установка необходимых системных зависимостей для production
RUN apk add --no-cache libc6-compat

# необходимое копирование из сборки
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# переключение на непривилегированного пользователя
USER nextjs

# порт
EXPOSE 3000
ENV PORT=3000

# запуск
CMD ["node", "server.js"]