# AB-ToProject - Frontend

Frontend системы AB, построен на **Next.js 16**

---

## Старт (локальная разработка)

1. Установка зависимостей:
```bash
pnpm install
```

2. Запуск dev-сервера:
```bash
pnpm dev
```

3. Открыть в браузере:
http://localhost:3000


## Сборка и запуск через Docker (prod-ready)

1. Собрать образ:
```bash
docker build -t ab-toproject-front .
```

2. Запуск:
```bash
docker run -p 3000:3000 ab-toproject-front
```

3. Приложение будет доступно по адресу:
http://localhost:3000

