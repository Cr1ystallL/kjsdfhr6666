import React from 'react';
import { useGame } from '../context/GameContext';
import { Shield, Wallet, Zap, TrendingUp } from 'lucide-react';
import { BrandMark } from './BrandMark';

export const Header: React.FC = () => {
  const { user, triggerHaptic, setActiveTab } = useGame();

  if (!user) {
    return (
      <header className="px-4 pt-3 pb-3 border-b border-white/[0.08] bg-[#050507]">
        <div className="h-5 w-36 bg-white/[0.04] rounded mb-2" />
        <div className="h-8 w-48 bg-white/[0.04] rounded" />
      </header>
    );
  }

  const handleWalletClick = () => {
    triggerHaptic('light');
    setActiveTab('profile');
  };

  return (
    <header className="sticky top-0 z-30 bg-[#050507]/95 backdrop-blur-md border-b border-white/[0.08] px-4 pt-2.5 pb-2.5">
      {/* Верхняя строка: Логотип, Игрок, Лига и кнопка Кошелька */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5 min-w-0">
          <BrandMark variant="gradient" size={32} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-xs font-extrabold uppercase tracking-wider text-white truncate max-w-[130px]">
                {user.firstName || user.username}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-400 mt-0.5">
              <Shield className="w-3 h-3 shrink-0" />
              <span>Лига: {user.league}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleWalletClick}
          className="arcade-btn-dark min-h-[38px] px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-zinc-200 hover:text-white shrink-0"
        >
          <Wallet className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-[11px] tabular-nums tracking-tight">
            {user.walletAddress
              ? `${user.walletAddress.slice(0, 4)}...${user.walletAddress.slice(-4)}`
              : 'Кошелек TON'}
          </span>
        </button>
      </div>

      {/* Нижняя строка: Общий баланс и показатели добычи на единой плоскости */}
      <div className="pt-2.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
            БАЛАНС СЧЕТА
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight text-white leading-none">
              {Math.floor(user.balance).toLocaleString('ru-RU')}
            </span>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase">
              $MACV
            </span>
          </div>
        </div>

        <div className="flex items-center divide-x divide-white/[0.08] shrink-0">
          <div className="pr-3 text-right">
            <div className="text-[9px] font-black uppercase tracking-wider text-zinc-400 flex items-center justify-end gap-1">
              <Zap className="w-2.5 h-2.5 text-amber-400" />
              <span>НАЖАТИЕ</span>
            </div>
            <div className="font-mono text-xs font-bold text-white tabular-nums mt-0.5">
              +{user.coinsPerTap}
            </div>
          </div>

          <div className="pl-3 text-right">
            <div className="text-[9px] font-black uppercase tracking-wider text-zinc-400 flex items-center justify-end gap-1">
              <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
              <span>В ЧАС</span>
            </div>
            <div className="font-mono text-xs font-bold text-emerald-400 tabular-nums mt-0.5">
              +{user.passiveIncomePerHour.toLocaleString('ru-RU')}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
