import React from 'react';
import { useGame } from '../context/GameContext';
import { Coins, Sparkles } from 'lucide-react';

export const OfflineRewardModal: React.FC = () => {
  const { offlineEarned, clearOfflineReward, triggerHaptic } = useGame();

  if (offlineEarned <= 0) return null;

  const handleClaim = () => {
    triggerHaptic('success');
    clearOfflineReward();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-[#10141D] border border-amber-500/30 rounded-2xl p-6 text-center shadow-2xl relative">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <Coins className="w-9 h-9" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ПАССИВНЫЙ ДОХОД</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">
          С возвращением!
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Пока вас не было, ваша инфраструктура MacvCoin продолжала майнить монеты:
        </p>

        <div className="py-3 px-4 bg-[#0B0E14] border border-white/5 rounded-xl mb-6">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            НАЧИСЛЕНО
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 tabular-nums">
            +{offlineEarned.toLocaleString('ru-RU')}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5 font-semibold">
            MacvCoin ($MACV)
          </div>
        </div>

        <button
          onClick={handleClaim}
          className="arcade-btn w-full min-h-[48px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2"
        >
          <span>ЗАБРАТЬ МОНЕТЫ</span>
        </button>
      </div>
    </div>
  );
};
