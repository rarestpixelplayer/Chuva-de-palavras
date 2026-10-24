import React from 'react';
import { Achievement } from '../types/game';
import { X, Trophy, Award, CheckCircle, Lock } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface AchievementsModalProps {
  achievements: Achievement[];
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ achievements, onClose }) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const progressPercent = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-gradient-to-b from-[#002244] via-[#002f5c] to-[#004282] border-4 border-amber-400 rounded-3xl p-5 sm:p-7 max-w-xl w-full text-white shadow-2xl shadow-amber-950/80 relative overflow-hidden flex flex-col gap-4 max-h-[92vh]">
        {/* Brilho de fundo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-28 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300">
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                Conquistas
              </h2>
              <p className="text-xs text-amber-200/80">
                {unlockedCount} de {achievements.length} desbloqueadas ({progressPercent}%)
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

        {/* Barra geral de progresso */}
        <div className="w-full bg-slate-950/50 rounded-full h-3 border border-amber-400/30 overflow-hidden relative z-10">
          <div
            className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Lista de Conquistas */}
        <div className="space-y-2.5 overflow-y-auto max-h-[58vh] pr-1 relative z-10 no-scrollbar">
          {achievements.map((item) => {
            const isGold = item.tier === 'gold';
            const isSilver = item.tier === 'silver';

            return (
              <div
                key={item.id}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  item.unlocked
                    ? isGold
                      ? 'bg-amber-950/50 border-yellow-400/70 shadow-md shadow-amber-950/30'
                      : isSilver
                      ? 'bg-slate-900/60 border-slate-300/60 shadow-md'
                      : 'bg-amber-950/30 border-amber-600/50'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border font-black text-lg ${
                      item.unlocked
                        ? isGold
                          ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-slate-950 border-yellow-300'
                          : isSilver
                          ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 border-slate-100'
                          : 'bg-gradient-to-br from-amber-600 to-amber-800 text-white border-amber-400'
                        : 'bg-slate-800/80 text-slate-500 border-slate-700'
                    }`}
                  >
                    {item.unlocked ? (
                      isGold ? (
                        <Trophy size={20} />
                      ) : (
                        <Award size={20} />
                      )
                    ) : (
                      <Lock size={18} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white truncate">{item.title}</span>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm ${
                          isGold
                            ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30'
                            : isSilver
                            ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30'
                            : 'bg-amber-600/20 text-amber-300 border border-amber-600/30'
                        }`}
                      >
                        {item.tier}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 truncate">{item.description}</p>
                    {/* Barra de progresso da conquista */}
                    {!item.unlocked && item.maxProgress > 1 && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-28 bg-slate-900 rounded-full h-1.5 border border-slate-700 overflow-hidden">
                          <div
                            className="bg-amber-400 h-full rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((item.progress / item.maxProgress) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {item.progress}/{item.maxProgress}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {item.unlocked ? (
                    <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center">
                      <CheckCircle size={18} />
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-semibold px-2 py-1 rounded-lg bg-slate-900/60 border border-slate-800">
                      Bloqueado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
