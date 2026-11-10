import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { TaskItem } from '../../types';
import { fetchTasks, claimTask } from '../../api';
import { 
  CheckSquare, 
  Send, 
  Users, 
  UserPlus, 
  Award, 
  Flame, 
  Shield, 
  ExternalLink, 
  CheckCircle2 
} from 'lucide-react';

const TASK_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Send,
  Users,
  UserPlus,
  Award,
  Flame,
  Shield
};

export const TasksScreen: React.FC = () => {
  const { user, triggerHaptic, updateUserDirectly } = useGame();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openedTasks, setOpenedTasks] = useState<Record<string, boolean>>({});
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const loadList = async () => {
    if (!user) return;
    try {
      const list = await fetchTasks(user.telegramId);
      setTasks(list);
    } catch (err) {
      console.warn('Ошибка загрузки заданий:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [user?.telegramId]);

  const handleAction = async (task: TaskItem) => {
    if (task.isCompleted) return;

    // Если есть внешняя ссылка (соцсеть) и пользователь еще не нажимал "Перейти"
    if (task.actionUrl && !openedTasks[task.id]) {
      triggerHaptic('light');
      window.open(task.actionUrl, '_blank');
      setOpenedTasks((prev) => ({ ...prev, [task.id]: true }));
      return;
    }

    // Забираем награду
    if (!user) return;
    setClaimingId(task.id);
    try {
      const res = await claimTask(user.telegramId, task.id);
      triggerHaptic('success');
      updateUserDirectly(res.user);
      await loadList();
    } catch (err: any) {
      triggerHaptic('error');
      alert(err.message || 'Задание еще не выполнено');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="px-4 py-3 max-w-lg mx-auto pb-safe">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-amber-500" />
          <span>Задания и Награды</span>
        </h2>
        <p className="text-xs text-zinc-400">
          Выполняйте квесты сообщества, приглашайте друзей и получайте мгновенные награды в $MAG
        </p>
      </div>

      <div className="border border-white/10 rounded-xl bg-[#10141D] overflow-hidden divide-y divide-white/5">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-400 animate-pulse">
            Загрузка списка заданий...
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">
            Нет доступных заданий
          </div>
        ) : (
          tasks.map((task) => {
            const Icon = TASK_ICON_MAP[task.iconName] || CheckSquare;
            const isOpened = openedTasks[task.id];
            const isBusy = claimingId === task.id;

            return (
              <div key={task.id} className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    task.isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    {task.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">
                      {task.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {task.description}
                    </div>
                    <div className="text-[11px] font-mono text-amber-400 mt-0.5 font-bold tabular-nums">
                      +{task.reward.toLocaleString('ru-RU')} $MAG
                    </div>
                  </div>
                </div>

                {/* Кнопка действия */}
                <div>
                  {task.isCompleted ? (
                    <div className="min-w-[84px] text-center text-xs font-semibold text-emerald-400 py-1 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Готово</span>
                    </div>
                  ) : task.actionUrl && !isOpened ? (
                    <button
                      onClick={() => handleAction(task)}
                      className="arcade-btn min-w-[90px] min-h-[38px] px-3 py-1.5 rounded-lg bg-[#181F2C] border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-800"
                    >
                      <span>Открыть</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(task)}
                      disabled={isBusy}
                      className="arcade-btn min-w-[90px] min-h-[38px] px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center hover:from-amber-400 hover:to-amber-500"
                    >
                      {isBusy ? '...' : 'ПРОВЕРИТЬ'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
