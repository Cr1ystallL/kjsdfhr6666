import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { fetchReferrals } from '../../api';
import { 
  User, 
  Shield, 
  Wallet, 
  Share2, 
  Copy, 
  Users, 
  Check 
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { user, triggerHaptic, updateUserDirectly } = useGame();
  const [copied, setCopied] = useState<boolean>(false);
  const [walletInput, setWalletInput] = useState<string>('');
  const [isEditingWallet, setIsEditingWallet] = useState<boolean>(false);
  const [referralsList, setReferralsList] = useState<Array<{ telegramId: number; username: string; firstName: string; totalEarned: number }>>([]);

  useEffect(() => {
    if (user?.walletAddress) {
      setWalletInput(user.walletAddress);
    }
    if (user?.telegramId) {
      fetchReferrals(user.telegramId)
        .then((res) => {
          if (res?.referrals) setReferralsList(res.referrals);
        })
        .catch(() => {});
    }
  }, [user?.telegramId, user?.walletAddress]);

  if (!user) return null;

  const botUsername = 'macvcoin_bot';
  const refLink = `https://t.me/${botUsername}?start=ref_${user.telegramId}`;

  const handleCopyLink = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    triggerHaptic('light');
    const text = encodeURIComponent('Забирай 5 000 MacvCoin ($MACV) на старте! Майни монеты перед листингом крипты!');
    window.open(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${text}`, '_blank');
  };

  const handleSaveWallet = () => {
    if (!walletInput.trim()) return;
    triggerHaptic('success');
    updateUserDirectly({
      ...user,
      walletAddress: walletInput.trim()
    });
    setIsEditingWallet(false);
  };

  return (
    <div className="px-4 py-3 max-w-lg mx-auto pb-safe">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-amber-500" />
          <span>Профиль Игрока</span>
        </h2>
        <p className="text-xs text-zinc-400">
          Управление аккаунтом, реферальная сеть и привязка TON кошелька для аирдропа
        </p>
      </div>

      {/* Карточка пользователя */}
      <div className="border border-white/10 rounded-xl bg-[#10141D] p-4 mb-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-black text-lg text-black shadow-inner flex-shrink-0">
            {user.firstName?.charAt(0)?.toUpperCase() || 'M'}
          </div>
          <div className="min-w-0">
            <div className="text-base font-bold text-white truncate">
              {user.firstName || user.username}
            </div>
            <div className="text-xs text-zinc-400 font-mono">
              ID: {user.telegramId}
            </div>
          </div>
          <div className="ml-auto text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>{user.league}</span>
            </span>
          </div>
        </div>

        {/* Сводная статистика */}
        <div className="grid grid-cols-2 gap-2 pt-3">
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              ВСЕГО ДОБЫТО
            </div>
            <div className="text-sm font-mono font-bold text-white mt-0.5 tabular-nums">
              {Math.floor(user.totalEarned).toLocaleString('ru-RU')} $MACV
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              ДОХОД В ЧАС
            </div>
            <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5 tabular-nums">
              +{user.passiveIncomePerHour.toLocaleString('ru-RU')} / ч
            </div>
          </div>
        </div>
      </div>

      {/* Блок TON кошелька */}
      <div className="border border-white/10 rounded-xl bg-[#10141D] p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              TON Кошелек (Для Аирдропа $MACV)
            </span>
          </div>
          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold">
            Web3
          </span>
        </div>
        <p className="text-[11px] text-zinc-400 mb-3">
          Укажите ваш некостодиальный TON кошелек (Tonkeeper, Telegram Wallet). Сюда будут начислены монеты $MACV при листинге.
        </p>

        {isEditingWallet || !user.walletAddress ? (
          <div className="space-y-2">
            <input
              type="text"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              placeholder="UQ... или EQ... (Адрес вашего TON кошелька)"
              className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSaveWallet}
              className="arcade-btn w-full min-h-[38px] rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs uppercase tracking-wider"
            >
              СОХРАНИТЬ АДРЕС
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2.5 bg-[#0B0E14] border border-white/5 rounded-lg">
            <span className="text-xs font-mono text-cyan-300 truncate max-w-[200px]">
              {user.walletAddress}
            </span>
            <button
              onClick={() => setIsEditingWallet(true)}
              className="text-[11px] font-semibold text-zinc-400 hover:text-white underline ml-2"
            >
              Изменить
            </button>
          </div>
        )}
      </div>

      {/* Реферальная программа */}
      <div className="border border-white/10 rounded-xl bg-[#10141D] p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Реферальная Программа
            </span>
          </div>
          <span className="text-[11px] font-mono text-amber-400 font-bold">
            10% от дохода друзей
          </span>
        </div>

        <p className="text-[11px] text-zinc-400 mb-3">
          Приглашайте друзей по вашей уникальной ссылке. Получайте +5 000 $MACV сразу и 10% от каждого их тапа!
        </p>

        {/* Статистика рефералов */}
        <div className="grid grid-cols-2 gap-2 mb-3 p-2.5 bg-[#0B0E14] border border-white/5 rounded-lg">
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-400">ДРУЗЕЙ В КОМАНДЕ</div>
            <div className="text-base font-mono font-bold text-white tabular-nums">
              {user.referralCount}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-400">ЗАРАБОТАНО С ДРУЗЕЙ</div>
            <div className="text-base font-mono font-bold text-amber-400 tabular-nums">
              +{user.referralEarnings.toLocaleString('ru-RU')} $MACV
            </div>
          </div>
        </div>

        {/* Кнопки копирования и шеринга */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopyLink}
            className="arcade-btn min-h-[42px] px-3 py-2 rounded-lg bg-[#181F2C] border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-800"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
          </button>
          <button
            onClick={handleShareTelegram}
            className="arcade-btn min-h-[42px] px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:from-amber-400 hover:to-amber-500"
          >
            <Share2 className="w-4 h-4" />
            <span>Пригласить</span>
          </button>
        </div>

        {/* Список приглашенных друзей */}
        {referralsList.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="text-xs font-bold text-zinc-300 mb-2">Ваши друзья:</div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {referralsList.map((ref) => (
                <div key={ref.telegramId} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[#0B0E14] border border-white/5">
                  <span className="font-semibold text-zinc-200 truncate">{ref.firstName || ref.username}</span>
                  <span className="font-mono text-zinc-400 tabular-nums">Всего: {Math.floor(ref.totalEarned).toLocaleString('ru-RU')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
