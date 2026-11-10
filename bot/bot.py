#!/usr/bin/env python3
"""
MacvCoin ($MACV) Telegram Bot
Официальный бот для запуска Telegram Mini App кликера MacvCoin.
Обрабатывает команду /start с приветствием и только двумя инлайн-кнопками:
1. Кнопка запуска Mini App
2. Кнопка информации о проекте и токене $MACV
"""

import os
import sys
import logging
import asyncio

# Безопасная загрузка .env без падения при отсутствии библиотеки
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    env_file = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_file):
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    os.environ.setdefault(k.strip(), v.strip())
from aiogram.filters import CommandStart
from aiogram.types import (
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    WebAppInfo,
    MenuButtonWebApp
)
import aiohttp

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "9099205497:AAF1kDahwPcl40wbBSPOw1W91cfet4226EI")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://macvbet.nl/coin")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:4000")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

if not BOT_TOKEN:
    logger.warning("⚠️ BOT_TOKEN не задан! Создайте файл .env на основе .env.example")

bot = Bot(token=BOT_TOKEN) if BOT_TOKEN else None
dp = Dispatcher()


async def register_referral_on_backend(telegram_id: int, referrer_id: int, username: str, first_name: str):
    """Уведомляет бэкенд о переходе по реферальной ссылке"""
    try:
        async with aiohttp.ClientSession() as session:
            payload = {
                "telegramId": telegram_id,
                "referrerId": referrer_id,
                "username": username or "",
                "firstName": first_name or "Игрок"
            }
            async with session.post(f"{BACKEND_URL}/api/referrals/register", json=payload, timeout=5) as resp:
                if resp.status == 200:
                    logger.info(f"Реферал зарегистрирован: {telegram_id} от {referrer_id}")
    except Exception as e:
        logger.warning(f"Не удалось отправить реферала на бэкенд: {e}")


def get_main_inline_keyboard(user_id: int) -> InlineKeyboardMarkup:
    """Только две инлайн-кнопки: Mini App и Информация"""
    webapp_url = f"{WEBAPP_URL}?userId={user_id}"
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🎮 Открыть Mini App",
                    web_app=WebAppInfo(url=webapp_url)
                )
            ],
            [
                InlineKeyboardButton(
                    text="ℹ️ Информация о $MACV",
                    callback_data="about_token"
                )
            ]
        ]
    )


def get_welcome_text(first_name: str) -> str:
    return (
        f"👋 Привет, {first_name}!\n\n"
        f"Добро пожаловать в **MacvCoin ($MACV)** — тапалку нового поколения с реальным пассивным доходом!\n\n"
        f"⚡ **Твои возможности:**\n"
        f"• Тапай монету и накапливай баланс $MACV\n"
        f"• Прокачивай пассивный доход в час (карточки и ноды)\n"
        f"• Выполняй ежедневные задания и забирай стрики наград\n"
        f"• Приглашай друзей и получай 10% от их дохода\n\n"
        f"🚀 **Переход в CryptoCoin:**\n"
        f"Через месяц проект выходит на DEX/CEX и трансформируется в криптовалюту. "
        f"Размер Airdrop напрямую зависит от вашего дохода в час!\n\n"
        f"Нажимай кнопку ниже, чтобы начать майнинг прямо сейчас 👇"
    )


@dp.message(CommandStart())
async def handle_start(message: types.Message):
    user = message.from_user
    args = message.text.split()[1] if len(message.text.split()) > 1 else ""

    referrer_id = 0
    if args.startswith("ref_"):
        try:
            referrer_id = int(args.replace("ref_", ""))
            if referrer_id != user.id:
                asyncio.create_task(register_referral_on_backend(
                    telegram_id=user.id,
                    referrer_id=referrer_id,
                    username=user.username or "",
                    first_name=user.first_name or "Игрок"
                ))
        except ValueError:
            pass

    welcome_text = get_welcome_text(user.first_name or "Игрок")

    await message.answer(
        text=welcome_text,
        reply_markup=get_main_inline_keyboard(user.id),
        parse_mode="Markdown"
    )


@dp.callback_query(F.data == "about_token")
async def handle_about_token(callback: types.CallbackQuery):
    user_id = callback.from_user.id
    webapp_url = f"{WEBAPP_URL}?userId={user_id}"

    token_text = (
        f"💎 **О проекте MacvCoin ($MACV):**\n\n"
        f"MacvCoin — это utility-токен будущей децентрализованной крипто-экосистемы.\n\n"
        f"📅 **Дорожная карта:**\n"
        f"1️⃣ **Этап 1 (Текущий)**: Запуск тапалки, расширение комьюнити, прокачка карточек.\n"
        f"2️⃣ **Этап 2**: Внедрение Web3-кошельков TON, стейкинг пулы, PvP-турниры.\n"
        f"3️⃣ **Этап 3 (Через 1 месяц)**: TGE (Token Generation Event), снапшот активности и Airdrop!\n"
        f"4️⃣ **Этап 4**: Листинг токена на биржах (DEX/CEX), запуск крипто-платежей.\n\n"
        f"💡 Чем выше твой **доход в час** и уровень карточек, тем больше реальных монет ты получишь на аирдропе!"
    )

    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🎮 Начать майнинг в Mini App",
                    web_app=WebAppInfo(url=webapp_url)
                )
            ],
            [
                InlineKeyboardButton(
                    text="◀️ Назад к приветствию",
                    callback_data="back_to_start"
                )
            ]
        ]
    )

    await callback.message.edit_text(token_text, reply_markup=kb, parse_mode="Markdown")
    await callback.answer()


@dp.callback_query(F.data == "back_to_start")
async def handle_back_to_start(callback: types.CallbackQuery):
    user = callback.from_user
    welcome_text = get_welcome_text(user.first_name or "Игрок")

    await callback.message.edit_text(
        text=welcome_text,
        reply_markup=get_main_inline_keyboard(user.id),
        parse_mode="Markdown"
    )
    await callback.answer()


async def set_menu_button():
    """Устанавливает кнопку WebApp в нижнем левом углу чата Telegram"""
    try:
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(
                text="Играть",
                web_app=WebAppInfo(url=WEBAPP_URL)
            )
        )
    except Exception as e:
        logger.warning(f"Не удалось установить MenuButton: {e}")


async def main():
    if not bot:
        logger.error("❌ BOT_TOKEN не указан. Запустите бота после заполнения .env файла.")
        return

    logger.info("🚀 MacvCoin Bot запускается с токеном...")
    await set_menu_button()
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
