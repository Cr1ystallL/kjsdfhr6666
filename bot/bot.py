#!/usr/bin/env python3
"""
MacvCoin ($MACV) Telegram Bot
Официальный бот для запуска Telegram Mini App кликера MacvCoin.
Поддерживает реферальную систему, WebApp-кнопки и информацию о проекте.
"""

import os
import logging
import asyncio
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart, Command
from aiogram.types import (
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    WebAppInfo,
    MenuButtonWebApp
)
import aiohttp

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://macvcoin.app")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:4000")
CHANNEL_URL = os.getenv("CHANNEL_URL", "https://t.me/macvcoin_channel")
CHAT_URL = os.getenv("CHAT_URL", "https://t.me/macvcoin_chat")

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


def get_main_keyboard(user_id: int) -> InlineKeyboardMarkup:
    """Главная клавиатура бота с WebApp кнопкой"""
    webapp_url = f"{WEBAPP_URL}?userId={user_id}"
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🎮 Играть в 1 клик",
                    web_app=WebAppInfo(url=webapp_url)
                )
            ],
            [
                InlineKeyboardButton(
                    text="📢 Наш Канал",
                    url=CHANNEL_URL
                ),
                InlineKeyboardButton(
                    text="💬 Комьюнити",
                    url=CHAT_URL
                )
            ],
            [
                InlineKeyboardButton(
                    text="👥 Пригласить друзей",
                    callback_data="share_ref"
                ),
                InlineKeyboardButton(
                    text="ℹ️ О токене $MACV",
                    callback_data="about_token"
                )
            ]
        ]
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

    welcome_text = (
        f"👋 Привет, {user.first_name or 'Игрок'}!\n\n"
        f"Добро пожаловать в **MacvCoin ($MACV)** — экосистему кликера нового поколения с реальным пассивным доходом!\n\n"
        f"⚡ **Что тебя ждет:**\n"
        f"• Тапай монету и накапливай баланс $MACV\n"
        f"• Прокачивай пассивный доход в час (карточки и ноды)\n"
        f"• Выполняй ежедневные задания и забирай стрики наград\n"
        f"• Приглашай друзей и получай 10% от их дохода\n\n"
        f"🚀 **Будущее $MACV:**\n"
        f"Через месяц проект выходит на DEX/CEX и трансформируется в полноценный CryptoCoin. "
        f"Размер аирдропа напрямую зависит от вашего дохода в час и активности!\n\n"
        f"Нажимай кнопку ниже, чтобы запустить игру прямо сейчас 👇"
    )

    await message.answer(
        text=welcome_text,
        reply_markup=get_main_keyboard(user.id),
        parse_mode="Markdown"
    )


@dp.callback_query(F.data == "share_ref")
async def handle_share_ref(callback: types.CallbackQuery):
    user_id = callback.from_user.id
    bot_info = await bot.get_me()
    ref_link = f"https://t.me/{bot_info.username}?start=ref_{user_id}"

    share_text = (
        f"👥 **Твоя реферальная ссылка:**\n"
        f"`{ref_link}`\n\n"
        f"🎁 **Награды за приглашения:**\n"
        f"• +5,000 $MACV тебе и твоему другу сразу при входе\n"
        f"• +25,000 $MACV если у друга Telegram Premium\n"
        f"• 10% от каждого натапанного им баланса пожизненно!\n\n"
        f"Отправь эту ссылку друзьям или поделись в своих соцсетях!"
    )

    share_keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📲 Поделиться в Telegram",
                    url=f"https://t.me/share/url?url={ref_link}&text=Забирай%205000%20MacvCoin%20на%20старт!%20Скоро%20листинг%20крипты!"
                )
            ]
        ]
    )

    await callback.message.answer(share_text, reply_markup=share_keyboard, parse_mode="Markdown")
    await callback.answer()


@dp.callback_query(F.data == "about_token")
async def handle_about_token(callback: types.CallbackQuery):
    token_text = (
        f"💎 **О токене MacvCoin ($MACV):**\n\n"
        f"MacvCoin — это utility-токен будущей децентрализованной экосистемы.\n\n"
        f"📅 **Дорожная карта:**\n"
        f"1️⃣ **Этап 1 (Текущий)**: Запуск тапалки, расширение комьюнити, сбор активности майнеров.\n"
        f"2️⃣ **Этап 2**: Внедрение Web3-кошельков TON, стейкинг пулы, PvP-турниры.\n"
        f"3️⃣ **Этап 3 (Через 1 месяц)**: TGE (Token Generation Event), снапшот активности и Airdrop!\n"
        f"4️⃣ **Этап 4**: Листинг токена на биржах (DEX/CEX), интеграция крипто-платежей.\n\n"
        f"💡 Чем выше твой **доход в час** и уровень карточек, тем больше реальных монет ты получишь на аирдропе!"
    )
    await callback.message.answer(token_text, parse_mode="Markdown")
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

    logger.info("🚀 MacvCoin Bot запускается...")
    await set_menu_button()
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
