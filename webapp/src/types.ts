export type LeagueType = 'Бронза' | 'Серебро' | 'Золото' | 'Платина' | 'Алмаз' | 'Владыка';

export interface UserUpgrades {
  multitap: number;
  energyCapacity: number;
  rechargeSpeed: number;
  cryptoNode: number;
  liquidityPool: number;
  aiTrader: number;
  dataCenter: number;
  validatorNode: number;
  tonStaking: number;
}

export interface UserProfile {
  id: string;
  telegramId: number;
  username: string;
  firstName: string;
  balance: number;
  totalEarned: number;
  energy: number;
  maxEnergy: number;
  coinsPerTap: number;
  energyRechargeRate: number;
  passiveIncomePerHour: number;
  league: LeagueType;
  lastActiveAt: number;
  createdAt: number;
  completedTasks: string[];
  streakDay: number;
  lastStreakClaimDate: string;
  lastBoxClaimAt: number;
  referrerId: number | null;
  referralCount: number;
  referralEarnings: number;
  upgrades: UserUpgrades;
  walletAddress?: string;
}

export interface UpgradeItem {
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
  currentLevel: number;
  nextCost: number;
  currentBonus: number;
  nextBonus: number;
  isMaxLevel: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: 'social' | 'referral' | 'game';
  actionUrl?: string;
  requiredCount?: number;
  iconName: string;
  isCompleted: boolean;
  canClaim: boolean;
  currentProgress: number;
}

export interface StreakBonusInfo {
  streakDay: number;
  isClaimedToday: boolean;
  rewards: Array<{ day: number; reward: number }>;
  boxAvailable: boolean;
  boxCooldownMs: number;
}

export type ScreenTab = 'tap' | 'upgrades' | 'tasks' | 'bonuses' | 'profile' | 'about';
