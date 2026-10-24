import { X, Sparkles, Clock, Zap, CheckCircle2, Play, EyeOff, GraduationCap } from 'lucide-react';
import { ActiveGameMode } from '../types/game';
import { soundManager } from '../utils/sound';

interface GameModesModalProps {
  currentMode: ActiveGameMode;
  onSelectMode: (mode: ActiveGameMode) => void;
  onClose: () => void;
}

export const GameModesModal: React.FC<GameModesModalProps> = ({
  currentMode,
  onSelectMode,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-gradient-to-b from-[#002244] via-[#002f5c] to-[#004282] border-4 border-sky-400 rounded-3xl p-6 sm:p-7 max-w-lg w-full text-white shadow-2xl shadow-sky-950/80 relative overflow-hidden flex flex-col gap-5">
        {/* Brilho decorativo no topo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-sky-400/20 rounded-full blur-xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-sky-500/30 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 border border-sky-400/40 rounded-xl text-sky-300">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                Modos de Jogo
              </h2>
              <p className="text-xs text-sky-200/80">
                Selecione seu desafio favorito
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-sky-300 hover:text-white hover:bg-sky-500/20 transition-colors cursor-pointer border border-sky-500/20"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista de Modos Jogáveis */}
        <div className="space-y-3 relative z-10 max-h-[60vh] overflow-y-auto pr-1">
          {/* Nível / Modo Tutorial */}
          <div
            onClick={() => {
              soundManager.playButtonClick();
              onSelectMode('TUTORIAL');
            }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
              currentMode === 'TUTORIAL'
                ? 'bg-emerald-950/50 border-emerald-400 shadow-md shadow-emerald-950/60'
                : 'bg-gradient-to-r from-emerald-950/30 to-teal-950/30 border-teal-500/50 hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300">
                <GraduationCap size={20} className="text-emerald-400" />
                <h3 className="font-black text-emerald-200 text-base sm:text-lg tracking-wide uppercase">
                  Nível Tutorial (Treinamento)
                </h3>
              </div>
              {currentMode === 'TUTORIAL' ? (
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 flex items-center gap-1 shadow-sm">
                  <CheckCircle2 size={12} /> Selecionado
                </span>
              ) : (
                <span className="text-xs text-emerald-400/90 flex items-center gap-1 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  <Play size={12} /> Jogar Nível
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Level especial jogável com 6 fases práticas! Domine o canhão, palavras verdes rápidas, palavras azuis invertidas, troca de alvos com <strong>[ESPAÇO]</strong> e aprenda a usar todas as opções do painel <strong>Customizar</strong> (categorias, dificuldades, tolerância a acentos e taxas de aparição).
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-emerald-500/20">
              <span className="text-[11px] font-black uppercase text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-400/30">
                🎁 Recompensa: +200 Moedas
              </span>
              <div className="py-1 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-500/30">
                <Play size={13} />
                <span>Jogar Tutorial</span>
              </div>
            </div>
          </div>

          {/* Modo 1: Clássico */}
          <div
            onClick={() => {
              soundManager.playButtonClick();
              onSelectMode('CLASSIC');
            }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
              currentMode === 'CLASSIC'
                ? 'bg-emerald-950/40 border-emerald-400 shadow-md shadow-emerald-950/40'
                : 'bg-slate-900/50 border-slate-700/70 hover:border-emerald-400/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80" />
                <h3 className="font-black text-emerald-300 text-base sm:text-lg tracking-wide uppercase">
                  Modo Clássico
                </h3>
              </div>
              {currentMode === 'CLASSIC' ? (
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                  <CheckCircle2 size={12} /> Selecionado
                </span>
              ) : (
                <span className="text-xs text-emerald-400/80 flex items-center gap-1 font-bold">
                  <Play size={12} /> Jogar
                </span>
              )}
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Defesa da base com vidas e canhão teleguiado! Inclui <strong className="text-sky-300">palavras azuis invertidas</strong>, <strong className="text-emerald-300">palavras verdes prioritárias</strong> e rodadas bônus.
            </p>
          </div>

          {/* Modo 2: Contra o Tempo (60 Segundos) */}
          <div
            onClick={() => {
              soundManager.playButtonClick();
              onSelectMode('TIME_ATTACK');
            }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
              currentMode === 'TIME_ATTACK'
                ? 'bg-sky-950/40 border-sky-400 shadow-md shadow-sky-950/40'
                : 'bg-slate-900/50 border-slate-700/70 hover:border-sky-400/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-300">
                <Clock size={18} />
                <h3 className="font-black text-sky-200 text-base sm:text-lg tracking-wide uppercase">
                  Contra o Tempo (60s)
                </h3>
              </div>
              {currentMode === 'TIME_ATTACK' ? (
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-400 text-slate-950 flex items-center gap-1 shadow-sm">
                  <CheckCircle2 size={12} /> Selecionado
                </span>
              ) : (
                <span className="text-xs text-sky-400/80 flex items-center gap-1 font-bold">
                  <Play size={12} /> Jogar
                </span>
              )}
            </div>
            <p className="text-xs text-sky-200/90 leading-relaxed">
              Corrida de 60 segundos com o <strong className="text-sky-300 font-bold">triplo de palavras</strong> caindo sem parar! Não perde vidas. Digite o máximo de palavras antes que o cronômetro zere para pontuação recorde!
            </p>
          </div>

          {/* Modo 3: Modo Reflexo (3, 4, 5, 6, 7 letras) */}
          <div
            onClick={() => {
              soundManager.playButtonClick();
              onSelectMode('REFLEX');
            }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
              currentMode === 'REFLEX'
                ? 'bg-orange-950/40 border-orange-400 shadow-md shadow-orange-950/40'
                : 'bg-slate-900/50 border-slate-700/70 hover:border-orange-400/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-400">
                <Zap size={18} />
                <h3 className="font-black text-orange-300 text-base sm:text-lg tracking-wide uppercase">
                  Modo Reflexo (3 a 7 Letras)
                </h3>
              </div>
              {currentMode === 'REFLEX' ? (
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-400 text-slate-950 flex items-center gap-1 shadow-sm">
                  <CheckCircle2 size={12} /> Selecionado
                </span>
              ) : (
                <span className="text-xs text-orange-400/80 flex items-center gap-1 font-bold">
                  <Play size={12} /> Jogar
                </span>
              )}
            </div>
            <p className="text-xs text-orange-200/90 leading-relaxed">
              Teste seus reflexos! Uma palavra surge de surpresa na tela: primeiro 3 letras, depois 4, 5, 6 e 7. Digite no menor milissegundo possível e descubra sua pontuação somada final!
            </p>
          </div>

          {/* Modo 4: Modo Matemática */}
          <div
            onClick={() => {
              soundManager.playButtonClick();
              onSelectMode('MATH');
            }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
              currentMode === 'MATH'
                ? 'bg-purple-950/40 border-purple-400 shadow-md shadow-purple-950/40'
                : 'bg-slate-900/50 border-slate-700/70 hover:border-purple-400/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-300">
                <span className="text-lg font-mono font-black">∑</span>
                <h3 className="font-black text-purple-200 text-base sm:text-lg tracking-wide uppercase">
                  Modo Matemática
                </h3>
              </div>
              {currentMode === 'MATH' ? (
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-400 text-slate-950 flex items-center gap-1 shadow-sm">
                  <CheckCircle2 size={12} /> Selecionado
                </span>
              ) : (
                <span className="text-xs text-purple-400/80 flex items-center gap-1 font-bold">
                  <Play size={12} /> Jogar
                </span>
              )}
            </div>
            <p className="text-xs text-purple-200/90 leading-relaxed">
              Em vez de palavras, caem operações matemáticas aleatórias (soma, subtração, multiplicação e divisão)! Digite o resultado numérico exato antes que atinjam o chão. Não há palavras azuis, mas inclui <strong className="text-emerald-300 font-bold">contas verdes prioritárias</strong>!
            </p>
          </div>

          {/* Modo 5: Modo Cegueira */}
          <div
            onClick={() => {
              soundManager.playButtonClick();
              onSelectMode('BLINDNESS');
            }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
              currentMode === 'BLINDNESS'
                ? 'bg-zinc-950/70 border-violet-400 shadow-md shadow-violet-950/60'
                : 'bg-slate-900/50 border-slate-700/70 hover:border-violet-400/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-violet-300">
                <EyeOff size={18} className="text-violet-400" />
                <h3 className="font-black text-violet-200 text-base sm:text-lg tracking-wide uppercase">
                  Modo Cegueira
                </h3>
              </div>
              {currentMode === 'BLINDNESS' ? (
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-400 text-slate-950 flex items-center gap-1 shadow-sm">
                  <CheckCircle2 size={12} /> Selecionado
                </span>
              ) : (
                <span className="text-xs text-violet-400/80 flex items-center gap-1 font-bold">
                  <Play size={12} /> Jogar
                </span>
              )}
            </div>
            <p className="text-xs text-violet-200/90 leading-relaxed">
              As palavras começam visíveis e <strong className="text-violet-300 font-bold">desaparecem gradualmente conforme caem</strong>! Memorize a grafia completa antes que sumam da tela e digite tudo de cabeça no escuro!
            </p>
          </div>

          {/* Modo 6: Modo Duelo */}
          <div
            onClick={() => {
              soundManager.playButtonClick();
              onSelectMode('DUEL');
            }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
              currentMode === 'DUEL'
                ? 'bg-rose-950/40 border-rose-400 shadow-md shadow-rose-950/40'
                : 'bg-slate-900/50 border-slate-700/70 hover:border-rose-400/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-300">
                <span className="text-base font-black">⚔️</span>
                <h3 className="font-black text-rose-200 text-base sm:text-lg tracking-wide uppercase">
                  Modo Duelo (Local & Online)
                </h3>
              </div>
              {currentMode === 'DUEL' ? (
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-400 text-slate-950 flex items-center gap-1 shadow-sm">
                  <CheckCircle2 size={12} /> Selecionado
                </span>
              ) : (
                <span className="text-xs text-rose-400/80 flex items-center gap-1 font-bold">
                  <Play size={12} /> Jogar
                </span>
              )}
            </div>
            <p className="text-xs text-rose-200/90 leading-relaxed">
              Batalha direta entre dois jogadores! Escolha entre <strong className="text-white">Duelo Local (tela dividida no mesmo teclado)</strong> ou <strong className="text-white">Duelo Online (pela internet)</strong>. As palavras têm exatamente a mesma quantidade de letras para ambos. Quem deixar cair, perde!
            </p>
          </div>
        </div>

        {/* Botão de Fechar / Confirmar */}
        <div className="pt-2 relative z-10">
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="w-full py-3.5 px-4 rounded-xl font-black text-slate-950 bg-sky-400 hover:bg-sky-300 border-2 border-sky-300 transition-all uppercase tracking-wider text-sm cursor-pointer shadow-lg shadow-sky-500/30 active:scale-98"
          >
            Confirmar e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
