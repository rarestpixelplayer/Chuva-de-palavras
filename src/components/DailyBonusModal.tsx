import React, { useState } from 'react';
import { X, Gift, Sparkles, Check, Sun, Award } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface DailyBonusModalProps {
  currentDay: number; // 1 a 7
  hasClaimedToday: boolean;
  onClaim: (day: number) => void;
  onClose: () => void;
}

interface DayReward {
  day: number;
  label: string;
  coins: number;
  isSpecialCosmetic?: boolean;
  cosmeticName?: string;
  icon: string;
}

const REWARDS: DayReward[] = [
  { day: 1, label: 'Dia 1', coins: 100, icon: '🪙' },
  { day: 2, label: 'Dia 2', coins: 150, icon: '🪙' },
  { day: 3, label: 'Dia 3', coins: 200, icon: '💎' },
  { day: 4, label: 'Dia 4', coins: 250, icon: '🪙' },
  { day: 5, label: 'Dia 5', coins: 350, icon: '💎' },
  { day: 6, label: 'Dia 6', coins: 500, icon: '👑' },
  {
    day: 7,
    label: 'Dia 7 (ÉPICO)',
    coins: 1000,
    isSpecialCosmetic: true,
    cosmeticName: 'Canhão Solar Radiante',
    icon: '☀️',
  },
];

export const DailyBonusModal: React.FC<DailyBonusModalProps> = ({
  currentDay,
  hasClaimedToday,
  onClaim,
  onClose,
}) => {
  const [celebrating, setCelebrating] = useState<boolean>(false);
  const activeDayReward = REWARDS.find((r) => r.day === currentDay) || REWARDS[0];

  const handleClaimClick = () => {
    if (hasClaimedToday) return;
    soundManager.playDailyMissionComplete();
    setCelebrating(true);
    onClaim(currentDay);
    setTimeout(() => {
      setCelebrating(false);
    }, 2400);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-gradient-to-b from-[#1b0a2a] via-[#2a1240] to-[#0f172a] border-4 border-amber-400 rounded-3xl p-5 sm:p-7 max-w-lg w-full text-white shadow-2xl shadow-amber-950/90 relative overflow-hidden flex flex-col gap-4">
        {/* Brilho decorativo cósmico */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-400/25 rounded-full blur-2xl pointer-events-none" />

        {/* Efeito de Confetes / Estrelas comemorativas ao resgatar */}
        {celebrating && (
          <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-amber-500/15 animate-pulse" />
            <div className="text-center animate-in zoom-in-75 duration-300">
              <span className="text-6xl animate-bounce block mb-2">🎉</span>
              <div className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-md uppercase tracking-wider">
                BÔNUS RESGATADO COM SUCESSO!
              </div>
              <p className="text-sm text-yellow-100 font-bold mt-1">
                +{activeDayReward.coins} Moedas adicionadas à sua conta!
              </p>
            </div>
          </div>
        )}

        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl text-white shadow-md shadow-orange-500/40">
              <Gift size={24} className="animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase flex items-center gap-2">
                <span>Bônus Diário</span>
                <span className="text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                  7 DIAS
                </span>
              </h2>
              <p className="text-xs text-amber-200/80">
                Acesse todos os dias para recompensas crescentes e skins exclusivas!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-amber-300 hover:text-white hover:bg-amber-500/20 transition-colors cursor-pointer border border-amber-500/20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Grid dos 7 Dias de Recompensa */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 relative z-10 pt-1">
          {REWARDS.map((rew) => {
            const isPast = rew.day < currentDay || (rew.day === currentDay && hasClaimedToday);
            const isToday = rew.day === currentDay && !hasClaimedToday;
            const isFuture = rew.day > currentDay;

            return (
              <div
                key={rew.day}
                className={`p-2.5 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all min-h-[92px] sm:min-h-[110px] relative ${
                  rew.day === 7 ? 'col-span-4 sm:col-span-1 border-amber-300 bg-gradient-to-b from-amber-950/70 to-yellow-900/60' : ''
                } ${
                  isToday
                    ? 'border-amber-400 bg-amber-950/60 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/30 scale-105'
                    : isPast
                    ? 'border-emerald-600/70 bg-emerald-950/40 text-emerald-200'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400'
                }`}
              >
                {/* Indicador de dia */}
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300/90">
                  {rew.label}
                </span>

                {/* Ícone */}
                <span className="text-2xl sm:text-3xl my-1">{rew.icon}</span>

                {/* Recompensa */}
                <div className="text-[11px] font-black text-white">
                  {rew.coins}
                  <span className="text-[9px] text-amber-300 ml-0.5">🪙</span>
                </div>

                {/* Badge de status */}
                {isPast ? (
                  <span className="mt-1 text-[9px] font-black text-emerald-400 flex items-center gap-0.5">
                    <Check size={11} strokeWidth={3} /> Salvo
                  </span>
                ) : isToday ? (
                  <span className="mt-1 text-[9px] font-black text-amber-300 animate-pulse bg-amber-500/20 px-1 rounded-sm">
                    Hoje!
                  </span>
                ) : (
                  <span className="mt-1 text-[9px] text-slate-500">Bloqueado</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Destaque do Canhão Solar no Dia 7 */}
        <div className="p-3 bg-gradient-to-r from-amber-950/50 via-yellow-900/30 to-slate-950/60 rounded-2xl border border-amber-400/40 flex items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 font-bold shrink-0">
              <Sun size={20} className="text-amber-400 animate-spin" />
            </div>
            <div>
              <div className="font-bold text-amber-200">Recompensa Máxima: Canhão Solar Radiante</div>
              <div className="text-[11px] text-slate-300">Complete 7 dias consecutivos para desbloquear esta skin cosmética lendária!</div>
            </div>
          </div>
        </div>

        {/* Botão de Resgatar / Status */}
        <div className="pt-2 relative z-10">
          {hasClaimedToday ? (
            <div className="w-full py-3.5 px-4 rounded-xl font-bold text-center text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center gap-2 text-sm shadow-md">
              <Check size={18} className="text-emerald-400" />
              <span>Você já resgatou seu bônus diário de hoje! Volte amanhã para mais.</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleClaimClick}
              disabled={celebrating}
              className="w-full py-4 px-6 rounded-2xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 active:scale-98 transition-all shadow-xl shadow-amber-500/40 uppercase tracking-widest text-base sm:text-lg flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Sparkles size={22} className="text-slate-950" />
              <span>Resgatar Recompensa do Dia {currentDay}!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
