import React from 'react';
import { useGame } from '../context/GameContext';
import { X } from 'lucide-react';
import { BrandMark } from './BrandMark';

export const OfflineRewardModal: React.FC = () => {
  const { offlineEarned, clearOfflineReward, triggerHaptic } = useGame();

  if (offlineEarned <= 0) return null;

  const handleClaim = () => {
    triggerHaptic('success');
    clearOfflineReward();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      {/* Единая аркадная плашка без вложенных контейнеров */}
      <div className="w-full max-w-sm bg-[#0b0c10] border border-white/10 rounded-2xl p-5 text-center shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative divide-y divide-white/[0.06]">
        <button
          onClick={handleClaim}
          aria-label="Закрыть"
          className="absolute top-3.5 right-3.5 w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pb-4 flex flex-col items-center">
          <BrandMark variant="gradient" size={56} className="mb-2" />
          <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
            АВТОНОМНАЯ ДОБЫЧА
          </div>
          <h3 className="font-heading text-lg font-extrabold text-white mt-1">
            С возвращением в сеть
          </h3>
          <p className="text-xs text-zinc-300 mt-1 max-w-[260px]">
            Ваше оборудование продолжало добывать монеты в фоновом режиме
          </p>
        </div>

        <div className="py-4">
          <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
            ДОБЫТО ЗА ВРЕМЯ ОТСУТСТВИЯ
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 tabular-nums mt-1">
            +{offlineEarned.toLocaleString('ru-RU')} $MACV
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleClaim}
            className="arcade-btn-gold w-full min-h-[48px] rounded-xl font-heading text-xs font-extrabold uppercase tracking-wider flex items-center justify-center"
          >
            ЗАБРАТЬ +{offlineEarned.toLocaleString('ru-RU')} $MACV
          </button>
        </div>
      </div>
    </div>
  );
};
