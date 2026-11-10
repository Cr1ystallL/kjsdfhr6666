import React from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  Calendar, 
  PieChart, 
  TrendingUp 
} from 'lucide-react';

export const AboutScreen: React.FC = () => {
  const roadmapSteps = [
    {
      phase: 'ФАЗА 1',
      title: 'Майнинг и Рост Сообщества',
      status: 'active',
      date: 'Ноябрь 2026 (Текущий этап)',
      items: [
        'Запуск Telegram Mini App тапалки MacvCoin',
        'Внедрение механики прокачки и пассивного дохода',
        'Реферальная программа и система ежедневных наград',
        'Набор первых 100 000 активных пользователей'
      ]
    },
    {
      phase: 'ФАЗА 2',
      title: 'Web3 Инфраструктура и TON',
      status: 'upcoming',
      date: 'Декабрь 2026',
      items: [
        'Интеграция Web3-кошельков TON Connect',
        'Стейкинг пулы с повышенным множителем',
        'PvP-турниры майнеров и лидерборд',
        'Аудит смарт-контракта будущего токена $MACV'
      ]
    },
    {
      phase: 'ФАЗА 3',
      title: 'TGE и Масштабный Airdrop',
      status: 'upcoming',
      date: 'Январь 2027 (Через 1 месяц)',
      items: [
        'Финальный снапшот балансов игроков',
        'Конвертация накоплений $MACV в полноценный CryptoCoin',
        'Раздача токенов на привязанные TON кошельки',
        'Листинг токена на DEX (STON.fi, DeDust) и CEX'
      ]
    },
    {
      phase: 'ФАЗА 4',
      title: 'CryptoCoin Экосистема',
      status: 'upcoming',
      date: '2027',
      items: [
        'Запуск децентрализованных утилит токена',
        'Листинг на Tier-1 биржах',
        'Интеграция платежного шлюза для партнерских сервисов',
        'Запуск DAO голосования сообщества'
      ]
    }
  ];

  return (
    <div className="px-4 py-3 max-w-lg mx-auto pb-safe">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-500" />
          <span>О Токене MacvCoin ($MACV)</span>
        </h2>
        <p className="text-xs text-zinc-400">
          Стратегия развития, переход в CryptoCoin и правила распределения будущего аирдропа
        </p>
      </div>

      {/* Информационный манифест */}
      <div className="border border-white/10 rounded-xl bg-[#10141D] p-4 mb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Концепция Проекта</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed mb-3">
          <strong className="text-white">MacvCoin</strong> создан как игровая фаза для честного распределения токенов среди реального активного сообщества. 
          Через месяц проект проходит процедуру <strong className="text-amber-400">TGE (Token Generation Event)</strong> и выходит на децентрализованные биржи блокчейна TON в виде полноценного ликвидного <strong className="text-white">CryptoCoin ($MACV)</strong>.
        </p>
        <div className="p-3 bg-[#0B0E14] border border-white/5 rounded-lg text-xs">
          <div className="font-bold text-white mb-1 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Главный критерий аирдропа:</span>
          </div>
          <div className="text-zinc-400 leading-normal">
            Объем ваших токенов на раздаче будет определяться прежде всего вашим <strong className="text-emerald-400">«Доходом в час»</strong> и уровнем прокачки карточек, а не просто кликами!
          </div>
        </div>
      </div>

      {/* Токеномика проекта */}
      <div className="border border-white/10 rounded-xl bg-[#10141D] p-4 mb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider mb-3 pb-2 border-b border-white/5">
          <PieChart className="w-4 h-4 text-amber-400" />
          <span>Токеномика MacvCoin ($MACV)</span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="text-zinc-300">Сообщество и Airdrop игрокам</span>
            </div>
            <span className="font-mono font-bold text-white tabular-nums">50%</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-zinc-300">Пул ликвидности для бирж (DEX)</span>
            </div>
            <span className="font-mono font-bold text-white tabular-nums">20%</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="text-zinc-300">Развитие экосистемы и серверов</span>
            </div>
            <span className="font-mono font-bold text-white tabular-nums">15%</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              <span className="text-zinc-300">Маркетинг и партнерские квесты</span>
            </div>
            <span className="font-mono font-bold text-white tabular-nums">15%</span>
          </div>
        </div>
      </div>

      {/* Дорожная карта */}
      <div className="border border-white/10 rounded-xl bg-[#10141D] p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider mb-3 pb-2 border-b border-white/5">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Дорожная Карта (Roadmap)</span>
        </div>

        <div className="space-y-4">
          {roadmapSteps.map((step) => {
            const isActive = step.status === 'active';

            return (
              <div key={step.phase} className="relative pl-4 border-l-2 border-white/10">
                <div className={`absolute -left-[5px] top-0 w-2 h-2 rounded-full ${
                  isActive ? 'bg-amber-400 ring-4 ring-amber-500/20' : 'bg-zinc-600'
                }`} />

                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-zinc-400'
                  }`}>
                    {step.phase}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {step.date}
                  </span>
                </div>

                <div className="text-sm font-bold text-white mb-1.5">
                  {step.title}
                </div>

                <ul className="space-y-1">
                  {step.items.map((item, idx) => (
                    <li key={idx} className="text-xs text-zinc-400 flex items-start gap-1.5">
                      <span className="text-amber-500 text-[10px] mt-0.5">•</span>
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
