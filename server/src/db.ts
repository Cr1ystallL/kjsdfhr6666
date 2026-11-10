import fs from 'fs';
import path from 'path';
import { User, UserUpgrades, UpgradeCardDef, TaskDef, StreakReward, LeagueType } from './types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Конфигурация карточек прокачки
export const UPGRADE_DEFINITIONS: UpgradeCardDef[] = [
  // Базовые кликер-бусты
  {
    id: 'multitap',
    title: 'Мульти-Тап',
    description: '+1 к добыче монет за каждое касание экрана',
    category: 'tap',
    baseCost: 200,
    costMultiplier: 2.1,
    baseBonus: 1,
    bonusType: 'coinsPerTap',
    maxLevel: 25,
    iconName: 'Zap'
  },
  {
    id: 'energyCapacity',
    title: 'Емкость Батареи',
    description: '+500 к максимальному запасу энергии',
    category: 'tap',
    baseCost: 300,
    costMultiplier: 1.9,
    baseBonus: 500,
    bonusType: 'maxEnergy',
    maxLevel: 30,
    iconName: 'BatteryCharging'
  },
  {
    id: 'rechargeSpeed',
    title: 'Скорость Зарядки',
    description: '+1 к регенерации энергии в секунду',
    category: 'tap',
    baseCost: 500,
    costMultiplier: 2.3,
    baseBonus: 1,
    bonusType: 'rechargeSpeed',
    maxLevel: 10,
    iconName: 'Activity'
  },

  // Пассивный доход в час (карточки инфраструктуры)
  {
    id: 'cryptoNode',
    title: 'Крипто-Узел',
    description: 'Локальная нода валидации транзакций MacvCoin',
    category: 'passive',
    baseCost: 1000,
    costMultiplier: 1.6,
    baseBonus: 250,
    bonusType: 'passiveIncomePerHour',
    maxLevel: 50,
    iconName: 'Cpu'
  },
  {
    id: 'liquidityPool',
    title: 'Пул Ликвидности',
    description: 'Обеспечение объема торгов пары MACV/TON',
    category: 'passive',
    baseCost: 3500,
    costMultiplier: 1.65,
    baseBonus: 950,
    bonusType: 'passiveIncomePerHour',
    maxLevel: 50,
    iconName: 'Coins'
  },
  {
    id: 'aiTrader',
    title: 'Нейро-Трейдер',
    description: 'Алгоритмический бот арбитража на DEX-биржах',
    category: 'passive',
    baseCost: 10000,
    costMultiplier: 1.7,
    baseBonus: 3200,
    bonusType: 'passiveIncomePerHour',
    maxLevel: 40,
    iconName: 'Bot'
  },
  {
    id: 'dataCenter',
    title: 'Серверный Кластер',
    description: 'Вычислительные мощности облачного дата-центра',
    category: 'passive',
    baseCost: 35000,
    costMultiplier: 1.75,
    baseBonus: 12500,
    bonusType: 'passiveIncomePerHour',
    maxLevel: 30,
    iconName: 'Server'
  },
  {
    id: 'validatorNode',
    title: 'Мастернода Сети',
    description: 'Участие в консенсусе блокчейна первого уровня',
    category: 'passive',
    baseCost: 100000,
    costMultiplier: 1.8,
    baseBonus: 40000,
    bonusType: 'passiveIncomePerHour',
    maxLevel: 20,
    iconName: 'ShieldCheck'
  },
  {
    id: 'tonStaking',
    title: 'TON Стейкинг-Хранилище',
    description: 'Заблокированные активы в смарт-контракте экосистемы',
    category: 'passive',
    baseCost: 300000,
    costMultiplier: 1.85,
    baseBonus: 140000,
    bonusType: 'passiveIncomePerHour',
    maxLevel: 15,
    iconName: 'Vault'
  }
];

