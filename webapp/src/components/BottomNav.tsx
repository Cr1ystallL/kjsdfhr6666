import React from 'react';
import { useGame } from '../context/GameContext';
import { ScreenTab } from '../types';
import { 
  Pickaxe, 
  TrendingUp, 
  CheckSquare, 
  Gift, 
  User, 
  HelpCircle 
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, triggerHaptic } = useGame();

  const navItems: Array<{ tab: ScreenTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { tab: 'tap', label: 'Майнинг', icon: Pickaxe },
    { tab: 'upgrades', label: 'Прокачка', icon: TrendingUp },
    { tab: 'tasks', label: 'Задания', icon: CheckSquare },
    { tab: 'bonuses', label: 'Бонусы', icon: Gift },
    { tab: 'profile', label: 'Профиль', icon: User },
    { tab: 'about', label: 'О токене', icon: HelpCircle },
  ];

  const handleTabSelect = (tab: ScreenTab) => {
    triggerHaptic('light');
    setActiveTab(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0E14]/95 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => handleTabSelect(item.tab)}
              className={`flex flex-col items-center justify-center min-w-[50px] min-h-[46px] rounded-lg transition-all duration-75 relative ${
                isActive 
                  ? 'text-amber-400' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {/* Верхняя тонкая полоска активного таба */}
              {isActive && (
                <span className="absolute top-0 w-6 h-0.5 bg-amber-400 rounded-full" />
              )}
              
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className={`text-[10px] mt-1 font-semibold tracking-tight ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
