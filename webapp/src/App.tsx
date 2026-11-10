import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OfflineRewardModal } from './components/OfflineRewardModal';
import { TapScreen } from './components/screens/TapScreen';
import { UpgradesScreen } from './components/screens/UpgradesScreen';
import { TasksScreen } from './components/screens/TasksScreen';
import { BonusesScreen } from './components/screens/BonusesScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { AboutScreen } from './components/screens/AboutScreen';

const MainContent: React.FC = () => {
  const { activeTab } = useGame();

  return (
    <div className="min-h-screen bg-[#0B0E14] text-zinc-100 flex flex-col justify-between">
      <div>
        <Header />
        <main className="w-full">
          {activeTab === 'tap' && <TapScreen />}
          {activeTab === 'upgrades' && <UpgradesScreen />}
          {activeTab === 'tasks' && <TasksScreen />}
          {activeTab === 'bonuses' && <BonusesScreen />}
          {activeTab === 'profile' && <ProfileScreen />}
          {activeTab === 'about' && <AboutScreen />}
        </main>
      </div>

      <OfflineRewardModal />
      <BottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <GameProvider>
      <MainContent />
    </GameProvider>
  );
};

export default App;
