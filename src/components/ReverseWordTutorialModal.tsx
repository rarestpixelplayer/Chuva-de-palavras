import React from 'react';
import { Sparkles, ArrowLeft, Check, Zap } from 'lucide-react';

interface ReverseWordTutorialModalProps {
  onClose: () => void;
}

export const ReverseWordTutorialModal: React.FC<ReverseWordTutorialModalProps> = ({ onClose }) => {
  // Permite pressionar Enter ou Espaço para continuar de forma ágil
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 border-2 border-sky-400 rounded-3xl p-6 sm:p-7 shadow-2xl text-white text-center relative overflow-hidden">
        {/* Ícone de novidade */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-sky-300 shadow-inner">
          <Sparkles size={32} className="animate-spin text-sky-300" style={{ animationDuration: '8s' }} />
        </div>

        <div className="inline-block px-3 py-1 bg-sky-500/30 border border-sky-400/60 rounded-full text-[11px] font-black uppercase tracking-wider text-sky-200 mb-2">
          Nova Mecânica Desbloqueada!
        </div>

        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
          Palavras Azuis (Invertidas)
        </h3>

        <p className="text-sm text-sky-100/90 mb-5 leading-relaxed">
          Quando uma palavra <strong className="text-sky-300">azul</strong> surgir, você deve digitá-la <strong>ao contrário</strong> (do fim para o começo)!
        </p>

        {/* Exemplo visual com FLOR -> R O L F */}
        <div className="bg-slate-800/90 border border-sky-500/40 rounded-2xl p-4 text-left mb-6 space-y-3">
          <div className="text-xs text-sky-300 font-semibold flex items-center gap-1.5">
            <Zap size={14} className="text-sky-400" />
            <span>Exemplo Prático:</span>
          </div>

          <div className="flex items-center justify-center gap-3 py-2 bg-slate-950/60 rounded-xl border border-slate-700 font-mono text-base sm:text-lg">
            <div className="px-3 py-1 bg-blue-600 border border-sky-300 rounded-lg text-white font-bold tracking-wider shadow-sm">
              FLOR
            </div>
            <span className="text-sky-400 text-sm font-sans flex items-center gap-1">
              <ArrowLeft size={16} /> Digite:
            </span>
            <div className="px-3 py-1 bg-amber-500/20 border border-amber-400/50 rounded-lg text-amber-300 font-black tracking-widest">
              R · O · L · F
            </div>
          </div>

          <p className="text-[11px] text-sky-200/90 leading-normal text-center font-medium">
            ✨ <strong>Facilidade especial:</strong> As palavras azuis caem com a <strong>metade da velocidade</strong> e são mais curtas para você ter tempo de raciocinar!
          </p>
        </div>

        {/* Botão Entendido */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 shadow-xl shadow-sky-500/30 transition-all flex items-center justify-center gap-2 text-base active:scale-98 cursor-pointer"
        >
          <Check size={20} className="stroke-[3]" />
          <span>Entendi, Continuar jogando!</span>
        </button>
      </div>
    </div>
  );
};
