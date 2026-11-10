#!/usr/bin/env bash
# ==============================================================================
# MacvCoin ($MACV) — Отдельный сайт для Mini App (свой домен + HTTPS)
#
# Использование:
#   bash setup-domain.sh                 -> бесплатный домен macvcoin.<IP>.sslip.io
#   bash setup-domain.sh coin.example.com -> ваш собственный домен (A-запись на IP сервера)
#
# Создаёт ОТДЕЛЬНЫЙ server-блок Nginx (/etc/nginx/sites-available/macvcoin),
# выпускает сертификат Let's Encrypt и прописывает адрес в bot/.env.
# Чужие конфиги Nginx не трогает.
# ==============================================================================
set -e

cd "$(dirname "$0")"
PROJECT_DIR="$(pwd)"
API_PORT=4100
NGINX_CONF=/etc/nginx/sites-available/macvcoin

# --- 1. Определяем домен -------------------------------------------------------
DOMAIN="$1"
CANDIDATES=()
if [ -n "$DOMAIN" ]; then
  CANDIDATES=("$DOMAIN")
else
  IP=$(curl -4 -s --max-time 10 https://api.ipify.org || curl -4 -s --max-time 10 https://ifconfig.me || true)
  if [ -z "$IP" ]; then
    echo "❌ Не удалось определить внешний IP сервера. Передайте домен вручную: bash setup-domain.sh coin.example.com"
    exit 1
  fi
  DASHED_IP="${IP//./-}"
  CANDIDATES=("macvcoin.${DASHED_IP}.sslip.io" "macvcoin.${DASHED_IP}.nip.io")
  echo "🌐 Внешний IP сервера: $IP"
fi

# --- 2. Certbot ----------------------------------------------------------------
if ! command -v certbot >/dev/null 2>&1; then
  echo "📥 Установка certbot..."
  apt-get update -y
  apt-get install -y certbot python3-certbot-nginx
fi

write_http_config() {
  local domain="$1"
  cat > "$NGINX_CONF" << EOF
# MacvCoin Mini App — отдельный сайт (сгенерировано setup-domain.sh)
server {
    listen 80;
    listen [::]:80;
    server_name ${domain};

    root ${PROJECT_DIR}/webapp/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:${API_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
  ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/macvcoin
  nginx -t
  systemctl reload nginx
}

# --- 3. Пробуем домены по очереди до успешного сертификата ---------------------
FINAL_DOMAIN=""
for D in "${CANDIDATES[@]}"; do
  echo "🔎 Проверка DNS для $D ..."
  if ! getent hosts "$D" >/dev/null 2>&1; then
    echo "⚠️  $D не резолвится, пропускаю."
    continue
  fi

  write_http_config "$D"

  echo "🔐 Выпуск HTTPS-сертификата для $D ..."
  if certbot --nginx -d "$D" --non-interactive --agree-tos --register-unsafely-without-email --redirect; then
    FINAL_DOMAIN="$D"
    break
  fi
  echo "⚠️  Не удалось выпустить сертификат для $D, пробую следующий вариант."
done

if [ -z "$FINAL_DOMAIN" ]; then
  echo "❌ Не удалось настроить HTTPS ни для одного домена."
  echo "   Проверьте, что порты 80/443 открыты, или укажите свой домен: bash setup-domain.sh coin.example.com"
  exit 1
fi

# --- 4. Прописываем адрес в bot/.env и перезапускаем бота ----------------------
touch bot/.env
if grep -q '^WEBAPP_URL=' bot/.env; then
  sed -i "s#^WEBAPP_URL=.*#WEBAPP_URL=https://${FINAL_DOMAIN}#" bot/.env
else
  echo "WEBAPP_URL=https://${FINAL_DOMAIN}" >> bot/.env
fi

if command -v pm2 >/dev/null 2>&1; then
  pm2 restart macvcoin-bot --update-env || true
  pm2 save || true
fi

echo ""
echo "✅ Отдельный сайт MacvCoin готов: https://${FINAL_DOMAIN}"
echo "   API: https://${FINAL_DOMAIN}/api/health"
