import { UserProfile, UpgradeItem, TaskItem, StreakBonusInfo, UserUpgrades } from './types';

const API_BASE = typeof window !== 'undefined' && window.location.pathname.includes('/coin')
  ? '/coin-api'
  : '/api';

export async function syncUser(telegramId: number, username = '', firstName = '', referrerId: number | null = null): Promise<{ user: UserProfile; offlineEarned: number }> {
  try {
    const res = await fetch(`${API_BASE}/user/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId, username, firstName, referrerId })
    });
    if (!res.ok) throw new Error('Failed to sync user');
    return await res.json();
  } catch (err) {
    console.warn('API offline, using local state fallback');
    // Fallback локального состояния для разработки
    return {
      user: {
        id: `usr_${telegramId}`,
        telegramId,
        username: username || 'Игрок',
        firstName: firstName || 'Игрок',
        balance: 1000,
        totalEarned: 1000,
        energy: 1000,
        maxEnergy: 1000,
        coinsPerTap: 1,
        energyRechargeRate: 1,
        passiveIncomePerHour: 0,
        league: 'Бронза',
        lastActiveAt: Date.now(),
        createdAt: Date.now(),
        completedTasks: [],
        streakDay: 1,
        lastStreakClaimDate: '',
        lastBoxClaimAt: 0,
        referrerId: null,
        referralCount: 0,
        referralEarnings: 0,
        upgrades: {
          multitap: 0,
          energyCapacity: 0,
          rechargeSpeed: 0,
          cryptoNode: 0,
          liquidityPool: 0,
          aiTrader: 0,
          dataCenter: 0,
          validatorNode: 0,
          tonStaking: 0
        }
      },
      offlineEarned: 0
    };
  }
}

export async function sendTaps(telegramId: number, taps: number): Promise<{ user: UserProfile; appliedTaps: number }> {
  const res = await fetch(`${API_BASE}/user/tap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegramId, taps })
  });
  if (!res.ok) throw new Error('Failed to send taps');
  return await res.json();
}

export async function fetchUpgrades(telegramId: number): Promise<UpgradeItem[]> {
  const res = await fetch(`${API_BASE}/upgrades/list?telegramId=${telegramId}`);
  if (!res.ok) throw new Error('Failed to fetch upgrades');
  const data = await res.json();
  return data.upgrades;
}

export async function buyUpgrade(telegramId: number, upgradeId: keyof UserUpgrades): Promise<{ user: UserProfile }> {
  const res = await fetch(`${API_BASE}/upgrades/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegramId, upgradeId })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Ошибка покупки улучшения');
  }
  return await res.json();
}

export async function fetchTasks(telegramId: number): Promise<TaskItem[]> {
  const res = await fetch(`${API_BASE}/tasks/list?telegramId=${telegramId}`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const data = await res.json();
  return data.tasks;
}

export async function claimTask(telegramId: number, taskId: string): Promise<{ user: UserProfile; reward: number }> {
  const res = await fetch(`${API_BASE}/tasks/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegramId, taskId })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Ошибка получения награды за задание');
  }
  return await res.json();
}

export async function fetchStreakInfo(telegramId: number): Promise<StreakBonusInfo> {
  const res = await fetch(`${API_BASE}/bonuses/streak?telegramId=${telegramId}`);
  if (!res.ok) throw new Error('Failed to fetch streak info');
  return await res.json();
}

export async function claimStreak(telegramId: number): Promise<{ user: UserProfile; reward: number; streakDay: number }> {
  const res = await fetch(`${API_BASE}/bonuses/claim-streak`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegramId })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Ошибка получения ежедневного бонуса');
  }
  return await res.json();
}

export async function claimBox(telegramId: number): Promise<{ user: UserProfile; reward: number }> {
  const res = await fetch(`${API_BASE}/bonuses/claim-box`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegramId })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Ошибка открытия сундука');
  }
  return await res.json();
}

export async function fetchReferrals(telegramId: number) {
  const res = await fetch(`${API_BASE}/referrals/list?telegramId=${telegramId}`);
  if (!res.ok) throw new Error('Failed to fetch referrals');
  return await res.json();
}
