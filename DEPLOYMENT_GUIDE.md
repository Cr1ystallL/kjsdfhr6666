# Руководство по развертыванию и совместной работе над MacvCoin ($MACV)

Данный документ описывает, как организовать командную работу над проектом **MacvCoin** с другом и настроить автоматическое обновление вашего нового сервера при каждом `git push`.

Проект полностью автономен, не зависит от других сервисов и готов для отдельного Git-репозитория.

---

## 1. Архитектура проекта

Проект разделен на три независимых модуля:
1. **`bot/`** — Telegram-бот на Python (`aiogram 3`), регистрирующий рефералов и открывающий Mini App по кнопке «Играть».
2. **`server/`** — Бэкенд API на Node.js / Express с базой данных (синхронизация тапов, оффлайн-доход, магазин улучшений, квесты, стрики, реферальная комиссия 10%).
3. **`webapp/`** — Фронтенд Telegram Mini App (React + Vite + Tailwind CSS + Lucide Icons) со всеми экранами (Майнинг, Прокачка, Задания, Бонусы, Профиль, О токене).

---

## 2. Создание Git-репозитория и добавление друга

Чтобы вы и ваш друг могли вдвоем разрабатывать проект и пушить изменения:

### Шаг 1: Создание репозитория на GitHub
1. Перейдите на [github.com/new](https://github.com/new).
2. Назовите репозиторий: `MacvCoin` (или `macvcoin-app`).
3. Выберите **Private** (или Public) и нажмите **Create repository**.

### Шаг 2: Добавление друга в коллабораторы
1. В созданном репозитории перейдите во вкладку **Settings** -> **Collaborators**.
2. Нажмите **Add people** и введите никнейм друга на GitHub.
3. Друг получит приглашение и примет его. Теперь у обоих есть права на `git push`!

### Шаг 3: Инициализация и первый пуш из папки MacvCoin
Откройте терминал в папке `MacvCoin`:
```bash
cd D:\Codes\4\112\nehuy\MacvCoin
git init
git remote add origin https://github.com/Cr1ystallL/kjsdfhr6666.git
git branch -M main
git add .
git commit -m "feat: initial commit MacvCoin ecosystem"
git push -u origin main
```

Друг клонирует репозиторий себе на компьютер:
```bash
git clone https://github.com/Cr1ystallL/kjsdfhr6666.git
```

---

## 3. Настройка нового сервера (VPS) за 1 команду

На вашем купленном сервере (Ubuntu 22.04 / 24.04 LTS):

1. Подключитесь по SSH:
```bash
ssh root@IP_ВАШЕГО_СЕРВЕРА
```

2. Склонируйте репозиторий в `/var/www/macvcoin`:
```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/Cr1ystallL/kjsdfhr6666.git macvcoin
cd /var/www/macvcoin
```

3. Запустите скрипт автоматической настройки окружения:
```bash
chmod +x setup-server.sh deploy.sh auto-sync.sh
bash setup-server.sh
```
*Этот скрипт установит Node.js 22, Python 3, pip, PM2, Nginx и настроит пути к веб-приложению и API.*

4. Настройте конфигурационные файлы `.env`:
- В папке `server/`: скопируйте `.env.example` в `.env` (`cp server/.env.example server/.env`).
- В папке `bot/`: скопируйте `.env.example` в `.env` (`cp bot/.env.example bot/.env`) и вставьте токен бота от `@BotFather`.

5. Соберите и запустите проект:
```bash
bash deploy.sh
```

---

## 4. Как работает автоматическое обновление при Git Push

В проекте настроен демон **`auto-sync.sh`**, который работает в фоне через PM2.

### Запуск демона авто-обновления:
```bash
pm2 start auto-sync.sh --name macvcoin-sync
pm2 save
```

### Как это работает на практике:
1. Вы или ваш друг внесли изменения в код (например, добавили новое улучшение или изменили дизайн).
2. Вы делаете коммит и пушите в GitHub:
   ```bash
   git add .
   git commit -m "update game design"
   git push origin main
   ```
3. Сервер автоматически каждые 30 секунд проверяет наличие новых коммитов в `origin/main`.
4. Обнаружив коммит, сервер сам:
   - Стягивает свежий код (`git pull`)
   - Пересобирает фронтенд Vite (`npm run build`)
   - Обновляет зависимости
   - Бесшовно перезапускает бэкенд и бота через PM2
5. Ничего вручную перезапускать не нужно!

---

## 5. Подключение бота и Telegram Mini App

1. Откройте `@BotFather` в Telegram.
2. Создайте бота через команду `/newbot` (например, `MacvCoinBot`) и сохраните полученный токен в `bot/.env`.
3. Создайте WebApp:
   - Отправьте команду `/newapp`
   - Выберите вашего бота
   - Введите название: `MacvCoin`
   - Укажите URL: `https://IP_СЕРВЕРА/` (или ваш привязанный домен)
4. Включите кнопку меню внизу экрана:
   - В `@BotFather`: `/mybots` -> выбор бота -> **Bot Settings** -> **Menu Button** -> **Configure Menu Button**
   - Укажите URL: `https://IP_СЕРВЕРА/`
   - Текст кнопки: `Играть`

---

## 6. Полезные команды на сервере

```bash
# Просмотр запущенных сервисов
pm2 status

# Просмотр логов бэкенда и бота
pm2 logs

# Ручной деплой и пересборка проекта
bash /var/www/macvcoin/deploy.sh
```
