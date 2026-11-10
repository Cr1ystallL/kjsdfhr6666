import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { StreakBonusInfo } from '../../types';
import { fetchStreakInfo, claimStreak, claimBox } from '../../api';
import { Gift, Sparkles, Check, Clock, Box } from 'lucide-react';

export const BonusesScreen: React.FC = () => {
  const { user, triggerHaptic, updateUserDirectly } = useGame();
  const [streakInfo, setStreakInfo] = useState<StreakBonusInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [claimingStreak, setClaimingStreak] = useState<boolean>(false);
  const [claimingBox, setClaimingBox] = useState<boolean>(false);
  const [boxTimeLeft, setBoxTimeLeft] = useState<number>(0);

  const loadData = async () => {
    if (!user) return;
    try {
      const data = await fetchStreakInfo(user.telegramId);
      setStreakInfo(data);
      setBoxTimeLeft(data.boxCooldownMs);
    } catch (err) {
      console.warn('Ошибка загрузки бонусов:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.telegramId]);

  // Таймер обратного отсчета для сундука
  useEffect(() => {
    if (boxTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setBoxTimeLeft((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [boxTimeLeft]);

  const formatTimer = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClaimStreak = async () => {
    if (!user || !streakInfo || streakInfo.isClaimedToday || claimingStreak) return;
    setClaimingStreak(true);
    try {
      const res = await claimStreak(user.telegramId);
      triggerHaptic('success');
      updateUserDirectly(res.user);
      await loadData();
    } catch (err: any) {
      triggerHaptic('error');
      alert(err.message || 'Ошибка получения бонуса');
    } finally {
      setClaimingStreak(false);
    }
  };

  const handleClaimBox = async () => {
    if (!user || boxTimeLeft > 0 || claimingBox) return;
    setClaimingBox(true);
    try {
      const res = await claimBox(user.telegramId);
      triggerHaptic('success');
      alert(`🎁 Вы открыли сундук и получили +${res.reward.toLocaleString('ru-RU')} $MAG!`);
      updateUserDirectly(res.user);
      await loadData();
    } catch (err: any) {
      triggerHaptic('error');
      alert(err.message || 'Сундук еще перезаряжается');
    } finally {
      setClaimingBox(false);
    }
  };

  return (
    <div className="px-4 py-3 max-w-lg mx-auto pb-safe">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-500" />
          <span>Ежедневные Бонусы</span>
        </h2>
        <p className="text-xs text-zinc-400">
          Заходите каждый день без перерывов, чтобы увеличивать размер награды до 150 000 $MAG
        </p>
      </div>

      {/* Блок 1: 7-дневный стрик наград (плоская поверхность, деления тонкими линиями) */}
      <div className="border border-white/10 rounded-xl bg-[#10141D] p-4 mb-4">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Календарь Наград (7 Дней)</span>
          </div>
          <div className="text-[11px] font-mono text-amber-400 font-semibold">
            День {streakInfo?.streakDay || 1} из 7
          </div>
        </div>

        {/* Сетка дней 1-7 */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {streakInfo?.rewards.map((r) => {
            const currentDay = streakInfo.streakDay;
            const isPast = r.day < currentDay;
            const isToday = r.day === currentDay;
            const isClaimed = isPast || (isToday && streakInfo.isClaimedToday);

            return (
              <div
                key={r.day}
                className={`p-2 rounded-lg text-center border transition-all ${
                  isToday && !streakInfo.isClaimedToday
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : isClaimed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-zinc-400'
                    : 'bg-[#0B0E14] border-white/5 text-zinc-400'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider">
                  ДЕНЬ {r.day}
                </div>
                <div className="text-xs font-mono font-bold text-amber-400 my-0.5 tabular-nums">
                  +{r.reward >= 1000 ? `${r.reward / 1000}k` : r.reward}
                </div>
                <div className="text-[10px] flex items-center justify-center">
                  {isClaimed ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Взят
                    </span>
                  ) : isToday ? (
                    <span className="text-amber-400 font-bold">Сегодня</span>
                  ) : (
                    <span className="text-zinc-400">Скоро</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Кнопка забрать стрик */}
        <button
          onClick={handleClaimStreak}
          disabled={loading || streakInfo?.isClaimedToday || claimingStreak}
          className={`arcade-btn w-full min-h-[44px] rounded-xl font-mono text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 ${
            streakInfo?.isClaimedToday
              ? 'bg-[#181F2C] text-zinc-400 border border-white/5 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500'
          }`}
        >
          {streakInfo?.isClaimedToday ? (
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Check className="w-4 h-4 text-emerald-400" /> СЕГОДНЯ НАГРАДА УЖЕ ВЗЯТА
            </span>
          ) : (
            <span>ЗАБРАТЬ НАГРАДУ ДНЯ</span>
          )}
        </button>
      </div>

      {/* Блок 2: Сундук Удачи (Fortune Box) */}
      <div className="border border-white/10 rounded-xl bg-[#10141D] p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Сундук Удачи</div>
              <div className="text-[11px] text-zinc-400">Случайный дроп от 1 500 до 15 000 $MAG</div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Перезарядка:</span>
            <span className="font-mono font-bold text-white tabular-nums">
              {boxTimeLeft > 0 ? formatTimer(boxTimeLeft) : 'ГОТОВ'}
            </span>
          </div>

          <button
            onClick={handleClaimBox}
            disabled={boxTimeLeft > 0 || claimingBox}
            className={`arcade-btn min-w-[120px] min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center ${
              boxTimeLeft > 0
                ? 'bg-[#181F2C] text-zinc-400 border border-white/5 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500'
            }`}
          >
            {claimingBox ? '...' : boxTimeLeft > 0 ? 'ЖДИТЕ' : 'ОТКРЫТЬ'}
          </button>
        </div>
      </div>
    </div>
  );
};
