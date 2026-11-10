import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile, ScreenTab } from '../types';
import { syncUser, sendTaps } from '../api';

interface GameContextType {
  user: UserProfile | null;
  activeTab: ScreenTab;
  setActiveTab: (tab: ScreenTab) => void;
  offlineEarned: number;
  clearOfflineReward: () => void;
  handleTap: (clientX: number, clientY: number) => boolean;
  refreshUser: () => Promise<void>;
  updateUserDirectly: (updated: UserProfile) => void;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy' | 'success' | 'error') => void;
  floatingPoints: Array<{ id: number; x: number; y: number; amount: number }>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<ScreenTab>('tap');
  const [offlineEarned, setOfflineEarned] = useState<number>(0);
  const [floatingPoints, setFloatingPoints] = useState<Array<{ id: number; x: number; y: number; amount: number }>>([]);

  const pendingTapsRef = useRef<number>(0);
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Тактильная виброотдача через Telegram Mini App SDK
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'medium') => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) {
        if (type === 'success' || type === 'error') {
          tg.HapticFeedback.notificationOccurred(type);
        } else {
          tg.HapticFeedback.impactOccurred(type);
        }
      } else if (navigator.vibrate) {
        navigator.vibrate(type === 'heavy' ? 25 : 12);
      }
    } catch {
      // Игнорируем в браузере без поддержки
    }
  }, []);

  // Инициализация пользователя из Telegram WebApp
  const initGame = useCallback(async () => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        // Включаем полноэкранный режим и закрепляем цвета
        tg.setHeaderColor?.('#0B0E14');
        tg.setBackgroundColor?.('#0B0E14');
      }

      // Получаем данные из Telegram initData или url-параметров
      const tgUser = tg?.initDataUnsafe?.user;
      const urlParams = new URLSearchParams(window.location.search);
      const urlUserId = urlParams.get('userId');
      const referrerId = urlParams.get('start') || urlParams.get('ref');

      const telegramId = tgUser?.id || (urlUserId ? Number(urlUserId) : 7770001);
      const username = tgUser?.username || 'player';
      const firstName = tgUser?.first_name || 'Игрок';
      const refId = referrerId ? Number(referrerId.replace('ref_', '')) : null;

      const data = await syncUser(telegramId, username, firstName, refId);
      setUser(data.user);
      if (data.offlineEarned > 0) {
        setOfflineEarned(data.offlineEarned);
      }
    } catch (err) {
      console.error('Ошибка инициализации игры:', err);
    }
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Живая регенерация энергии каждую секунду
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      setUser((prev) => {
        if (!prev) return prev;
        if (prev.energy >= prev.maxEnergy) return prev;
        return {
          ...prev,
          energy: Math.min(prev.maxEnergy, prev.energy + prev.energyRechargeRate)
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [user?.maxEnergy, user?.energyRechargeRate]);

  // Живое начисление пассивного дохода каждую секунду для плавности
  useEffect(() => {
    if (!user || user.passiveIncomePerHour <= 0) return;
    const ratePerSec = user.passiveIncomePerHour / 3600;
    const interval = setInterval(() => {
      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          balance: prev.balance + ratePerSec,
          totalEarned: prev.totalEarned + ratePerSec
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [user?.passiveIncomePerHour]);

  // Отправка накопленных тапов на бэкенд пачкой
  const flushTaps = useCallback(async () => {
    if (!user || pendingTapsRef.current <= 0) return;
    const tapsToSend = pendingTapsRef.current;
    pendingTapsRef.current = 0;

    try {
      const result = await sendTaps(user.telegramId, tapsToSend);
      // Синхронизируем состояние с сервером
      setUser((prev) => {
        if (!prev) return result.user;
        return {
          ...result.user,
          // Сохраняем локальную энергию если она меньше серверной
          energy: Math.min(prev.energy, result.user.energy)
        };
      });
    } catch (err) {
      console.warn('Ошибка отправки тапов на сервер:', err);
    }
  }, [user]);

  // Обработка тапа по монете
  const handleTap = useCallback((clientX: number, clientY: number): boolean => {
    if (!user) return false;

    // Проверяем запас энергии
    if (user.energy < user.coinsPerTap) {
      triggerHaptic('error');
      return false;
    }

    const points = user.coinsPerTap;

    // Мгновенный отклик в интерфейсе (оптимистичное обновление)
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        balance: prev.balance + points,
        totalEarned: prev.totalEarned + points,
        energy: Math.max(0, prev.energy - points)
      };
    });

    // Виброотклик
    triggerHaptic('medium');

    // Анимация вылетающих очков
    const pointId = Date.now() + Math.random();
    setFloatingPoints((prev) => [...prev, { id: pointId, x: clientX, y: clientY, amount: points }]);
    setTimeout(() => {
      setFloatingPoints((prev) => prev.filter((p) => p.id !== pointId));
    }, 750);

    // Буферизация для отправки на бэкенд
    pendingTapsRef.current += 1;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      flushTaps();
    }, 1200);

    return true;
  }, [user, triggerHaptic, flushTaps]);

  const clearOfflineReward = useCallback(() => {
    setOfflineEarned(0);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    try {
      const data = await syncUser(user.telegramId, user.username, user.firstName);
      setUser(data.user);
    } catch (err) {
      console.warn('Ошибка обновления профиля:', err);
    }
  }, [user]);

  const updateUserDirectly = useCallback((updated: UserProfile) => {
    setUser(updated);
  }, []);

  return (
    <GameContext.Provider
      value={{
        user,
        activeTab,
        setActiveTab,
        offlineEarned,
        clearOfflineReward,
        handleTap,
        refreshUser,
        updateUserDirectly,
        triggerHaptic,
        floatingPoints
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
