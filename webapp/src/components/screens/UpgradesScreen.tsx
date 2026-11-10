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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
    setStatusMessage(null);
    try {
      const res = await buyUpgrade(user.telegramId, upgrade.id as keyof UserUpgrades);
      triggerHaptic('success');
      updateUserDirectly(res.user);
      await loadList();
    } catch (err: any) {
      triggerHaptic('error');
      setStatusMessage(err?.message || 'Не удалось приобрести улучшение');
    } finally {
      setBuyingId(null);
    }
  };

  const filteredUpgrades = upgrades.filter((u) => u.category === activeCategory);

  return (
    <div className="px-4 py-3 max-w-lg mx-auto pb-safe">
      <div className="mb-3">
        <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
          МОДЕРНИЗАЦИЯ ОБОРУДОВАНИЯ
        </div>
        <h2 className="font-heading text-lg font-extrabold text-white flex items-center gap-2 mt-0.5">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <span>Прокачка и Улучшения</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Повышайте мощность нажатия и развивайте автономную добычу в час
        </p>
      </div>

      {/* Тактильные кнопки переключения разделов */}
      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveCategory('tap');
          }}
          className={`min-h-[44px] rounded-xl text-xs font-extrabold uppercase tracking-wider ${
            activeCategory === 'tap' ? 'arcade-btn-gold' : 'arcade-btn-dark text-zinc-300'
          }`}
        >
          Сила и Энергия
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveCategory('passive');
          }}
          className={`min-h-[44px] rounded-xl text-xs font-extrabold uppercase tracking-wider ${
            activeCategory === 'passive' ? 'arcade-btn-gold' : 'arcade-btn-dark text-zinc-300'
          }`}
        >
          Доход в Час
        </button>
      </div>

      {statusMessage && (
        <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-[#0b0c10] border border-amber-500/40 text-xs text-amber-300 font-medium">
          {statusMessage}
        </div>
      )}

      {/* Единая плоская панель улучшений с разделением только тонкими линиями */}
      <div className="bg-[#0b0c10] border border-white/[0.08] rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono uppercase tracking-wider text-zinc-400">
            Загрузка оборудования...
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
                <div className="flex items-start gap-3 min-w-0">
                  <Icon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-white truncate">
                        {upgrade.title}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 shrink-0">
                        УР. {upgrade.currentLevel}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 truncate mt-0.5">
                      {upgrade.description}
                    </div>
                    <div className="text-xs font-mono font-bold text-emerald-400 tabular-nums mt-1">
                      +{upgrade.category === 'passive'
                        ? `${upgrade.nextBonus.toLocaleString('ru-RU')} $MACV / ч`
                        : `${upgrade.nextBonus} к показателю`}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(upgrade)}
                  disabled={upgrade.isMaxLevel || !canAfford || isBusy}
                  className={`min-w-[104px] min-h-[44px] px-3 py-1.5 rounded-xl flex flex-col items-center justify-center font-mono shrink-0 ${
                    upgrade.isMaxLevel
                      ? 'arcade-btn-dark opacity-50 cursor-default'
                      : canAfford
                      ? 'arcade-btn-gold'
                      : 'arcade-btn-dark opacity-55 cursor-not-allowed'
                  }`}
                >
                  {upgrade.isMaxLevel ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> ПРЕДЕЛ
                    </span>
                  ) : (
                    <>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider leading-none">
                        {isBusy ? '...' : 'УЛУЧШИТЬ'}
                      </span>
                      <span className="text-xs font-bold tabular-nums mt-1 leading-none">
                        {upgrade.nextCost.toLocaleString('ru-RU')}
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
