import React, { useState, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { BatteryCharging, Zap, Shield } from 'lucide-react';

export const TapScreen: React.FC = () => {
  const { user, handleTap, floatingPoints, triggerHaptic, updateUserDirectly } = useGame();
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [freeBoostsLeft, setFreeBoostsLeft] = useState<number>(3);
  const coinRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  const energyPercent = Math.min(100, Math.max(0, (user.energy / user.maxEnergy) * 100));

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!coinRef.current) return;
    const rect = coinRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const success = handleTap(touch.clientX, touch.clientY);
      if (success) {
        const dx = (touch.clientX - centerX) / (rect.width / 2);
        const dy = (touch.clientY - centerY) / (rect.height / 2);
        setTilt({ x: dy * -14, y: dx * 14 });
      }
    }

    setTimeout(() => {
      setTilt({ x: 0, y: 0 });
    }, 120);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!coinRef.current) return;
    const rect = coinRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const success = handleTap(e.clientX, e.clientY);
    if (success) {
      const dx = (e.clientX - centerX) / (rect.width / 2);
      const dy = (e.clientY - centerY) / (rect.height / 2);
      setTilt({ x: dy * -14, y: dx * 14 });
    }

    setTimeout(() => {
      setTilt({ x: 0, y: 0 });
    }, 120);
  };

  const handleFullEnergyBoost = () => {
    if (freeBoostsLeft <= 0 || user.energy >= user.maxEnergy) {
      triggerHaptic('error');
      return;
    }
    triggerHaptic('success');
    setFreeBoostsLeft((prev) => prev - 1);
    updateUserDirectly({
      ...user,
      energy: user.maxEnergy
    });
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-185px)] px-4 py-2 relative">
      {/* Всплывающие очки при нажатии */}
      {floatingPoints.map((pt) => (
        <div
          key={pt.id}
          className="fixed z-50 text-2xl font-black font-mono text-amber-300 pointer-events-none select-none animate-tap-number drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]"
          style={{ left: `${pt.x - 16}px`, top: `${pt.y - 24}px` }}
        >
          +{pt.amount}
        </div>
      ))}

      {/* Верхний статус лиги и прогресс */}
      <div className="w-full max-w-sm flex items-center justify-between px-2 pt-1 text-xs text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-semibold text-zinc-300">Лига {user.league}</span>
        </div>
        <div className="font-mono text-[11px] tabular-nums text-zinc-400">
          Всего: {Math.floor(user.totalEarned).toLocaleString('ru-RU')}
        </div>
      </div>

      {/* Интерактивная 3D монета MacvCoin */}
      <div className="coin-wrapper my-auto py-4 flex items-center justify-center">
        <div
          ref={coinRef}
          onTouchStart={handleTouchStart}
          onMouseDown={handleMouseDown}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
          className="coin-face w-64 h-64 sm:w-72 sm:h-72 rounded-full cursor-pointer relative flex items-center justify-center bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-3 select-none"
        >
          {/* Внешний обод */}
          <div className="w-full h-full rounded-full border-4 border-amber-300/40 flex items-center justify-center bg-gradient-to-b from-[#1A150D] to-[#0D0B07] shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.25)_0,transparent_70%)]" />

            {/* Внутренний герб / эмблема MacvCoin */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-lg flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#120E08] flex items-center justify-center">
                  <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 font-mono tracking-tighter">
                    M
                  </span>
                </div>
              </div>
              <span className="mt-2 text-xs font-black uppercase tracking-[0.25em] text-amber-400 drop-shadow">
                MACVCOIN
              </span>
              <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-mono">
                $MACV • CRYPTO TAP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Нижняя панель управления: Индикатор энергии + Бесплатный буст */}
      <div className="w-full max-w-sm pb-2">
        <div className="flex items-center justify-between text-xs mb-1.5 px-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span className="font-mono text-sm tabular-nums text-white">
              {Math.floor(user.energy)}
            </span>
            <span className="text-zinc-400 font-normal">/ {user.maxEnergy}</span>
          </div>

          <button
            onClick={handleFullEnergyBoost}
            disabled={freeBoostsLeft <= 0 || user.energy >= user.maxEnergy}
            className={`arcade-btn flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
              freeBoostsLeft > 0 && user.energy < user.maxEnergy
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
                : 'bg-zinc-800/40 border border-white/5 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>БУСТ {freeBoostsLeft}/3</span>
          </button>
        </div>

        <div className="w-full h-2.5 bg-[#10141D] rounded-full overflow-hidden border border-white/10 p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-200 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            style={{ width: `${energyPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
