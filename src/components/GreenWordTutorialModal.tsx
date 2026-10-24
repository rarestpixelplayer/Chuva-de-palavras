import React from 'react';
import { Sparkles, ArrowDown, Check, Zap, Flame } from 'lucide-react';

interface GreenWordTutorialModalProps {
  onClose: () => void;
}

export const GreenWordTutorialModal: React.FC<GreenWordTutorialModalProps> = ({ onClose }) => {
  // Permite pressionar Enter para continuar de forma ágil
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
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 border-2 border-emerald-400 rounded-3xl p-6 sm:p-7 shadow-2xl text-white text-center relative overflow-hidden">
        {/* Ícone de novidade em verde esmeralda */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-inner">
          <Zap size={32} className="animate-pulse text-emerald-300" />
        </div>

        <div className="inline-block px-3 py-1 bg-emerald-500/30 border border-emerald-400/60 rounded-full text-[11px] font-black uppercase tracking-wider text-emerald-200 mb-2">
          Nova Mecânica Desbloqueada!
        </div>

        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
          Palavras Verdes (Prioridade Máxima)
        </h3>

        <p className="text-sm text-emerald-100/90 mb-5 leading-relaxed">
          Quando uma palavra <strong className="text-emerald-300">verde</strong> surgir, ela exige reflexos rápidos e rouba o foco do canhão!
        </p>

        {/* Exemplo visual e regras das palavras verdes */}
        <div className="bg-slate-800/90 border border-emerald-500/40 rounded-2xl p-4 text-left mb-6 space-y-3">
          <div className="flex items-start gap-2.5">
            <Flame size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-200 leading-relaxed">
              <strong className="text-emerald-300">Queda Acelerada:</strong> Palavras verdes descem mais rápido do céu que as palavras comuns!
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <ArrowDown size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-200 leading-relaxed">
              <strong className="text-emerald-300">Prioridade Automática:</strong> Ela passa na frente da fila instantaneamente. O canhão mira e você digita ela na hora!
            </div>
          </div>

          {/* Badge demonstrativo */}
          <div className="flex items-center justify-center gap-3 py-2 bg-slate-950/60 rounded-xl border border-slate-700 font-mono text-base">
            <div className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-green-500 border border-emerald-300 rounded-lg text-white font-extrabold tracking-wider shadow-md shadow-emerald-500/30 flex items-center gap-1.5">
              <span className="text-xs">⚡</span>
              <span>VELOZ</span>
            </div>
            <span className="text-emerald-400 text-xs font-sans font-semibold">
              Alvo imediato!
            </span>
          </div>

          <p className="text-[11px] text-emerald-200/90 leading-normal text-center font-medium">
            Aparece uma por vez e nunca surge se outra palavra já estiver perigosamente perto do chão.
          </p>
        </div>

        {/* Botão Entendido */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 text-base active:scale-98 cursor-pointer"
        >
          <Check size={20} className="stroke-[3]" />
          <span>Entendi, Continuar jogando!</span>
        </button>
      </div>
    </div>
  );
};
