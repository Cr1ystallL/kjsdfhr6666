import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { StreakBonusInfo } from '../../types';
import { fetchStreakInfo, claimStreak, claimBox } from '../../api';
import { Gift, Check, Clock, Box } from 'lucide-react';

export const BonusesScreen: React.FC = () => {
  const { user, triggerHaptic, updateUserDirectly } = useGame();
  const [streakInfo, setStreakInfo] = useState<StreakBonusInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [claimingStreak, setClaimingStreak] = useState<boolean>(false);
  const [claimingBox, setClaimingBox] = useState<boolean>(false);
  const [boxTimeLeft, setBoxTimeLeft] = useState<number>(0);
  const [lastBoxReward, setLastBoxReward] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClaimStreak = async () => {
    if (!user || !streakInfo || streakInfo.isClaimedToday || claimingStreak) return;
    setClaimingStreak(true);
    setErrorMessage(null);
    try {
      const res = await claimStreak(user.telegramId);
      triggerHaptic('success');
      updateUserDirectly(res.user);
      await loadData();
    } catch (err: any) {
      triggerHaptic('error');
      setErrorMessage(err?.message || 'Ошибка получения ежедневной награды');
    } finally {
      setClaimingStreak(false);
    }
  };

  const handleClaimBox = async () => {
    if (!user || boxTimeLeft > 0 || claimingBox) return;
    setClaimingBox(true);
    setErrorMessage(null);
    setLastBoxReward(null);
    try {
      const res = await claimBox(user.telegramId);
      triggerHaptic('success');
      setLastBoxReward(res.reward);
      updateUserDirectly(res.user);
      await loadData();
    } catch (err: any) {
      triggerHaptic('error');
      setErrorMessage(err?.message || 'Сундук еще перезаряжается');
    } finally {
      setClaimingBox(false);
    }
  };

  return (
    <div className="px-4 py-3 max-w-lg mx-auto pb-safe space-y-4">
      <div>
        <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
          ЕЖЕДНЕВНОЕ ПООЩРЕНИЕ
        </div>
        <h2 className="font-heading text-lg font-extrabold text-white flex items-center gap-2 mt-0.5">
          <Gift className="w-5 h-5 text-amber-400" />
          <span>Бонусы и Награды</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Заходите в игру каждый день без пропусков и забирайте до 150 000 $MACV
        </p>
      </div>

      {errorMessage && (
        <div className="px-3.5 py-2.5 rounded-xl bg-[#0b0c10] border border-amber-500/40 text-xs text-amber-300 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Панель 1: Серия ежедневных наград (единая плоская поверхность, деление только линиями) */}
      <div className="bg-[#0b0c10] border border-white/[0.08] rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-white">
            Серия входов (7 дней)
          </span>
          <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
            День {streakInfo?.streakDay || 1} из 7
          </span>
        </div>

        {/* Список дней на плоской поверхности с тонкими разделителями */}
        <div className="divide-y divide-white/[0.06]">
          {streakInfo?.rewards.map((r) => {
            const currentDay = streakInfo.streakDay;
            const isPast = r.day < currentDay;
            const isToday = r.day === currentDay;
            const isClaimed = isPast || (isToday && streakInfo.isClaimedToday);

            return (
              <div
                key={r.day}
                className="px-4 py-2.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`font-mono font-extrabold uppercase tracking-wider ${
                      isToday && !streakInfo.isClaimedToday
                        ? 'text-amber-400'
                        : isClaimed
                        ? 'text-emerald-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    ДЕНЬ {r.day}
                  </span>
                  {isToday && !streakInfo.isClaimedToday && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-white">
                      • ДОСТУПНО СЕЙЧАС
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-white tabular-nums">
                    +{r.reward.toLocaleString('ru-RU')} $MACV
                  </span>
                  {isClaimed ? (
                    <span className="font-mono text-[11px] font-bold text-emerald-400 flex items-center gap-1 min-w-[68px] justify-end">
                      <Check className="w-3.5 h-3.5" /> ВЗЯТО
                    </span>
                  ) : isToday ? (
                    <span className="font-mono text-[11px] font-bold text-amber-400 min-w-[68px] text-right">
                      СЕГОДНЯ
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-zinc-400 min-w-[68px] text-right">
                      ОЖИДАНИЕ
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3.5">
          <button
            onClick={handleClaimStreak}
            disabled={loading || streakInfo?.isClaimedToday || claimingStreak}
            className={`w-full min-h-[46px] rounded-xl font-heading text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 ${
              streakInfo?.isClaimedToday
                ? 'arcade-btn-dark opacity-55 cursor-not-allowed text-zinc-400'
                : 'arcade-btn-gold'
            }`}
          >
            {streakInfo?.isClaimedToday ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>НАГРАДА ДНЯ ПОЛУЧЕНА</span>
              </>
            ) : (
              <span>ЗАБРАТЬ НАГРАДУ ДНЯ</span>
            )}
          </button>
        </div>
      </div>

      {/* Панель 2: Сундук удачи каждые 4 часа (единая плоская поверхность) */}
      <div className="bg-[#0b0c10] border border-white/[0.08] rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
        <div className="p-4 flex items-start gap-3">
          <Box className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="text-sm font-bold text-white">
              Сундук Удачи (каждые 4 часа)
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">
              Мгновенная случайная выплата от 1 500 до 15 000 $MACV на ваш баланс
            </div>
            {lastBoxReward !== null && (
              <div className="text-xs font-mono font-bold text-emerald-400 tabular-nums mt-1.5">
                НАЧИСЛЕНО ИЗ СУНДУКА: +{lastBoxReward.toLocaleString('ru-RU')} $MACV
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-400 font-semibold">Таймер:</span>
            <span className="font-mono font-bold text-white tabular-nums">
              {boxTimeLeft > 0 ? formatTimer(boxTimeLeft) : 'ДОСТУПЕН'}
            </span>
          </div>

          <button
            onClick={handleClaimBox}
            disabled={boxTimeLeft > 0 || claimingBox}
            className={`min-w-[130px] min-h-[44px] px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center ${
              boxTimeLeft > 0
                ? 'arcade-btn-dark opacity-50 cursor-not-allowed'
                : 'arcade-btn-gold'
            }`}
          >
            {claimingBox ? '...' : boxTimeLeft > 0 ? 'ОЖИДАНИЕ' : 'ОТКРЫТЬ'}
          </button>
        </div>
      </div>
    </div>
  );
};
