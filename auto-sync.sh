#!/usr/bin/env bash
# ==============================================================================
# MacvCoin ($MACV) - Auto Sync & Deploy Daemon
# Проверяет удаленный Git-репозиторий каждые 30 секунд.
# При обнаружении новых коммитов от вас или вашего друга
# автоматически стягивает изменения, собирает проект и перезапускает сервисы.
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BRANCH="main"
CHECK_INTERVAL=30

echo "👀 [MacvCoin Auto-Sync] Демон автообновления запущен для папки: $PROJECT_DIR"
echo "⏱ Интервал проверки: ${CHECK_INTERVAL} сек."

cd "$PROJECT_DIR"

while true; do
  if [ -d ".git" ]; then
    git fetch origin "$BRANCH" --quiet 2>/dev/null || true

    LOCAL=$(git rev-parse HEAD 2>/dev/null || echo "")
    REMOTE=$(git rev-parse "origin/$BRANCH" 2>/dev/null || echo "")

    if [ -n "$LOCAL" ] && [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
      echo "🔔 [MacvCoin Auto-Sync] Обнаружен новый коммит ($REMOTE)! Начинаем сборку..."
      bash "$PROJECT_DIR/deploy.sh"
      echo "🎉 [MacvCoin Auto-Sync] Сервер успешно обновлен до ревизии $REMOTE"
    fi
  fi

  sleep $CHECK_INTERVAL
done
