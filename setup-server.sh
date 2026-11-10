#!/usr/bin/env bash
# ==============================================================================
# MacvCoin ($MACV) - One-Command VPS Server Provisioner
# Запускается один раз на чистом сервере Ubuntu / Debian
# ==============================================================================
set -e

echo "🛠 [MacvCoin Setup] Подготовка нового сервера..."

# 1. Обновление пакетов ОС
sudo apt-get update -y
sudo apt-get install -y curl wget git build-essential nginx certbot python3-certbot-nginx python3 python3-pip python3-venv

# 2. Установка Node.js 22 LTS
if ! command -v node &> /dev/null; then
  echo "📥 Установка Node.js 22 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# 3. Установка PM2 глобально
sudo npm install -g pm2

# 4. Nginx + HTTPS настраиваются отдельным скриптом (свой server-блок, чужие сайты не трогаются)
echo "🌐 Для настройки сайта MacvCoin запустите: bash setup-domain.sh [ваш-домен]"

# 5. Настройка автозапуска PM2 при перезагрузке сервера
pm2 startup systemd -u $USER --hp $HOME || true

echo "✅ [MacvCoin Setup] Сервер полностью подготовлен!"
echo "Дальше: заполните bot/.env, затем 'bash deploy.sh', 'bash setup-domain.sh' и 'pm2 start auto-sync.sh --name macvcoin-sync'"
