import React from 'react';
import {
  BookOpen,
  Calendar,
  PieChart,
  TrendingUp
} from 'lucide-react';
import { BrandMark } from '../BrandMark';

export const AboutScreen: React.FC = () => {
  const roadmapSteps = [
    {
      phase: 'ЭТАП 1',
      title: 'Запуск добычи и формирование сообщества',
      status: 'active',
      date: 'ТЕКУЩИЙ ЭТАП',
      items: [
        'Запуск приложения добычи монет MacvCoin в Telegram',
        'Система улучшения оборудования и пассивного дохода в час',
        'Партнерская сеть с отчислением 10% и ежедневные награды',
        'Набор первых 100 000 активных участников сети',
      ],
    },
    {
      phase: 'ЭТАП 2',
      title: 'Подключение инфраструктуры сети TON',
      status: 'upcoming',
      date: 'СЛЕДУЮЩИЙ ЭТАП',
      items: [
        'Верификация привязанных кошельков TON',
        'Запуск хранилищ резерва с повышенным множителем добычи',
        'Соревнования лиг и таблица лидеров проекта',
        'Независимый аудит смарт-контракта токена $MACV',
      ],
    },
    {
      phase: 'ЭТАП 3',
      title: 'Выпуск токена и распределение монет',
      status: 'upcoming',
      date: 'ЧЕРЕЗ 1 МЕСЯЦ',
      items: [
        'Финальная фиксация балансов и мощности добычи игроков',
        'Выпуск крипто-токена $MACV в блокчейне TON',
        'Прямая отправка монет на привязанные кошельки игроков',
        'Открытие торгов на биржах STON.fi, DeDust и централизованных площадках',
      ],
    },
    {
      phase: 'ЭТАП 4',
      title: 'Развитие экосистемы $MACV',
      status: 'upcoming',
      date: '2027',
      items: [
        'Внедрение токена $MACV в партнерские игровые проекты',
        'Обратный выкуп и сжигание части комиссии сети',
        'Голосование держателей токена за развитие платформы',
      ],
    },
  ];

  const allocations = [
    { label: 'Сообщество и раздача игрокам', share: '50%' },
    { label: 'Резерв ликвидности для бирж', share: '20%' },
    { label: 'Развитие серверной инфраструктуры', share: '15%' },
    { label: 'Привлечение новых участников и награды', share: '15%' },
  ];

  return (
    <div className="px-4 py-3 max-w-lg mx-auto pb-safe space-y-4">
      <div>
        <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
          ДОКУМЕНТАЦИЯ ПРОЕКТА
        </div>
        <h2 className="font-heading text-lg font-extrabold text-white flex items-center gap-2 mt-0.5">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span>О Монете MacvCoin ($MACV)</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Экономика токена, этапы выхода на биржу и правила начисления монет участникам
        </p>
      </div>

      {/* Панель 1: Манифест и критерий распределения (единая плоская поверхность) */}
      <div className="bg-[#0b0c10] border border-white/[0.08] rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
        <div className="p-4 flex items-start gap-3">
          <BrandMark variant="gradient" size={38} className="mt-0.5" />
          <div className="min-w-0">
            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              КОНЦЕПЦИЯ MACVCOIN
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed mt-1">
              <strong className="text-white">MacvCoin ($MACV)</strong> — это этап честного первичного распределения будущего биржевого токена среди активных участников. Через месяц проект выпускает токен в блокчейне TON и открывает свободную торговлю на биржах.
            </p>
          </div>
        </div>

        <div className="p-4 flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-white">
              ГЛАВНЫЙ КРИТЕРИЙ ПОЛУЧЕНИЯ МОНЕТ
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mt-1">
              Итоговое количество крипто-токенов $MACV при распределении рассчитывается прежде всего из вашего показателя <strong className="text-emerald-400">«Доход в час»</strong>, уровня оборудования и активности в лиге.
            </p>
          </div>
        </div>
      </div>

      {/* Панель 2: Распределение эмиссии (единая плоская поверхность) */}
      <div className="bg-[#0b0c10] border border-white/[0.08] rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-white">
            Распределение Выпуска $MACV
          </span>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {allocations.map((item) => (
            <div
              key={item.label}
              className="px-4 py-3 flex items-center justify-between text-xs"
            >
              <span className="text-zinc-300 font-medium">{item.label}</span>
              <span className="font-mono font-extrabold text-amber-400 tabular-nums">
                {item.share}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Панель 3: План развития (единая плоская поверхность) */}
      <div className="bg-[#0b0c10] border border-white/[0.08] rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-white">
            План Развития Проекта
          </span>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {roadmapSteps.map((step) => {
            const isActive = step.status === 'active';

            return (
              <div key={step.phase} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-mono font-extrabold uppercase tracking-wider ${
                      isActive ? 'text-amber-400' : 'text-zinc-400'
                    }`}
                  >
                    {step.phase} {isActive ? '• АКТИВЕН' : ''}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 tabular-nums">
                    {step.date}
                  </span>
                </div>

                <div className="text-sm font-bold text-white mb-2">
                  {step.title}
                </div>

                <ul className="space-y-1">
                  {step.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-zinc-400 flex items-start gap-2"
                    >
                      <span className="text-amber-400 font-mono text-xs leading-none mt-0.5">
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
