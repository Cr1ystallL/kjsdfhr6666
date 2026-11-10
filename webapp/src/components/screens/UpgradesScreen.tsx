import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { UpgradeItem, UserUpgrades } from '../../types';
import { fetchUpgrades, buyUpgrade } from '../../api';
import { 
  Zap, 
  BatteryCharging, 
  Activity, 
  Cpu, 
  Coins, 
  Bot, 
  Server, 
  ShieldCheck, 
  Vault,
  TrendingUp,
  Check
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  BatteryCharging,
  Activity,
  Cpu,
  Coins,
  Bot,
  Server,
  ShieldCheck,
  Vault,
};

export const UpgradesScreen: React.FC = () => {
  const { user, triggerHaptic, updateUserDirectly } = useGame();
  const [upgrades, setUpgrades] = useState<UpgradeItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<'tap' | 'passive'>('tap');
  const [loading, setLoading] = useState<boolean>(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const loadList = async () => {
    if (!user) return;
    try {
      const list = await fetchUpgrades(user.telegramId);
      setUpgrades(list);
    } catch (err) {
      console.warn('Ошибка загрузки улучшений:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [user?.telegramId]);

  const handleBuy = async (upgrade: UpgradeItem) => {
    if (!user || user.balance < upgrade.nextCost || upgrade.isMaxLevel) {
      triggerHaptic('error');
      return;
    }

    setBuyingId(upgrade.id);
    try {
      const res = await buyUpgrade(user.telegramId, upgrade.id as keyof UserUpgrades);
      triggerHaptic('success');
      updateUserDirectly(res.user);
      await loadList();
    } catch (err) {
      triggerHaptic('error');
      alert((err as any).message || 'Не удалось купить улучшение');
    } finally {
      setBuyingId(null);
    }
  };

  const filteredUpgrades = upgrades.filter((u) => u.category === activeCategory);

  return (
    <div className="px-4 py-3 max-w-lg mx-auto pb-safe">
      {/* Заголовок раздела */}
      <div className="mb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          <span>Прокачка и Улучшения</span>
        </h2>
        <p className="text-xs text-zinc-400">
          Увеличивайте доход за каждое нажатие и развивайте автономный пассивный майнинг
        </p>
      </div>

      {/* Переключатель категорий: строгий матовый стиль без радуг */}
      <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-[#10141D] rounded-xl border border-white/5">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveCategory('tap');
          }}
          className={`min-h-[40px] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
            activeCategory === 'tap'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Кликер и Энергия
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveCategory('passive');
          }}
          className={`min-h-[40px] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
            activeCategory === 'passive'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Пассивный Майнинг
        </button>
      </div>

      {/* Список улучшений (единая плоская поверхность с тонкими линиями) */}
      <div className="border border-white/10 rounded-xl bg-[#10141D] overflow-hidden divide-y divide-white/5">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-400 animate-pulse">
            Загрузка улучшений...
          </div>
        ) : filteredUpgrades.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">
            Нет доступных улучшений
          </div>
        ) : (
          filteredUpgrades.map((upgrade) => {
            const Icon = ICON_MAP[upgrade.iconName] || Zap;
            const canAfford = user ? user.balance >= upgrade.nextCost : false;
            const isBusy = buyingId === upgrade.id;

            return (
              <div key={upgrade.id} className="p-3.5 flex items-center justify-between gap-3">
                {/* Иконка и описание */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">
                        {upgrade.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-amber-400 border border-white/5 font-semibold">
                        УР. {upgrade.currentLevel}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {upgrade.description}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400 mt-0.5 font-semibold">
                      +{upgrade.category === 'passive' ? `${upgrade.nextBonus.toLocaleString('ru-RU')} / ч` : `${upgrade.nextBonus} к показателю`}
                    </div>
                  </div>
                </div>

                {/* Кнопка покупки с тактильным эффектом */}
                <button
                  onClick={() => handleBuy(upgrade)}
                  disabled={upgrade.isMaxLevel || !canAfford || isBusy}
                  className={`arcade-btn min-w-[96px] min-h-[42px] px-3 py-1.5 rounded-lg flex flex-col items-center justify-center font-mono text-xs font-bold transition-all ${
                    upgrade.isMaxLevel
                      ? 'bg-zinc-800/40 text-zinc-400 border border-white/5 cursor-default'
                      : canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black border-amber-400/40 hover:from-amber-400 hover:to-amber-500'
                      : 'bg-[#181F2C] text-zinc-400 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  {upgrade.isMaxLevel ? (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Check className="w-3.5 h-3.5" /> МАКС
                    </span>
                  ) : (
                    <>
                      <span className="text-[10px] uppercase font-bold tracking-wider leading-none">
                        {isBusy ? '...' : 'КУПИТЬ'}
                      </span>
                      <span className="text-[11px] tabular-nums mt-0.5 leading-none">
                        {upgrade.nextCost.toLocaleString('ru-RU')} $
                      </span>
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
