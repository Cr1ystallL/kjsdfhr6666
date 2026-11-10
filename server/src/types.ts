export type LeagueType = 'Бронза' | 'Серебро' | 'Золото' | 'Платина' | 'Алмаз' | 'Владыка';

export interface UserUpgrades {
  // Базовые бусты кликера
  multitap: number;
  energyCapacity: number;
  rechargeSpeed: number;
  // Пассивные карточки
  cryptoNode: number;
  liquidityPool: number;
  aiTrader: number;
  dataCenter: number;
  validatorNode: number;
  tonStaking: number;
}

export interface User {
  id: string;
  telegramId: number;
  username: string;
  firstName: string;
  balance: number;
  totalEarned: number;
  energy: number;
  maxEnergy: number;
  coinsPerTap: number;
  energyRechargeRate: number; // энергии в секунду
  passiveIncomePerHour: number;
  league: LeagueType;
  lastActiveAt: number; // timestamp ms
  createdAt: number;
  
  // Задания и стрики
  completedTasks: string[]; // task IDs
  streakDay: number; // 1 to 7
  lastStreakClaimDate: string; // YYYY-MM-DD
  lastBoxClaimAt: number; // timestamp ms
  
  // Реферальная система
  referrerId: number | null;
  referralCount: number;
  referralEarnings: number;

  // Улучшения
  upgrades: UserUpgrades;

  // Web3 кошелек (готовность к крипте)
  walletAddress?: string;
}

export interface UpgradeCardDef {
  id: keyof UserUpgrades;
  title: string;
  description: string;
  category: 'tap' | 'passive';
  baseCost: number;
  costMultiplier: number;
  baseBonus: number;
  bonusType: 'coinsPerTap' | 'maxEnergy' | 'rechargeSpeed' | 'passiveIncomePerHour';
  maxLevel: number;
  iconName: string;
}

export interface TaskDef {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: 'social' | 'referral' | 'game';
  actionUrl?: string;
  requiredCount?: number;
  iconName: string;
}

export interface StreakReward {
  day: number;
  reward: number;
}
