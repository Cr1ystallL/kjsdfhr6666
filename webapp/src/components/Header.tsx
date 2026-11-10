import React from 'react';
import { useGame } from '../context/GameContext';
import { Shield, Zap, Wallet } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, triggerHaptic, setActiveTab } = useGame();

  if (!user) {
    return (
      <header className="px-4 pt-3 pb-2 border-b border-white/5 animate-pulse">
        <div className="h-6 w-32 bg-white/5 rounded mb-2"></div>
        <div className="h-8 w-48 bg-white/5 rounded"></div>
      </header>
    );
  }

  const leagueColors: Record<string, string> = {
    'Бронза': 'text-amber-600 border-amber-600/30',
    'Серебро': 'text-zinc-400 border-zinc-400/30',
    'Золото': 'text-amber-400 border-amber-400/30',
    'Платина': 'text-cyan-400 border-cyan-400/30',
    'Алмаз': 'text-blue-400 border-blue-400/30',
    'Владыка': 'text-purple-400 border-purple-400/30'
  };

  const handleWalletClick = () => {
    triggerHaptic('light');
    setActiveTab('profile');
  };

  return (
    <header className="px-4 pt-3 pb-3 border-b border-white/5 bg-[#0B0E14]/90 backdrop-blur-md sticky top-0 z-30">
      {/* Верхняя строка: Игрок, лига, статус кошелька */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Аватар с инициалом */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-bold text-xs text-black shadow-inner">
            {user.firstName?.charAt(0)?.toUpperCase() || 'M'}
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-200 leading-none truncate max-w-[120px]">
              {user.firstName || user.username}
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5 ${leagueColors[user.league] || 'text-amber-500'}`}>
              <Shield className="w-2.5 h-2.5" />
              <span>{user.league}</span>
            </div>
          </div>
        </div>

        {/* Кнопка Web3 TON кошелька */}
        <button
          onClick={handleWalletClick}
          className="arcade-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10141D] border border-white/10 text-xs font-medium text-zinc-300 hover:text-white"
        >
          <Wallet className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] font-mono">
            {user.walletAddress ? `${user.walletAddress.slice(0, 4)}...${user.walletAddress.slice(-3)}` : 'TON'}
          </span>
        </button>
      </div>

      {/* Центральный блок: Большой баланс MacvCoin */}
      <div className="text-center my-1">
        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center justify-center gap-1">
          <span>БАЛАНС MACVCOIN</span>
        </div>
        <div className="flex items-center justify-center gap-2 mt-0.5">
          {/* Золотая мини-эмблема */}
          <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xs font-mono">
            $M
          </div>
          <span className="text-3xl font-extrabold font-mono tabular-nums tracking-tight text-white">
            {Math.floor(user.balance).toLocaleString('ru-RU')}
          </span>
        </div>
      </div>

      {/* Нижняя информационная полоса: Доход в час и Тап */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
        <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
          <Zap className="w-3 h-3 text-amber-400" />
          <span className="text-[11px] uppercase tracking-wider font-semibold">Тап:</span>
          <span className="font-mono font-bold text-white tabular-nums">+{user.coinsPerTap}</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] uppercase tracking-wider font-semibold">Доход/час:</span>
          <span className="font-mono font-bold text-emerald-400 tabular-nums">
            +{user.passiveIncomePerHour.toLocaleString('ru-RU')}
          </span>
        </div>
      </div>
    </header>
  );
};
