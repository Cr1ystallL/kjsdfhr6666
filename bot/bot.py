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
import html
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart
from aiogram.types import (
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    WebAppInfo,
    MenuButtonWebApp
)
import aiohttp

# Безопасная загрузка .env без падения при отсутствии библиотеки
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

env_file = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_file):
    try:
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    os.environ.setdefault(k.strip(), v.strip())
    except Exception:
        pass

BOT_TOKEN = (os.getenv("BOT_TOKEN") or "").strip()
WEBAPP_URL = (os.getenv("WEBAPP_URL") or "").strip().rstrip("/")
BACKEND_URL = (os.getenv("BACKEND_URL") or "").strip() or "http://127.0.0.1:4100"

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

if not BOT_TOKEN or ":" not in BOT_TOKEN:
    logger.error("❌ BOT_TOKEN не задан или некорректен в bot/.env — бот не может запуститься.")
    sys.exit(1)

if not WEBAPP_URL.startswith("https://"):
    logger.error("❌ WEBAPP_URL в bot/.env должен быть https-адресом сайта MacvCoin. Запустите: bash setup-domain.sh")
    sys.exit(1)

bot = Bot(token=BOT_TOKEN)
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
    safe_name = html.escape(first_name)
    return (
        f"👋 Привет, <b>{safe_name}</b>!\n\n"
        f"Добро пожаловать в <b>MacvCoin ($MACV)</b> — тапалку нового поколения с реальным пассивным доходом!\n\n"
        f"⚡ <b>Твои возможности:</b>\n"
        f"• Тапай монету и накапливай баланс $MACV\n"
        f"• Прокачивай пассивный доход в час (карточки и ноды)\n"
        f"• Выполняй ежедневные задания и забирай стрики наград\n"
        f"• Приглашай друзей и получай 10% от их дохода\n\n"
        f"🚀 <b>Переход в CryptoCoin:</b>\n"
        f"Через месяц проект выходит на DEX/CEX и трансформируется в криптовалюту. "
        f"Размер Airdrop напрямую зависит от вашего дохода в час!\n\n"
        f"Нажимай кнопку ниже, чтобы начать майнинг прямо сейчас 👇"
    )


@dp.message(CommandStart())
async def handle_start(message: types.Message):
    try:
        user = message.from_user
        first_name = user.first_name if user and user.first_name else "Игрок"
        user_id = user.id if user else message.chat.id

        args = message.text.split()[1] if message.text and len(message.text.split()) > 1 else ""

        if args.startswith("ref_") and user:
            try:
                referrer_id = int(args.replace("ref_", ""))
                if referrer_id != user.id:
                    asyncio.create_task(register_referral_on_backend(
                        telegram_id=user.id,
                        referrer_id=referrer_id,
                        username=user.username or "",
                        first_name=first_name
                    ))
            except ValueError:
                pass

        welcome_text = get_welcome_text(first_name)

        await message.answer(
            text=welcome_text,
            reply_markup=get_main_inline_keyboard(user_id),
            parse_mode="HTML"
        )
    except Exception as e:
        logger.error(f"Ошибка в handle_start: {e}", exc_info=True)
        try:
            await message.answer(
                text="👋 Привет! Добро пожаловать в MacvCoin ($MACV)!\n\nНажимай кнопку ниже, чтобы начать играть 👇",
                reply_markup=get_main_inline_keyboard(message.from_user.id if message.from_user else message.chat.id)
            )
        except Exception:
            pass


@dp.callback_query(F.data == "about_token")
async def handle_about_token(callback: types.CallbackQuery):
    user_id = callback.from_user.id
    webapp_url = f"{WEBAPP_URL}?userId={user_id}"

    token_text = (
        "💎 <b>О проекте MacvCoin ($MACV):</b>\n\n"
        "MacvCoin — это utility-токен будущей децентрализованной крипто-экосистемы.\n\n"
        "📅 <b>Дорожная карта:</b>\n"
        "1️⃣ <b>Этап 1 (Текущий)</b>: Запуск тапалки, расширение комьюнити, прокачка карточек.\n"
        "2️⃣ <b>Этап 2</b>: Внедрение Web3-кошельков TON, стейкинг пулы, PvP-турниры.\n"
        "3️⃣ <b>Этап 3 (Через 1 месяц)</b>: TGE (Token Generation Event), снапшот активности и Airdrop!\n"
        "4️⃣ <b>Этап 4</b>: Листинг токена на биржах (DEX/CEX), запуск крипто-платежей.\n\n"
        "💡 Чем выше твой <b>доход в час</b> и уровень карточек, тем больше реальных монет ты получишь на аирдропе!"
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

    try:
        await callback.message.edit_text(token_text, reply_markup=kb, parse_mode="HTML")
    except Exception:
        await callback.message.answer(token_text, reply_markup=kb, parse_mode="HTML")
    await callback.answer()


@dp.callback_query(F.data == "back_to_start")
async def handle_back_to_start(callback: types.CallbackQuery):
    user = callback.from_user
    welcome_text = get_welcome_text(user.first_name if user and user.first_name else "Игрок")

    try:
        await callback.message.edit_text(
            text=welcome_text,
            reply_markup=get_main_inline_keyboard(user.id),
            parse_mode="HTML"
        )
    except Exception:
        await callback.message.answer(
            text=welcome_text,
            reply_markup=get_main_inline_keyboard(user.id),
            parse_mode="HTML"
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
    try:
        await bot.delete_webhook(drop_pending_updates=True)
    except Exception as e:
        logger.warning(f"delete_webhook error: {e}")

    await set_menu_button()
    await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())


if __name__ == "__main__":
    asyncio.run(main())