// Список заданий
export const TASK_DEFINITIONS: TaskDef[] = [
  {
    id: 'tg_channel',
    title: 'Подписка на канал MacvCoin',
    description: 'Следи за анонсами, инсайдами и датой листинга $MACV',
    reward: 10000,
    category: 'social',
    actionUrl: 'https://t.me/macvcoin_channel',
    iconName: 'Send'
  },
  {
    id: 'tg_chat',
    title: 'Вступить в комьюнити-чат',
    description: 'Обсуждай стратегии прокачки с другими майнерами',
    reward: 10000,
    category: 'social',
    actionUrl: 'https://t.me/macvcoin_chat',
    iconName: 'Users'
  },
  {
    id: 'invite_3_friends',
    title: 'Пригласить 3 друзей',
    description: 'Поделись ссылкой с друзьями и получи бонус в $MACV',
    reward: 50000,
    category: 'referral',
    requiredCount: 3,
    iconName: 'UserPlus'
  },
  {
    id: 'invite_10_friends',
    title: 'Пригласить 10 друзей',
    description: 'Создай свою команду майнеров MacvCoin',
    reward: 200000,
    category: 'referral',
    requiredCount: 10,
    iconName: 'Award'
  },
  {
    id: 'first_10k_taps',
    title: 'Натапать 10,000 монет',
    description: 'Начальная активность в кликере',
    reward: 15000,
    category: 'game',
    iconName: 'Flame'
  },
  {
    id: 'upgrade_to_silver',
    title: 'Достичь лиги Серебро',
    description: 'Набери более 25,000 очков прогресса',
    reward: 25000,
    category: 'game',
    iconName: 'Shield'
  }
];

// Награды за ежедневный стрик
export const STREAK_REWARDS: StreakReward[] = [
  { day: 1, reward: 1000 },
  { day: 2, reward: 2500 },
  { day: 3, reward: 5000 },
  { day: 4, reward: 12000 },
  { day: 5, reward: 25000 },
  { day: 6, reward: 50000 },
  { day: 7, reward: 150000 }
];

interface DatabaseSchema {
  users: Record<string, User>;
}

