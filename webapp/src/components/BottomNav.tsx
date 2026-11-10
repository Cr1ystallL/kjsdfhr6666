import React from 'react';
import { useGame } from '../context/GameContext';
import { ScreenTab } from '../types';
import {
  TrendingUp,
  CheckSquare,
  Gift,
  User,
  BookOpen
} from 'lucide-react';
import { BrandMark } from './BrandMark';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, triggerHaptic } = useGame();

  const handleTabSelect = (tab: ScreenTab) => {
    triggerHaptic('light');
    setActiveTab(tab);
  };

  const navItems: Array<{
    tab: ScreenTab;
    label: string;
    renderIcon: (isActive: boolean) => React.ReactNode;
  }> = [
    {
      tab: 'tap',
      label: 'Добыча',
      renderIcon: (isActive) => (
        <BrandMark
          variant={isActive ? 'gradient' : 'white'}
          size={22}
          className={isActive ? 'scale-110 transition-transform' : 'opacity-65'}
        />
      ),
    },
    {
      tab: 'upgrades',
      label: 'Прокачка',
      renderIcon: (isActive) => (
        <TrendingUp className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-amber-400' : 'stroke-[1.8]'}`} />
      ),
    },
    {
      tab: 'tasks',
      label: 'Задания',
      renderIcon: (isActive) => (
        <CheckSquare className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-amber-400' : 'stroke-[1.8]'}`} />
      ),
    },
    {
      tab: 'bonuses',
      label: 'Бонусы',
      renderIcon: (isActive) => (
        <Gift className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-amber-400' : 'stroke-[1.8]'}`} />
      ),
    },
    {
      tab: 'profile',
      label: 'Профиль',
      renderIcon: (isActive) => (
        <User className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-amber-400' : 'stroke-[1.8]'}`} />
      ),
    },
    {
      tab: 'about',
      label: 'О монете',
      renderIcon: (isActive) => (
        <BookOpen className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-amber-400' : 'stroke-[1.8]'}`} />
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#08090c]/95 backdrop-blur-md border-t border-white/[0.08] px-1.5 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-6 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => handleTabSelect(item.tab)}
              className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-transform duration-75 active:scale-95 ${
                isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-7 h-[2px] bg-amber-400 rounded-full" />
              )}
              <div className="h-5 flex items-center justify-center">
                {item.renderIcon(isActive)}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight leading-none ${
                  isActive ? 'font-bold text-amber-400' : 'font-medium text-zinc-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
