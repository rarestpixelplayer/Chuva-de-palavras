import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 text-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <h3 className="text-xl font-black text-slate-900 mb-1">
          Regras & Como Jogar
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Domine o teclado e proteja o perímetro!
        </p>

        <div className="space-y-3.5 text-xs sm:text-sm text-slate-700">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={18} className="text-orange-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block mb-0.5">Ordem de Chegada (FIFO)</strong>
              As palavras que entram na tela têm fila de prioridade. A primeira que apareceu é o alvo com borda laranja. Digite as letras dela na seqüência!
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block mb-0.5">Bolas de Canhão Teleguiadas</strong>
              A cada tecla digitada, o canhão dispara uma bola de canhão teleguiada que persegue a palavra e arranca fisicamente a letra digitada!
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block mb-0.5">Fases de Bônus Periódicas</strong>
              Ao atingir metas de ondas, inicia-se a Rodada Bônus: 20 segundos de palavras douradas, pontos em dobro e o chão não causa dano.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={18} className="text-sky-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block mb-0.5">Palavras Azuis (Invertidas)</strong>
              Nos modos a partir de Normal, surgem palavras azuis com o indicador <strong>←</strong>. Você deve digitá-las ao contrário (ex: para <strong>FLOR</strong>, digite <strong>R-O-L-F</strong>). Sua velocidade é um pouco menor para facilitar o raciocínio.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block mb-0.5">Palavras Verdes (Prioridade Máxima)</strong>
              Surgem velozes e ganham <strong>prioridade automática</strong> imediata sobre qualquer outra palavra na tela! O canhão mira e você digita na hora.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={18} className="text-teal-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block mb-0.5">Multiplicadores & Combos</strong>
              Manter uma sequência de acertos sem erros aumenta o multiplicador de pontuação até 5x!
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          Entendido, Voltar ao Jogo
        </button>
      </div>
    </div>
  );
};
