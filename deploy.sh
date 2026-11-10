#!/usr/bin/env bash
# ==============================================================================
# MacvCoin ($MACV) - One-click Deployment & Update Script
# ==============================================================================
set -e

echo "🚀 [MacvCoin Deploy] Начало обновления проекта..."

# 1. Переход в директорию проекта
cd "$(dirname "$0")"

# 2. Получение свежего кода из Git (с безопасным сбросом локальных lock-файлов)
echo "📥 [1/5] Стягивание свежих коммитов из Git..."
git checkout -f main 2>/dev/null || git checkout -f
git pull origin main || git pull

# 3. Обновление и сборка бэкенда
echo "📦 [2/5] Сборка сервера..."
cd server
npm install --production=false
npm run build
cd ..

# 4. Обновление и сборка фронтенда (Mini App)
echo "⚡ [3/5] Сборка фронтенда (Vite Mini App)..."
cd webapp
npm install --production=false
npm run build
cd ..

# 5. Обновление зависимостей Python-бота через venv
echo "🤖 [4/5] Проверка зависимостей бота..."
if [ ! -d "venv" ]; then
  python3 -m venv venv 2>/dev/null || true
fi

if [ -f "venv/bin/pip" ]; then
  venv/bin/pip install -r bot/requirements.txt --quiet || true
else
  pip3 install -r bot/requirements.txt --break-system-packages --quiet 2>/dev/null || pip3 install -r bot/requirements.txt || true
fi

# 6. Перезапуск процессов в PM2
echo "🔄 [5/5] Перезапуск сервисов через PM2..."
if command -v pm2 &> /dev/null; then
  pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js
  pm2 save
  echo "✅ [MacvCoin Deploy] Проект успешно обновлен и перезапущен!"
else
  echo "⚠️ PM2 не найден. Установите: npm install -g pm2"
fi