class Database {
  private data: DatabaseSchema = { users: {} };
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Ошибка чтения database.json, создаем новую базу:', err);
        this.data = { users: {} };
        this.persistImmediate();
      }
    } else {
      this.persistImmediate();
    }
  }

  private persistImmediate() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Ошибка записи базы данных:', err);
    }
  }

  private scheduleSave() {
    if (this.saveTimeout) return;
    this.saveTimeout = setTimeout(() => {
      this.persistImmediate();
      this.saveTimeout = null;
    }, 1000);
  }

  public calculateLeague(totalEarned: number): LeagueType {
    if (totalEarned >= 2000000) return 'Владыка';
    if (totalEarned >= 500000) return 'Алмаз';
    if (totalEarned >= 100000) return 'Платина';
    if (totalEarned >= 25000) return 'Золото';
    if (totalEarned >= 5000) return 'Серебро';
    return 'Бронза';
  }

  public calculateUpgradeCost(def: UpgradeCardDef, currentLevel: number): number {
    return Math.round(def.baseCost * Math.pow(def.costMultiplier, currentLevel));
  }

  public getOrCreateUser(telegramId: number, username = '', firstName = '', referrerId: number | null = null): { user: User; offlineEarned: number } {
    const key = String(telegramId);
    const now = Date.now();
    let offlineEarned = 0;

    if (!this.data.users[key]) {
      const defaultUpgrades: UserUpgrades = {
        multitap: 0,
        energyCapacity: 0,
        rechargeSpeed: 0,
        cryptoNode: 0,
        liquidityPool: 0,
        aiTrader: 0,
        dataCenter: 0,
        validatorNode: 0,
        tonStaking: 0
      };

      const newUser: User = {
        id: `usr_${telegramId}`,
        telegramId,
        username: username || `player_${telegramId}`,
        firstName: firstName || 'Игрок',
        balance: 1000,
        totalEarned: 1000,
        energy: 1000,
        maxEnergy: 1000,
        coinsPerTap: 1,
        energyRechargeRate: 1,
        passiveIncomePerHour: 0,
        league: 'Бронза',
        lastActiveAt: now,
        createdAt: now,
        completedTasks: [],
        streakDay: 1,
        lastStreakClaimDate: '',
        lastBoxClaimAt: 0,
        referrerId: referrerId && referrerId !== telegramId ? referrerId : null,
        referralCount: 0,
        referralEarnings: 0,
        upgrades: defaultUpgrades
      };

      if (newUser.referrerId) {
        const refKey = String(newUser.referrerId);
        if (this.data.users[refKey]) {
          const refUser = this.data.users[refKey];
          refUser.referralCount += 1;
          refUser.balance += 5000;
          refUser.referralEarnings += 5000;
          refUser.totalEarned += 5000;
          refUser.league = this.calculateLeague(refUser.totalEarned);
        }
        newUser.balance += 5000;
        newUser.totalEarned += 5000;
      }

      this.data.users[key] = newUser;
      this.scheduleSave();
      return { user: newUser, offlineEarned: 0 };
    }

    const user = this.data.users[key];
    if (username && user.username !== username) user.username = username;
    if (firstName && user.firstName !== firstName) user.firstName = firstName;

    const secondsPassed = Math.max(0, Math.floor((now - user.lastActiveAt) / 1000));
    const regeneratedEnergy = secondsPassed * user.energyRechargeRate;
    user.energy = Math.min(user.maxEnergy, user.energy + regeneratedEnergy);

    if (user.passiveIncomePerHour > 0 && secondsPassed > 60) {
      const cappedSeconds = Math.min(secondsPassed, 3 * 3600);
      const earned = Math.floor((user.passiveIncomePerHour / 3600) * cappedSeconds);
      if (earned > 0) {
        user.balance += earned;
        user.totalEarned += earned;
        offlineEarned = earned;
      }
    }

    user.lastActiveAt = now;
    user.league = this.calculateLeague(user.totalEarned);
    this.scheduleSave();

    return { user, offlineEarned };
  }

  public syncTaps(telegramId: number, taps: number): { user: User; appliedTaps: number } {
    const key = String(telegramId);
    const user = this.data.users[key];
    if (!user) throw new Error('Пользователь не найден');

    const now = Date.now();
    const secondsPassed = Math.max(0, Math.floor((now - user.lastActiveAt) / 1000));
    user.energy = Math.min(user.maxEnergy, user.energy + secondsPassed * user.energyRechargeRate);
    user.lastActiveAt = now;

    const maxTapsPossible = Math.floor(user.energy / user.coinsPerTap);
    const validTaps = Math.min(taps, maxTapsPossible);

    if (validTaps > 0) {
      const earnedCoins = validTaps * user.coinsPerTap;
      const energyUsed = validTaps * user.coinsPerTap;

      user.balance += earnedCoins;
      user.totalEarned += earnedCoins;
      user.energy = Math.max(0, user.energy - energyUsed);
      user.league = this.calculateLeague(user.totalEarned);

      if (user.referrerId) {
        const refUser = this.data.users[String(user.referrerId)];
        if (refUser) {
          const commission = Math.floor(earnedCoins * 0.10);
          if (commission > 0) {
            refUser.balance += commission;
            refUser.referralEarnings += commission;
            refUser.totalEarned += commission;
          }
        }
      }
    }

    this.scheduleSave();
    return { user, appliedTaps: validTaps };
  }

  public buyUpgrade(telegramId: number, upgradeId: keyof UserUpgrades): { user: User; cost: number; newLevel: number } {
    const key = String(telegramId);
    const user = this.data.users[key];
    if (!user) throw new Error('Пользователь не найден');

    const def = UPGRADE_DEFINITIONS.find((u) => u.id === upgradeId);
    if (!def) throw new Error('Улучшение не найдено');

    const currentLevel = user.upgrades[upgradeId] || 0;
    if (currentLevel >= def.maxLevel) throw new Error('Достигнут максимальный уровень улучшения');

    const cost = this.calculateUpgradeCost(def, currentLevel);
    if (user.balance < cost) throw new Error('Недостаточно монет для покупки');

    user.balance -= cost;
    user.upgrades[upgradeId] = currentLevel + 1;

    this.recalculateUserStats(user);
    this.scheduleSave();

    return { user, cost, newLevel: user.upgrades[upgradeId] };
  }

  private recalculateUserStats(user: User) {
    let coinsPerTap = 1;
    let maxEnergy = 1000;
    let rechargeRate = 1;
    let passiveIncome = 0;

    for (const def of UPGRADE_DEFINITIONS) {
      const lvl = user.upgrades[def.id] || 0;
      if (lvl === 0) continue;

      if (def.bonusType === 'coinsPerTap') {
        coinsPerTap += lvl * def.baseBonus;
      } else if (def.bonusType === 'maxEnergy') {
        maxEnergy += lvl * def.baseBonus;
      } else if (def.bonusType === 'rechargeSpeed') {
        rechargeRate += lvl * def.baseBonus;
      } else if (def.bonusType === 'passiveIncomePerHour') {
        passiveIncome += lvl * def.baseBonus;
      }
    }

    user.coinsPerTap = coinsPerTap;
    user.maxEnergy = maxEnergy;
    user.energyRechargeRate = rechargeRate;
    user.passiveIncomePerHour = passiveIncome;
  }

  public claimTask(telegramId: number, taskId: string): { user: User; reward: number } {
    const key = String(telegramId);
    const user = this.data.users[key];
    if (!user) throw new Error('Пользователь не найден');

    if (user.completedTasks.includes(taskId)) {
      throw new Error('Задание уже выполнено');
    }

    const task = TASK_DEFINITIONS.find((t) => t.id === taskId);
    if (!task) throw new Error('Задание не существует');

    if (task.category === 'referral' && task.requiredCount) {
      if (user.referralCount < task.requiredCount) {
        throw new Error(`Необходимо пригласить минимум ${task.requiredCount} друзей (у вас: ${user.referralCount})`);
      }
    }

    user.completedTasks.push(taskId);
    user.balance += task.reward;
    user.totalEarned += task.reward;
    user.league = this.calculateLeague(user.totalEarned);

    this.scheduleSave();
    return { user, reward: task.reward };
  }

  public claimDailyStreak(telegramId: number): { user: User; reward: number; streakDay: number } {
    const key = String(telegramId);
    const user = this.data.users[key];
    if (!user) throw new Error('Пользователь не найден');

    const todayStr = new Date().toISOString().split('T')[0];
    if (user.lastStreakClaimDate === todayStr) {
      throw new Error('Вы уже забрали ежедневный бонус сегодня!');
    }

    if (user.lastStreakClaimDate) {
      const lastDate = new Date(user.lastStreakClaimDate);
      const today = new Date(todayStr);
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays > 1) {
        user.streakDay = 1;
      }
    }

    const currentRewardObj = STREAK_REWARDS.find((s) => s.day === user.streakDay) || STREAK_REWARDS[0];
    const reward = currentRewardObj.reward;

    user.balance += reward;
    user.totalEarned += reward;
    user.lastStreakClaimDate = todayStr;
    const currentDay = user.streakDay;

    user.streakDay = user.streakDay >= 7 ? 1 : user.streakDay + 1;
    user.league = this.calculateLeague(user.totalEarned);

    this.scheduleSave();
    return { user, reward, streakDay: currentDay };
  }

  public claimFortuneBox(telegramId: number): { user: User; reward: number } {
    const key = String(telegramId);
    const user = this.data.users[key];
    if (!user) throw new Error('Пользователь не найден');

    const now = Date.now();
    const cooldownMs = 4 * 3600 * 1000;
    if (now - user.lastBoxClaimAt < cooldownMs) {
      const waitMinutes = Math.ceil((cooldownMs - (now - user.lastBoxClaimAt)) / (60 * 1000));
      throw new Error(`Сундук удачи откроется через ${waitMinutes} мин.`);
    }

    const rewardsPool = [1500, 2500, 5000, 7500, 10000, 15000];
    const reward = rewardsPool[Math.floor(Math.random() * rewardsPool.length)];

    user.balance += reward;
    user.totalEarned += reward;
    user.lastBoxClaimAt = now;
    user.league = this.calculateLeague(user.totalEarned);

    this.scheduleSave();
    return { user, reward };
  }

  public registerReferral(telegramId: number, referrerId: number, username = '', firstName = ''): boolean {
    if (telegramId === referrerId) return false;
    const refKey = String(referrerId);
    const targetKey = String(telegramId);

    if (this.data.users[refKey] && !this.data.users[targetKey]) {
      this.getOrCreateUser(telegramId, username, firstName, referrerId);
      return true;
    }
    return false;
  }

  public getReferrals(telegramId: number): { referrals: Array<{ telegramId: number; username: string; firstName: string; totalEarned: number }>; totalEarned: number } {
    const list: Array<{ telegramId: number; username: string; firstName: string; totalEarned: number }> = [];
    let totalCommission = 0;

    for (const u of Object.values(this.data.users)) {
      if (u.referrerId === telegramId) {
        list.push({
          telegramId: u.telegramId,
          username: u.username,
          firstName: u.firstName,
          totalEarned: u.totalEarned
        });
      }
    }

    const currentUser = this.data.users[String(telegramId)];
    if (currentUser) {
      totalCommission = currentUser.referralEarnings;
    }

    return { referrals: list, totalEarned: totalCommission };
  }
}

export const db = new Database();
