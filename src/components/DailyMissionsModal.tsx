import React from 'react';
import { DailyMission } from '../types/game';
import { X, CheckCircle2, Target, Calendar, Gift, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface DailyMissionsModalProps {
  missions: DailyMission[];
  onClaimReward?: (missionId: string) => void;
  onClose: () => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  missions,
  onClaimReward,
  onClose,
}) => {
  const completedCount = missions.filter((m) => m.completed).length;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-gradient-to-b from-[#002244] via-[#002f5c] to-[#004282] border-4 border-emerald-400 rounded-3xl p-5 sm:p-7 max-w-lg w-full text-white shadow-2xl shadow-emerald-950/80 relative overflow-hidden flex flex-col gap-4">
        {/* Brilho decorativo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 h-24 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300">
              <Calendar size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                Missões Diárias
              </h2>
              <p className="text-xs text-emerald-200/80">
                Conclua os desafios de hoje e ganhe recompensas! ({completedCount}/{missions.length})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-500/20 transition-colors cursor-pointer border border-emerald-500/20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista de 3 missões diárias */}
        <div className="space-y-3 relative z-10 py-1">
          {missions.map((mission) => {
            const percent = Math.min(100, Math.round((mission.progress / mission.target) * 100));

            return (
              <div
                key={mission.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                  mission.completed
                    ? 'bg-emerald-950/50 border-emerald-400/80 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900/60 border-slate-700/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`p-1.5 rounded-lg border ${
                        mission.completed
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                          : 'bg-slate-800 text-sky-400 border-slate-700'
                      }`}
                    >
                      <Target size={16} />
                    </span>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-white tracking-wide">
                        {mission.title}
                      </h4>
                      <p className="text-xs text-slate-300">{mission.description}</p>
                    </div>
                  </div>

                  {mission.completed ? (
                    <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                      <CheckCircle2 size={13} /> Feito!
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-sky-300">
                      {mission.progress}/{mission.target}
                    </span>
                  )}
                </div>

                {/* Barra de Progresso */}
                <div className="w-full bg-slate-950/60 rounded-full h-2.5 border border-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      mission.completed
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-sky-500 to-indigo-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Recompensa */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1 text-amber-300 font-semibold">
                    <Gift size={13} /> Recompensa: {mission.reward}
                  </span>
                  <span>{percent}% completo</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
