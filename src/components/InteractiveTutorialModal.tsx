import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Zap,
  Target,
  Trophy,
  Flame,
  Clock,
  RotateCcw,
  X,
  Coins,
  Keyboard,
  Eye,
  Swords,
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import { normalizeChar } from '../utils/words';

interface InteractiveTutorialModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

type TutorialStep = 1 | 2 | 3 | 4 | 5;

interface TutorialWord {
  id: string;
  text: string;
  isGreen?: boolean;
  isReverse?: boolean;
  typedLength: number;
}

export const InteractiveTutorialModal: React.FC<InteractiveTutorialModalProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState<TutorialStep>(1);
  const [words, setWords] = useState<TutorialWord[]>([
    { id: 'step1-word', text: 'FOGO', typedLength: 0 },
  ]);
  const [targetId, setTargetId] = useState<string>('step1-word');
  const [hasSwappedTarget, setHasSwappedTarget] = useState<boolean>(false);
  const [stepCompleted, setStepCompleted] = useState<boolean>(false);
  const [isFiring, setIsFiring] = useState<boolean>(false);
  const [cannonAngle, setCannonAngle] = useState<number>(0);

  // Inicializa o passo atual
  const setupStep = useCallback((step: TutorialStep) => {
    setStepCompleted(false);
    setHasSwappedTarget(false);

    if (step === 1) {
      setWords([{ id: 'w1', text: 'FOGO', typedLength: 0 }]);
      setTargetId('w1');
      setCannonAngle(0);
    } else if (step === 2) {
      setWords([{ id: 'w2', text: 'VIDA', isGreen: true, typedLength: 0 }]);
      setTargetId('w2');
      setCannonAngle(10);
    } else if (step === 3) {
      setWords([{ id: 'w3', text: 'AZUL', isReverse: true, typedLength: 0 }]);
      setTargetId('w3');
      setCannonAngle(-10);
    } else if (step === 4) {
      setWords([
        { id: 'w4-a', text: 'SOL', typedLength: 0 },
        { id: 'w4-b', text: 'LUA', typedLength: 0 },
      ]);
      setTargetId('w4-a');
      setCannonAngle(-20);
    } else if (step === 5) {
      setWords([]);
      setStepCompleted(true);
    }
  }, []);

  useEffect(() => {
    setupStep(currentStep);
  }, [currentStep, setupStep]);

  const activeWord = words.find((w) => w.id === targetId);

  // Determina a próxima letra esperada
  let expectedChar = '';
  if (activeWord) {
    if (activeWord.isReverse) {
      expectedChar = activeWord.text[activeWord.text.length - 1 - activeWord.typedLength] || '';
    } else {
      expectedChar = activeWord.text[activeWord.typedLength] || '';
    }
  }

  // Avança para o próximo passo
  const handleNextStep = () => {
    soundManager.playButtonClick();
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as TutorialStep);
    } else {
      soundManager.playDailyMissionComplete();
      onComplete();
    }
  };

  // Processa a digitação de uma letra
  const handleTypeLetter = useCallback(
    (char: string) => {
      if (stepCompleted || !activeWord || !expectedChar) return;

      if (normalizeChar(char) === normalizeChar(expectedChar)) {
        // Disparo e som do canhão
        setIsFiring(true);
        setTimeout(() => setIsFiring(false), 90);
        soundManager.playCannonFire();
        soundManager.playKeyStroke(activeWord.typedLength + 1);

        const newLength = activeWord.typedLength + 1;

        if (newLength >= activeWord.text.length) {
          // Palavra concluída!
          soundManager.playWordDestroyed(Boolean(activeWord.isGreen || activeWord.isReverse));

          if (currentStep === 4) {
            // No passo 4, se destruiu uma após trocar de alvo, completa o passo
            setWords((prev) => prev.map((w) => (w.id === activeWord.id ? { ...w, typedLength: newLength } : w)));
            setStepCompleted(true);
            soundManager.playLevelUp();
          } else {
            setWords((prev) => prev.map((w) => (w.id === activeWord.id ? { ...w, typedLength: newLength } : w)));
            setStepCompleted(true);
            soundManager.playLevelUp();
          }
        } else {
          setWords((prev) =>
            prev.map((w) => (w.id === activeWord.id ? { ...w, typedLength: newLength } : w))
          );
        }
      } else {
        soundManager.playTypo();
      }
    },
    [activeWord, expectedChar, stepCompleted, currentStep]
  );

  // Troca de alvo (Espaço)
  const handleSwapTarget = useCallback(() => {
    if (currentStep !== 4 || words.length < 2) return;
    soundManager.playButtonClick();
    const nextTarget = targetId === 'w4-a' ? 'w4-b' : 'w4-a';
    setTargetId(nextTarget);
    setCannonAngle(nextTarget === 'w4-b' ? 20 : -20);
    setHasSwappedTarget(true);
  }, [currentStep, words, targetId]);

  // Listener de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (currentStep === 4) {
          handleSwapTarget();
        }
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (stepCompleted) {
          handleNextStep();
        }
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        handleTypeLetter(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTypeLetter, handleSwapTarget, stepCompleted, currentStep, onSkip]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#002244] via-[#002f5c] to-[#001736] border-4 border-sky-400 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-sky-950 text-white relative flex flex-col gap-4 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-sky-500/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 border border-sky-400/40 rounded-xl text-sky-300">
              <Sparkles size={22} className="animate-spin text-amber-300" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                Treinamento Oficial
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                Tutorial Interativo
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="p-1.5 rounded-xl text-sky-300 hover:text-white hover:bg-sky-500/20 transition-colors cursor-pointer border border-sky-500/20 flex items-center gap-1 text-xs"
            title="Pular Tutorial"
          >
            <span className="hidden sm:inline">Pular</span>
            <X size={18} />
          </button>
        </div>

        {/* Barra de Progresso dos Passos */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 px-1">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex-1 flex flex-col gap-1 items-center">
              <div
                className={`h-2 w-full rounded-full transition-all duration-300 ${
                  step === currentStep
                    ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                    : step < currentStep
                    ? 'bg-emerald-400'
                    : 'bg-slate-800'
                }`}
              />
              <span
                className={`text-[10px] font-mono font-bold ${
                  step === currentStep ? 'text-amber-300' : step < currentStep ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                Passo {step}
              </span>
            </div>
          ))}
        </div>

        {/* ÁREA INTERATIVA DO JOGO */}
        <div className="relative h-56 sm:h-64 rounded-2xl bg-gradient-to-b from-[#020b18] via-[#041d3d] to-[#002f5c] border-2 border-sky-500/40 overflow-hidden flex flex-col justify-between p-3 shadow-inner">
          {/* Instrução rápida de topo */}
          <div className="text-center z-10">
            {currentStep === 1 && (
              <p className="text-xs sm:text-sm text-sky-200 font-bold bg-slate-950/60 inline-block px-3 py-1 rounded-full border border-sky-400/30">
                Digite as letras no teclado para o canhão disparar!
              </p>
            )}
            {currentStep === 2 && (
              <p className="text-xs sm:text-sm text-emerald-300 font-bold bg-slate-950/60 inline-block px-3 py-1 rounded-full border border-emerald-400/40">
                Palavra Verde: Prioridade máxima e NUNCA quebra seu combo!
              </p>
            )}
            {currentStep === 3 && (
              <p className="text-xs sm:text-sm text-sky-300 font-bold bg-slate-950/60 inline-block px-3 py-1 rounded-full border border-sky-400/40">
                Palavra Azul: Digite ao contrário (de trás para frente)!
              </p>
            )}
            {currentStep === 4 && (
              <p className="text-xs sm:text-sm text-amber-300 font-bold bg-slate-950/60 inline-block px-3 py-1 rounded-full border border-amber-400/40">
                {!hasSwappedTarget
                  ? 'Aperte [ESPAÇO] para alternar o alvo entre as palavras!'
                  : 'Alvo trocado! Agora digite a palavra selecionada!'}
              </p>
            )}
            {currentStep === 5 && (
              <p className="text-xs sm:text-sm text-yellow-300 font-bold bg-slate-950/60 inline-block px-3 py-1 rounded-full border border-yellow-400/40">
                Parabéns! Você está pronto para os desafios!
              </p>
            )}
          </div>

          {/* PALAVRAS EM QUEDA NO TUTORIAL */}
          <div className="relative flex-1 flex items-center justify-around">
            {words.map((word) => {
              const isTarget = word.id === targetId;
              const isComplete = word.typedLength >= word.text.length;

              return (
                <div
                  key={word.id}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-2xl font-mono text-xl sm:text-2xl font-black shadow-xl transition-all duration-200 border-2 ${
                    isComplete
                      ? 'bg-emerald-600/90 border-emerald-300 text-white animate-bounce'
                      : word.isGreen
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 border-emerald-300 text-white shadow-emerald-500/50'
                      : word.isReverse
                      ? 'bg-gradient-to-r from-blue-600 to-sky-600 border-sky-300 text-white shadow-sky-500/50'
                      : isTarget
                      ? 'bg-slate-900 border-amber-400 text-white shadow-amber-500/40 ring-4 ring-amber-400/30'
                      : 'bg-slate-900/80 border-slate-700 text-slate-300'
                  }`}
                >
                  {/* Etiqueta de Alvo */}
                  {isTarget && !isComplete && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] uppercase font-black px-2 py-0.5 rounded-md shadow-md whitespace-nowrap flex items-center gap-1">
                      <Target size={11} /> ALVO ATIVO
                    </span>
                  )}

                  {/* Letras renderizadas */}
                  {word.isReverse ? (
                    // Palavra invertida: digitada de trás para frente
                    word.text.split('').map((char, idx) => {
                      const fromRightIdx = word.text.length - 1 - idx;
                      const isTyped = fromRightIdx < word.typedLength;
                      const isNext = fromRightIdx === word.typedLength && isTarget;

                      return (
                        <span
                          key={idx}
                          className={`transition-all ${
                            isTyped
                              ? 'text-amber-300 opacity-60'
                              : isNext
                              ? 'text-white underline decoration-amber-400 decoration-4 animate-pulse'
                              : 'text-white'
                          }`}
                        >
                          {char}
                        </span>
                      );
                    })
                  ) : (
                    // Palavra normal / verde
                    word.text.split('').map((char, idx) => {
                      const isTyped = idx < word.typedLength;
                      const isNext = idx === word.typedLength && isTarget;

                      return (
                        <span
                          key={idx}
                          className={`transition-all ${
                            isTyped
                              ? 'text-amber-300 opacity-60'
                              : isNext
                              ? 'text-white underline decoration-amber-400 decoration-4 animate-pulse'
                              : 'text-white'
                          }`}
                        >
                          {char}
                        </span>
                      );
                    })
                  )}
                </div>
              );
            })}

            {/* Passo 5: Visão Geral de Sucesso */}
            {currentStep === 5 && (
              <div className="text-center space-y-2 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-300 mx-auto flex items-center justify-center text-amber-300 animate-bounce">
                  <Trophy size={36} />
                </div>
                <h3 className="text-xl font-black text-amber-300 uppercase tracking-wide">
                  Treinamento Concluído!
                </h3>
                <p className="text-xs text-slate-200 max-w-sm mx-auto">
                  Você dominou as palavras normais, verdes prioritárias, azuis invertidas e a troca de alvos com espaço!
                </p>
              </div>
            )}
          </div>

          {/* BASE E CANHÃO DE DEFESA */}
          <div className="relative flex justify-center items-end pt-2 border-t border-sky-400/30">
            <div className="relative flex flex-col items-center">
              {/* Cano do canhão com rotação suave */}
              <div
                className={`w-4 h-12 bg-gradient-to-t from-slate-700 to-amber-500 rounded-t-md origin-bottom transition-transform duration-150 border border-amber-300 shadow-md ${
                  isFiring ? 'scale-y-110 brightness-150' : ''
                }`}
                style={{ transform: `rotate(${cannonAngle}deg)` }}
              />
              {/* Cúpula do canhão */}
              <div className="w-14 h-7 rounded-t-full bg-gradient-to-r from-blue-700 via-sky-500 to-blue-700 border-2 border-sky-300 shadow-lg -mt-1" />
            </div>
          </div>
        </div>

        {/* TECLADO VIRTUAL / GUIA INTERATIVO PARA TOQUE OU CLIQUE */}
        {!stepCompleted && expectedChar && (
          <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-900/80 border border-sky-500/30">
            <div className="flex items-center gap-2 text-xs text-sky-200">
              <Keyboard size={15} className="text-sky-400" />
              <span>
                Próxima tecla necessária:{' '}
                <strong className="font-mono text-base text-amber-300 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40">
                  {expectedChar}
                </strong>
              </span>
            </div>

            {/* Botões de digitação rápida interativa (funciona no celular e no mouse) */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'L', 'M', 'O', 'R', 'S', 'U', 'V', 'Z'].map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => handleTypeLetter(letter)}
                  className={`w-9 h-9 rounded-xl font-mono font-black text-sm uppercase transition-all cursor-pointer shadow-sm ${
                    normalizeChar(letter) === normalizeChar(expectedChar)
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 scale-105 ring-2 ring-amber-300 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {letter}
                </button>
              ))}

              {currentStep === 4 && (
                <button
                  type="button"
                  onClick={handleSwapTarget}
                  className="px-3.5 h-9 rounded-xl font-black text-xs uppercase bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-md flex items-center gap-1.5 ring-2 ring-indigo-300 animate-bounce"
                >
                  <span>[ESPAÇO] Trocar Alvo</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* FEEDBACK DE PASSO CONCLUÍDO & BOTÃO DE CONTINUAR */}
        {stepCompleted && (
          <div className="p-4 rounded-2xl bg-emerald-950/70 border-2 border-emerald-400 text-center space-y-2 animate-in zoom-in-95">
            <div className="flex items-center justify-center gap-2 text-emerald-300 font-black text-base sm:text-lg uppercase">
              <CheckCircle2 size={20} />
              <span>
                {currentStep === 5 ? 'Recompensa de Recruta Desbloqueada!' : 'Excelente! Passo Concluído!'}
              </span>
            </div>

            {currentStep === 5 ? (
              <div className="flex items-center justify-center gap-2 text-amber-300 text-sm font-black py-1">
                <Coins size={18} className="fill-amber-400" />
                <span>+150 Moedas Adicionadas ao seu Arsenal!</span>
              </div>
            ) : (
              <p className="text-xs text-emerald-200">
                Pressione Enter ou clique abaixo para avançar ao próximo passo.
              </p>
            )}

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm uppercase rounded-xl transition-all cursor-pointer shadow-lg hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2"
            >
              <span>{currentStep === 5 ? 'Concluir e Ir para o Jogo!' : 'Avançar para o Próximo Passo'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Botão de Rodapé para Pular */}
        <div className="flex items-center justify-between pt-1 text-xs text-sky-300">
          <span>Passo {currentStep} de 5</span>
          <button
            type="button"
            onClick={onSkip}
            className="hover:text-white underline cursor-pointer"
          >
            Pular e jogar direto
          </button>
        </div>
      </div>
    </div>
  );
};
