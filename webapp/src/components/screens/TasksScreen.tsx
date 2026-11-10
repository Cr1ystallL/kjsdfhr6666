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
  Shield,
};

export const TasksScreen: React.FC = () => {
  const { user, triggerHaptic, updateUserDirectly } = useGame();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openedTasks, setOpenedTasks] = useState<Record<string, boolean>>({});
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
    setStatusMessage(null);

    if (task.actionUrl && !openedTasks[task.id]) {
      triggerHaptic('light');
      window.open(task.actionUrl, '_blank');
      setOpenedTasks((prev) => ({ ...prev, [task.id]: true }));
      return;
    }

    if (!user) return;
    setClaimingId(task.id);
    try {
      const res = await claimTask(user.telegramId, task.id);
      triggerHaptic('success');
      updateUserDirectly(res.user);
      await loadList();
    } catch (err: any) {
      triggerHaptic('error');
      setStatusMessage(err?.message || 'Условия задания еще не выполнены');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="px-4 py-3 max-w-lg mx-auto pb-safe">
      <div className="mb-3.5">
        <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
          ПОРУЧЕНИЯ И НАГРАДЫ
        </div>
        <h2 className="font-heading text-lg font-extrabold text-white flex items-center gap-2 mt-0.5">
          <CheckSquare className="w-5 h-5 text-amber-400" />
          <span>Задания Сообщества</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Выполняйте поручения, приглашайте участников и получайте мгновенные выплаты в $MACV
        </p>
      </div>

      {statusMessage && (
        <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-[#0b0c10] border border-amber-500/40 text-xs text-amber-300 font-medium">
          {statusMessage}
        </div>
      )}

      {/* Единая плоская панель без вложенных контейнеров */}
      <div className="bg-[#0b0c10] border border-white/[0.08] rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono uppercase tracking-wider text-zinc-400">
            Загрузка поручений...
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
                <div className="flex items-start gap-3 min-w-0">
                  {task.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Icon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">
                      {task.title}
                    </div>
                    <div className="text-xs text-zinc-400 truncate mt-0.5">
                      {task.description}
                    </div>
                    <div className="text-xs font-mono font-bold text-amber-400 tabular-nums mt-1">
                      +{task.reward.toLocaleString('ru-RU')} $MACV
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {task.isCompleted ? (
                    <span className="min-w-[96px] min-h-[44px] px-3 flex items-center justify-center gap-1.5 text-xs font-mono font-bold uppercase text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Получено</span>
                    </span>
                  ) : task.actionUrl && !isOpened ? (
                    <button
                      onClick={() => handleAction(task)}
                      className="arcade-btn-dark min-w-[100px] min-h-[44px] px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <span>Перейти</span>
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(task)}
                      disabled={isBusy}
                      className="arcade-btn-gold min-w-[100px] min-h-[44px] px-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center"
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
