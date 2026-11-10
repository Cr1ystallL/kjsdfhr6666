import React, { useState, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { BatteryCharging, Zap } from 'lucide-react';
import { BrandMark } from '../BrandMark';

export const TapScreen: React.FC = () => {
  const { user, handleTap, floatingPoints, triggerHaptic, updateUserDirectly } = useGame();
  const [tilt, setTilt] = useState<{ x: number; y: number; scale: number }>({ x: 0, y: 0, scale: 1 });
  const [freeBoostsLeft, setFreeBoostsLeft] = useState<number>(3);
  const coinRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  const energyPercent = Math.min(100, Math.max(0, (user.energy / user.maxEnergy) * 100));

  const applyTilt = (clientX: number, clientY: number) => {
    if (!coinRef.current) return;
    const rect = coinRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (clientX - centerX) / (rect.width / 2);
    const dy = (clientY - centerY) / (rect.height / 2);
    setTilt({ x: dy * -15, y: dx * 15, scale: 0.965 });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const success = handleTap(touch.clientX, touch.clientY);
      if (success) {
        applyTilt(touch.clientX, touch.clientY);
      }
    }

    setTimeout(() => {
      setTilt({ x: 0, y: 0, scale: 1 });
    }, 110);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const success = handleTap(e.clientX, e.clientY);
    if (success) {
      applyTilt(e.clientX, e.clientY);
    }

    setTimeout(() => {
      setTilt({ x: 0, y: 0, scale: 1 });
    }, 110);
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
      energy: user.maxEnergy,
    });
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-190px)] px-4 pt-2 pb-safe relative overflow-hidden">
      {/* Всплывающие числа при нажатии */}
      {floatingPoints.map((pt) => (
        <div
          key={pt.id}
          className="fixed z-50 text-2xl font-extrabold font-mono tabular-nums text-amber-300 pointer-events-none select-none animate-tap-number drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]"
          style={{ left: `${pt.x - 18}px`, top: `${pt.y - 28}px` }}
        >
          +{pt.amount}
        </div>
      ))}

      {/* Центральная 3D чеканная монета с официальным SVG логотипом */}
      <div className="coin-stage my-auto py-3 flex flex-col items-center justify-center">
        <div
          ref={coinRef}
          onTouchStart={handleTouchStart}
          onMouseDown={handleMouseDown}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.scale})`,
          }}
          className="coin-disc relative w-[268px] h-[268px] sm:w-[292px] sm:h-[292px] rounded-full cursor-pointer select-none flex items-center justify-center"
        >
          {/* SVG Чеканная основа монеты + рельефный гурт + векторный знак M */}
          <svg
            viewBox="0 0 300 300"
            className="w-full h-full drop-shadow-[0_18px_40px_rgba(0,0,0,0.95)]"
          >
            <defs>
              {/* Внешний золотой обод чеканки */}
              <linearGradient id="coinRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="28%" stopColor="#fbbf24" />
                <stop offset="62%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>

              {/* Внутренний фасет обода */}
              <linearGradient id="coinBevelGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fde68a" />
              </linearGradient>

              {/* Глубокое обсидиановое ложе монеты */}
              <radialGradient id="coinCoreGrad" cx="38%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#1b1812" />
                <stop offset="52%" stopColor="#0b0c0e" />
                <stop offset="100%" stopColor="#040406" />
              </radialGradient>

              {/* Золотой градиент центрального герба M */}
              <linearGradient id="emblemGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="25%" stopColor="#fde047" />
                <stop offset="60%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#92400e" />
              </linearGradient>

              {/* Тень под центральным логотипом */}
              <filter id="emblemShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.85" />
              </filter>
            </defs>

            {/* Внешний металлический диск */}
            <circle cx="150" cy="150" r="146" fill="url(#coinRimGrad)" />

            {/* Фрезерованный гурт (зубчатая насечка по периметру) */}
            <circle
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke="#1c1917"
              strokeWidth="4"
              strokeDasharray="3 3"
              opacity="0.55"
            />

            {/* Внутреннее золотое кольцо со скосом */}
            <circle cx="150" cy="150" r="134" fill="url(#coinBevelGrad)" />

            {/* Обсидиановое ядро монеты */}
            <circle cx="150" cy="150" r="126" fill="url(#coinCoreGrad)" />

            {/* Тонкое гравированное кольцо с точками */}
            <circle
              cx="150"
              cy="150"
              r="114"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1"
              strokeDasharray="2 6"
              opacity="0.45"
            />

            <circle
              cx="150"
              cy="150"
              r="106"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.75"
              opacity="0.08"
            />

            {/* Официальный векторный герб "M" из ButtonLogo.svg */}
            <g
              transform="translate(72, 214) scale(0.0152, -0.0152)"
              fill="url(#emblemGoldGrad)"
              filter="url(#emblemShadow)"
            >
              <path d="M5050 8891 c-186 -60 -321 -200 -450 -465 -181 -372 -333 -968 -486 -1906 -20 -124 -38 -232 -41 -240 -3 -8 -22 35 -43 95 -129 377 -321 783 -495 1045 -195 294 -367 434 -585 477 -218 43 -440 -63 -585 -281 -268 -403 -405 -1125 -405 -2136 0 -955 176 -2298 335 -2549 93 -148 230 -221 389 -208 138 12 263 105 329 244 30 65 32 74 31 183 0 102 -7 144 -57 365 -125 557 -201 1068 -239 1615 -19 283 -16 1071 5 1340 39 478 93 772 144 788 31 9 115 -120 197 -305 236 -528 498 -1528 636 -2427 86 -566 99 -960 50 -1546 -26 -312 -20 -400 38 -515 35 -70 68 -110 136 -161 121 -92 292 -111 427 -46 122 58 216 182 245 324 13 62 13 102 -3 362 -24 399 -24 1277 0 1616 33 459 68 801 142 1392 112 891 214 1493 334 1971 60 234 86 309 109 305 42 -8 159 -453 256 -968 93 -495 211 -1393 271 -2055 94 -1040 92 -1452 -12 -2659 -14 -163 -15 -213 -5 -280 36 -247 222 -398 474 -384 69 4 100 12 153 36 85 41 175 129 214 212 50 106 56 167 41 449 -19 367 -6 665 51 1121 104 839 333 1741 594 2346 109 250 248 496 302 531 25 16 26 16 49 -10 72 -84 156 -523 196 -1017 17 -219 17 -987 0 -1220 -35 -467 -75 -835 -148 -1355 -43 -304 -46 -335 -35 -398 24 -142 112 -260 238 -320 62 -29 77 -32 163 -32 131 1 190 25 279 114 99 99 135 181 175 412 88 495 122 972 113 1569 -19 1153 -141 1925 -384 2416 -105 213 -230 350 -388 426 -224 107 -451 83 -681 -73 -221 -149 -470 -481 -674 -902 l-68 -139 -22 124 c-134 741 -300 1479 -410 1823 -172 536 -366 817 -618 895 -82 25 -205 26 -282 1z" />
            </g>

            {/* Чеканная надпись в нижней части монеты */}
            <text
              x="150"
              y="224"
              textAnchor="middle"
              fill="#fbbf24"
              fontFamily="Unbounded, sans-serif"
              fontWeight="800"
              fontSize="12"
              letterSpacing="4"
            >
              MACVCOIN
            </text>
            <text
              x="150"
              y="240"
              textAnchor="middle"
              fill="#a1a1aa"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              fontSize="9"
              letterSpacing="2"
            >
              $MACV • СЕТЬ TON
            </text>
          </svg>
        </div>
      </div>

      {/* Единый пульт управления энергией в зоне большого пальца (без вложенных контейнеров) */}
      <div className="w-full max-w-md bg-[#0b0c10] border border-white/[0.08] rounded-2xl divide-y divide-white/[0.06]">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>ЗАПАС ЭНЕРГИИ</span>
            </div>
            <div className="font-mono text-base font-extrabold text-white tabular-nums mt-0.5">
              {Math.floor(user.energy).toLocaleString('ru-RU')}
              <span className="text-zinc-400 text-xs font-semibold">
                {' '}/ {user.maxEnergy.toLocaleString('ru-RU')}
              </span>
            </div>
          </div>

          <button
            onClick={handleFullEnergyBoost}
            disabled={freeBoostsLeft <= 0 || user.energy >= user.maxEnergy}
            className={`min-h-[44px] px-4 rounded-xl flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider ${
              freeBoostsLeft > 0 && user.energy < user.maxEnergy
                ? 'arcade-btn-gold'
                : 'arcade-btn-dark opacity-50 cursor-not-allowed'
            }`}
          >
            <BatteryCharging className="w-4 h-4" />
            <span className="font-mono tabular-nums">ЗАРЯД {freeBoostsLeft}/3</span>
          </button>
        </div>

        {/* Линия индикатора заряда и сводка добычи */}
        <div className="px-4 py-2.5">
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-200"
              style={{ width: `${energyPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 tabular-nums mt-2">
            <span>ВОССТАНОВЛЕНИЕ: +{user.energyRechargeRate} / СЕК</span>
            <span>ВСЕГО ДОБЫТО: {Math.floor(user.totalEarned).toLocaleString('ru-RU')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
