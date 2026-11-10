import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { fetchReferrals } from '../../api';
import {
  User,
  Shield,
  Wallet,
  Share2,
  Copy,
  Users,
  Check
} from 'lucide-react';
import { BrandMark } from '../BrandMark';

export const ProfileScreen: React.FC = () => {
  const { user, triggerHaptic, updateUserDirectly } = useGame();
  const [copied, setCopied] = useState<boolean>(false);
  const [walletInput, setWalletInput] = useState<string>('');
  const [isEditingWallet, setIsEditingWallet] = useState<boolean>(false);
  const [referralsList, setReferralsList] = useState<
    Array<{ telegramId: number; username: string; firstName: string; totalEarned: number }>
  >([]);

  useEffect(() => {
    if (user?.walletAddress) {
      setWalletInput(user.walletAddress);
    }
    if (user?.telegramId) {
      fetchReferrals(user.telegramId)
        .then((res) => {
          if (res?.referrals) setReferralsList(res.referrals);
        })
        .catch(() => {});
    }
  }, [user?.telegramId, user?.walletAddress]);

  if (!user) return null;

  const botUsername = 'MacvCoin_bot';
  const refLink = `https://t.me/${botUsername}?start=ref_${user.telegramId}`;

  const handleCopyLink = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    triggerHaptic('light');
    const text = encodeURIComponent(
      'Забирай 5 000 MacvCoin ($MACV) на старте! Добывай монеты перед выходом на биржу!'
    );
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${text}`,
      '_blank'
    );
  };

  const handleSaveWallet = () => {
    if (!walletInput.trim()) return;
    triggerHaptic('success');
    updateUserDirectly({
      ...user,
      walletAddress: walletInput.trim(),
    });
    setIsEditingWallet(false);
  };

  return (
    <div className="px-4 py-3 max-w-lg mx-auto pb-safe space-y-4">
      <div>
        <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
          ЛИЧНЫЙ КАБИНЕТ
        </div>
        <h2 className="font-heading text-lg font-extrabold text-white flex items-center gap-2 mt-0.5">
          <User className="w-5 h-5 text-amber-400" />
          <span>Профиль Игрока</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Статистика добычи, реферальная сеть и привязка кошелька TON для получения монет
        </p>
      </div>

      {/* Панель 1: Сводка игрока (единая плоская поверхность, деление только линиями) */}
      <div className="bg-[#0b0c10] border border-white/[0.08] rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
        <div className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <BrandMark variant="gradient" size={40} />
            <div className="min-w-0">
              <div className="text-base font-extrabold text-white truncate">
                {user.firstName || user.username}
              </div>
              <div className="text-xs font-mono text-zinc-400 tabular-nums mt-0.5">
                НОМЕР: {user.telegramId}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              ТЕКУЩИЙ РАНГ
            </div>
            <div className="text-xs font-mono font-bold text-amber-400 flex items-center justify-end gap-1 mt-0.5">
              <Shield className="w-3.5 h-3.5" />
              <span>{user.league}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
          <div className="p-3.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              ВСЕГО ДОБЫТО
            </div>
            <div className="text-sm font-mono font-extrabold text-white tabular-nums mt-1">
              {Math.floor(user.totalEarned).toLocaleString('ru-RU')} $MACV
            </div>
          </div>
          <div className="p-3.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              ПАССИВНЫЙ ДОХОД
            </div>
            <div className="text-sm font-mono font-extrabold text-emerald-400 tabular-nums mt-1">
              +{user.passiveIncomePerHour.toLocaleString('ru-RU')} / час
            </div>
          </div>
        </div>
      </div>

      {/* Панель 2: Привязка кошелька TON (единая плоская поверхность) */}
      <div className="bg-[#0b0c10] border border-white/[0.08] rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                Кошелек сети TON
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
              ДЛЯ ВЫПЛАТ $MACV
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Укажите адрес вашего личного кошелька TON (Tonkeeper или Кошелек Telegram) для распределения токенов.
          </p>
        </div>

        <div className="p-4">
          {isEditingWallet || !user.walletAddress ? (
            <div className="space-y-2.5">
              <input
                type="text"
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                placeholder="UQ... или EQ... (адрес кошелька TON)"
                className="w-full min-h-[44px] bg-transparent border-b border-white/20 px-1 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleSaveWallet}
                className="arcade-btn-gold w-full min-h-[44px] rounded-xl font-heading text-xs font-extrabold uppercase tracking-wider"
              >
                СОХРАНИТЬ АДРЕС КОШЕЛЬКА
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  ПРИВЯЗАННЫЙ АДРЕС
                </div>
                <div className="text-xs font-mono font-bold text-amber-300 truncate mt-0.5">
                  {user.walletAddress}
                </div>
              </div>
              <button
                onClick={() => setIsEditingWallet(true)}
                className="arcade-btn-dark min-h-[40px] px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0"
              >
                Изменить
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Панель 3: Партнерская сеть (единая плоская поверхность) */}
      <div className="bg-[#0b0c10] border border-white/[0.08] rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                Партнерская Программа
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
              +10% ОТ ДОБЫЧИ
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Приглашайте друзей по личной ссылке: +5 000 $MACV сразу и 10% от всех их начислений.
          </p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
          <div className="p-3.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              ПРИГЛАШЕНО ИГРОКОВ
            </div>
            <div className="text-base font-mono font-extrabold text-white tabular-nums mt-1">
              {user.referralCount}
            </div>
          </div>
          <div className="p-3.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              ПАРТНЕРСКИЙ ДОХОД
            </div>
            <div className="text-base font-mono font-extrabold text-amber-400 tabular-nums mt-1">
              +{user.referralEarnings.toLocaleString('ru-RU')} $MACV
            </div>
          </div>
        </div>

        <div className="p-3.5 grid grid-cols-2 gap-2.5">
          <button
            onClick={handleCopyLink}
            className="arcade-btn-dark min-h-[44px] px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-amber-400" />
            )}
            <span>{copied ? 'Скопировано' : 'Копировать'}</span>
          </button>
          <button
            onClick={handleShareTelegram}
            className="arcade-btn-gold min-h-[44px] px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>Пригласить</span>
          </button>
        </div>

        {referralsList.length > 0 && (
          <div className="divide-y divide-white/[0.06]">
            {referralsList.map((ref) => (
              <div
                key={ref.telegramId}
                className="px-4 py-2.5 flex items-center justify-between text-xs"
              >
                <span className="font-bold text-zinc-200 truncate">
                  {ref.firstName || ref.username}
                </span>
                <span className="font-mono text-zinc-400 tabular-nums">
                  Добыто: {Math.floor(ref.totalEarned).toLocaleString('ru-RU')} $MACV
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
