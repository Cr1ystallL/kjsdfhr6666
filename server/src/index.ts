import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import {
  db,
  UPGRADE_DEFINITIONS,
  TASK_DEFINITIONS,
  STREAK_REWARDS
} from './db.js';

dotenv.config();

const app = express();
const apiRouter = express.Router();
const PORT = process.env.PORT || 4100;
const DEPLOY_SECRET = process.env.DEPLOY_SECRET || 'macvcoin_secret_deploy_token_123';

app.use(cors({ origin: '*' }));
app.use(express.json());

// 1. Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString(), service: 'MacvCoin API' });
});

// 2. Синхронизация профиля и начисление оффлайн-дохода
apiRouter.post('/user/sync', (req: Request, res: Response) => {
  try {
    const { telegramId, username, firstName, referrerId } = req.body;
    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId обязателен' });
    }

    const { user, offlineEarned } = db.getOrCreateUser(
      Number(telegramId),
      username,
      firstName,
      referrerId ? Number(referrerId) : null
    );

    res.json({
      success: true,
      user,
      offlineEarned
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Ошибка синхронизации пользователя' });
  }
});

// 3. Синхронизация кликов/тапов
apiRouter.post('/user/tap', (req: Request, res: Response) => {
  try {
    const { telegramId, taps } = req.body;
    if (!telegramId || typeof taps !== 'number') {
      return res.status(400).json({ error: 'telegramId и число taps обязательны' });
    }

    const { user, appliedTaps } = db.syncTaps(Number(telegramId), taps);
    res.json({
      success: true,
      user,
      appliedTaps
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Ошибка обработки кликов' });
  }
});

// 4. Список улучшений с динамической ценой
apiRouter.get('/upgrades/list', (req: Request, res: Response) => {
  try {
    const telegramId = Number(req.query.telegramId);
    let userUpgrades: any = {};
    if (telegramId) {
      const { user } = db.getOrCreateUser(telegramId);
      userUpgrades = user.upgrades;
    }

    const list = UPGRADE_DEFINITIONS.map((def) => {
      const currentLevel = userUpgrades[def.id] || 0;
      const nextCost = currentLevel < def.maxLevel ? db.calculateUpgradeCost(def, currentLevel) : 0;
      const currentBonus = currentLevel * def.baseBonus;
      const nextBonus = (currentLevel + 1) * def.baseBonus;

      return {
        ...def,
        currentLevel,
        nextCost,
        currentBonus,
        nextBonus,
        isMaxLevel: currentLevel >= def.maxLevel
      };
    });

    res.json({ success: true, upgrades: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Ошибка загрузки улучшений' });
  }
});

// 5. Покупка улучшения
apiRouter.post('/upgrades/buy', (req: Request, res: Response) => {
  try {
    const { telegramId, upgradeId } = req.body;
    if (!telegramId || !upgradeId) {
      return res.status(400).json({ error: 'telegramId и upgradeId обязательны' });
    }

    const result = db.buyUpgrade(Number(telegramId), upgradeId);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Ошибка покупки улучшения' });
  }
});

// 6. Список заданий
apiRouter.get('/tasks/list', (req: Request, res: Response) => {
  try {
    const telegramId = Number(req.query.telegramId);
    let completedTasks: string[] = [];
    let referralCount = 0;

    if (telegramId) {
      const { user } = db.getOrCreateUser(telegramId);
      completedTasks = user.completedTasks;
      referralCount = user.referralCount;
    }

    const tasks = TASK_DEFINITIONS.map((task) => {
      const isCompleted = completedTasks.includes(task.id);
      let canClaim = !isCompleted;

      if (task.category === 'referral' && task.requiredCount) {
        canClaim = !isCompleted && referralCount >= task.requiredCount;
      }

      return {
        ...task,
        isCompleted,
        canClaim,
        currentProgress: task.requiredCount ? Math.min(referralCount, task.requiredCount) : (isCompleted ? 1 : 0)
      };
    });

    res.json({ success: true, tasks });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Ошибка получения заданий' });
  }
});

// 7. Получение награды за задание
apiRouter.post('/tasks/claim', (req: Request, res: Response) => {
  try {
    const { telegramId, taskId } = req.body;
    if (!telegramId || !taskId) {
      return res.status(400).json({ error: 'telegramId и taskId обязательны' });
    }

    const result = db.claimTask(Number(telegramId), taskId);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Ошибка получения награды за задание' });
  }
});

// 8. Состояние ежедневных бонусов
apiRouter.get('/bonuses/streak', (req: Request, res: Response) => {
  try {
    const telegramId = Number(req.query.telegramId);
    if (!telegramId) return res.status(400).json({ error: 'telegramId обязателен' });

    const { user } = db.getOrCreateUser(telegramId);
    const todayStr = new Date().toISOString().split('T')[0];
    const isClaimedToday = user.lastStreakClaimDate === todayStr;

    const now = Date.now();
    const cooldownMs = 4 * 3600 * 1000;
    const boxCooldownLeft = Math.max(0, cooldownMs - (now - user.lastBoxClaimAt));

    res.json({
      success: true,
      streakDay: user.streakDay,
      isClaimedToday,
      rewards: STREAK_REWARDS,
      boxAvailable: boxCooldownLeft === 0,
      boxCooldownMs: boxCooldownLeft
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Ошибка получения бонусов' });
  }
});

// 9. Забрать ежедневный стрик
apiRouter.post('/bonuses/claim-streak', (req: Request, res: Response) => {
  try {
    const { telegramId } = req.body;
    if (!telegramId) return res.status(400).json({ error: 'telegramId обязателен' });

    const result = db.claimDailyStreak(Number(telegramId));
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Ошибка получения ежедневного стрика' });
  }
});

// 10. Открыть сундук удачи
apiRouter.post('/bonuses/claim-box', (req: Request, res: Response) => {
  try {
    const { telegramId } = req.body;
    if (!telegramId) return res.status(400).json({ error: 'telegramId обязателен' });

    const result = db.claimFortuneBox(Number(telegramId));
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Ошибка открытия сундука' });
  }
});

// 11. Регистрация реферала (вызывается ботом)
apiRouter.post('/referrals/register', (req: Request, res: Response) => {
  try {
    const { telegramId, referrerId, username, firstName } = req.body;
    if (!telegramId || !referrerId) {
      return res.status(400).json({ error: 'telegramId и referrerId обязательны' });
    }

    const registered = db.registerReferral(Number(telegramId), Number(referrerId), username, firstName);
    res.json({ success: true, registered });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Список рефералов пользователя
apiRouter.get('/referrals/list', (req: Request, res: Response) => {
  try {
    const telegramId = Number(req.query.telegramId);
    if (!telegramId) return res.status(400).json({ error: 'telegramId обязателен' });

    const result = db.getReferrals(telegramId);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Авто-деплой Webhook
apiRouter.post('/webhook/deploy', (req: Request, res: Response) => {
  const token = req.headers['x-deploy-token'] || req.query.token;
  if (token !== DEPLOY_SECRET) {
    return res.status(403).json({ error: 'Неверный токен деплоя' });
  }

  const deployScript = path.resolve(process.cwd(), '../deploy.sh');
  console.log(`[Deploy Webhook] Получен запрос на авто-деплой MacvCoin. Выполняем ${deployScript}...`);

  exec(`bash "${deployScript}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('[Deploy Webhook Error]', error);
      return;
    }
    console.log('[Deploy Webhook Success]', stdout);
  });

  res.json({ success: true, message: 'Деплой запущен в фоновом режиме!' });
});

// Подключение API по всем префиксам (/api, /coin/api, /coin-api)
app.use('/api', apiRouter);
app.use('/coin/api', apiRouter);
app.use('/coin-api', apiRouter);

// Раздача собранного фронтенда MacvCoin (webapp/dist) без участия интерфейса казино
const candidateDist1 = path.resolve(process.cwd(), '../webapp/dist');
const candidateDist2 = path.resolve(process.cwd(), 'webapp/dist');
const webappDistPath = fs.existsSync(candidateDist1) ? candidateDist1 : candidateDist2;

app.use('/coin', express.static(webappDistPath, { index: false }));
app.use('/', express.static(webappDistPath, { index: false }));

const serveSpaIndex = (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(webappDistPath, 'index.html'));
};

app.get('/coin', serveSpaIndex);
app.get('/coin/*', serveSpaIndex);
app.get('*', serveSpaIndex);

app.listen(PORT, () => {
  console.log(`⚡ [MacvCoin Server] Запущен на порту ${PORT} (dist: ${webappDistPath})`);
});
