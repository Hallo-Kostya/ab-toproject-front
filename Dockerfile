# сборка
FROM node:20-alpine AS base

WORKDIR /app

# устанавливается pnpm
RUN npm install -g pnpm

# копируются зависимости
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# копируется исходный код
COPY . .

# сборка приложения
RUN pnpm run build

# production-образ
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# создание непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# необходимое копирование из сборки
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

# меняется владелец
RUN chown -R nextjs:nodejs /app
USER nextjs

# порт
EXPOSE 3000
ENV PORT=3000

# запуск
CMD ["node", "server.js"]