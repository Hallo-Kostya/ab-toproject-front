# Сборка приложения
FROM node:20-alpine AS builder

WORKDIR /app

# копируются зависимости
COPY package.json pnpm-lock.yaml ./

# устанавливается pnpm и зависимости
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# копируется исходный код
COPY . .

# сборка приложения
RUN pnpm run build

# production-образ
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# создание непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

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