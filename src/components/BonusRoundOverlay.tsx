import React from 'react';
import { Sparkles, Zap, Award } from 'lucide-react';

interface BonusRoundOverlayProps {
  showIntro: boolean;
  timeLeft: number;
  bonusScoreEarned: number;
  bonusWordsCount: number;
}

export const BonusRoundOverlay: React.FC<BonusRoundOverlayProps> = ({
  showIntro,
  timeLeft,
  bonusScoreEarned,
  bonusWordsCount,
}) => {
  if (showIntro) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm pointer-events-none animate-in fade-in duration-300">
        <div className="text-center p-8 max-w-md mx-4 bg-gradient-to-b from-amber-900/90 to-slate-900 border-2 border-amber-400 rounded-3xl shadow-2xl shadow-amber-500/30 scale-100 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-amber-400/20 border border-amber-300 rounded-2xl flex items-center justify-center text-amber-300 shadow-inner">
            <Sparkles size={36} className="animate-spin text-amber-300" style={{ animationDuration: '6s' }} />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-amber-300 tracking-wide mb-2 uppercase drop-shadow-md">
            Nível Bônus!
          </h2>

          <p className="text-sm sm:text-base text-amber-100/90 mb-5 leading-relaxed">
            Digite as palavras douradas rapidamente!
          </p>

          <div className="space-y-2 text-xs sm:text-sm text-amber-200/90 font-medium bg-black/40 p-4 rounded-xl border border-amber-500/30 text-left">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-400 shrink-0" />
              <span>Pontos multiplicados por <strong>2x</strong>!</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={16} className="text-amber-400 shrink-0" />
              <span>Zona segura: palavras no chão <strong>não tiram vida</strong>!</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400 shrink-0" />
              <span>Destrua o máximo antes do tempo acabar!</span>
            </div>
          </div>

          <div className="mt-5 text-amber-400 font-mono text-sm tracking-widest font-bold uppercase animate-pulse">
            Iniciando...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-16 right-4 sm:right-6 z-30 pointer-events-none flex flex-col items-end gap-1">
      <div className="bg-amber-500/90 text-slate-950 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 border border-amber-300">
        <Sparkles size={16} />
        <span>TEMPO RESTANTE: {timeLeft}s</span>
      </div>
      <div className="text-xs font-semibold text-amber-800 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md shadow-xs border border-amber-200">
        Acertos no Bônus: {bonusWordsCount} (+{bonusScoreEarned} pts)
      </div>
    </div>
  );
};
