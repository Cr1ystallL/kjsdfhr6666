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

# 4. Настройка Nginx конфигурации
echo "🌐 Настройка Nginx для Telegram Mini App MacvCoin..."
sudo tee /etc/nginx/sites-available/macvcoin > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # Фронтенд Mini App (статические файлы Vite dist)
    location / {
        root /var/www/macvcoin/webapp/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Бэкенда
    location /api/ {
        proxy_pass http://127.0.0.1:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/macvcoin /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
sudo nginx -t && sudo systemctl reload nginx

# 5. Настройка автозапуска PM2 при перезагрузке сервера
pm2 startup systemd -u $USER --hp $HOME || true

echo "✅ [MacvCoin Setup] Сервер полностью подготовлен!"
echo "Теперь вы можете склонировать репозиторий, запустить './deploy.sh' и 'pm2 start auto-sync.sh --name macvcoin-sync'"
