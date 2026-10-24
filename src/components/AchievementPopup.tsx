import React, { useEffect } from 'react';
import { Achievement } from '../types/game';
import { Trophy, Award } from 'lucide-react';

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement, onClose }) => {
  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  if (!achievement) return null;

  const tierColors = {
    bronze: 'border-amber-600 bg-amber-950/90 text-amber-200 shadow-amber-900/60',
    silver: 'border-slate-300 bg-slate-900/95 text-slate-100 shadow-slate-700/60',
    gold: 'border-yellow-400 bg-gradient-to-r from-yellow-950 via-amber-900 to-yellow-950 text-yellow-200 shadow-yellow-500/50',
  };

  const badgeColors = {
    bronze: 'bg-amber-600 text-amber-950',
    silver: 'bg-slate-300 text-slate-950',
    gold: 'bg-yellow-400 text-yellow-950 animate-bounce',
  };

  return (
    <div
      onClick={onClose}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 cursor-pointer animate-in fade-in slide-in-from-top-6 duration-300 pointer-events-auto"
    >
      <div
        className={`relative overflow-hidden flex items-center gap-3.5 px-5 py-3 rounded-2xl border-2 shadow-2xl backdrop-blur-md max-w-sm sm:max-w-md ${
          tierColors[achievement.tier]
        }`}
      >
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl shadow-md shrink-0 ${
            badgeColors[achievement.tier]
          }`}
        >
          {achievement.tier === 'gold' ? <Trophy size={24} /> : <Award size={24} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-widest px-1.5 py-0.2 rounded-sm bg-white/20">
              Conquista Desbloqueada!
            </span>
            <span className="text-[10px] font-bold uppercase opacity-80">
              {achievement.tier}
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-black text-white truncate drop-shadow-xs">
            {achievement.title}
          </h4>
          <p className="text-xs opacity-90 truncate">{achievement.description}</p>
        </div>

        {/* Barra de contagem regressiva de 5 segundos */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
          <div
            className="h-full bg-white/80 transition-all ease-linear"
            style={{
              animation: 'shrinkWidth 5s linear forwards',
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
