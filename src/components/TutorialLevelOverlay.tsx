import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameLanguage, WordCategory, Difficulty, WordSpawnRates, CannonBall } from '../types/game';
import { Turret } from './Turret';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  RotateCcw,
  Home,
  Sliders,
  Trees,
  Cpu,
  Apple,
  Orbit,
  Volume2,
  VolumeX,
  Target,
  Trophy,
  Coins,
  Shield,
  Play,
  Check,
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import { normalizeChar } from '../utils/words';

interface TutorialLevelOverlayProps {
  language?: GameLanguage;
  equippedSkinId?: string;
  onCompleteTutorial: (rewardCoins: number) => void;
  onExit: () => void;
}

type TutorialPhase = 1 | 2 | 3 | 4 | 5 | 6;

interface TutorialWord {
  id: string;
  text: string;
  x: number; // percentage 10% to 90%
  y: number; // percentage
  isGreen?: boolean;
  isReverse?: boolean;
  typedLength: number;
}

interface FloatingEffect {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

export const TutorialLevelOverlay: React.FC<TutorialLevelOverlayProps> = ({
  language = 'pt',
  equippedSkinId = 'classic',
  onCompleteTutorial,
  onExit,
}) => {
  const [phase, setPhase] = useState<TutorialPhase>(1);
  const [words, setWords] = useState<TutorialWord[]>([]);
  const [targetId, setTargetId] = useState<string>('');
  const [cannonBalls, setCannonBalls] = useState<CannonBall[]>([]);
  const [floatingEffects, setFloatingEffects] = useState<FloatingEffect[]>([]);
  const [isFiring, setIsFiring] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.isMuted());
  const [hasClaimedReward, setHasClaimedReward] = useState<boolean>(false);

  // Estados interativos da Fase 5 (Ensinando a usar o Customizar)
  const [customCategory, setCustomCategory] = useState<WordCategory>('espaco');
  const [customDifficulty, setCustomDifficulty] = useState<Difficulty>('normal');
  const [customAccentTolerant, setCustomAccentTolerant] = useState<boolean>(true);
  const [customSpawnRates, setCustomSpawnRates] = useState<WordSpawnRates>({
    normal: 50,
    blue: 50,
    green: 50,
  });
  const [customizerTested, setCustomizerTested] = useState<boolean>(false);
  const [customActiveTab, setCustomActiveTab] = useState<'categories' | 'difficulty' | 'rates' | 'accents'>('categories');

  // Referências para animação fluida
  const wordsRef = useRef<TutorialWord[]>(words);
  wordsRef.current = words;

  const targetIdRef = useRef<string>(targetId);
  targetIdRef.current = targetId;

  const phaseRef = useRef<TutorialPhase>(phase);
  phaseRef.current = phase;

  // Carrega palavras da fase atual
  const setupPhase = useCallback((targetPhase: TutorialPhase) => {
    setPhase(targetPhase);
    setCannonBalls([]);
    setFloatingEffects([]);

    if (targetPhase === 1) {
      // Fase 1: Introdução ao Canhão e Disparo Básico
      const w: TutorialWord = { id: 'w1', text: 'FOGO', x: 50, y: 32, typedLength: 0 };
      setWords([w]);
      setTargetId('w1');
    } else if (targetPhase === 2) {
      // Fase 2: Palavras Verdes Prioritárias
      const w: TutorialWord = { id: 'w2', text: 'VELOZ', x: 50, y: 32, isGreen: true, typedLength: 0 };
      setWords([w]);
      setTargetId('w2');
    } else if (targetPhase === 3) {
      // Fase 3: Palavras Azuis Invertidas
      const w: TutorialWord = { id: 'w3', text: 'AZUL', x: 50, y: 32, isReverse: true, typedLength: 0 };
      setWords([w]);
      setTargetId('w3');
    } else if (targetPhase === 4) {
      // Fase 4: Troca de Alvo Estratégica
      const wA: TutorialWord = { id: 'w4-a', text: 'SOL', x: 30, y: 35, typedLength: 0 };
      const wB: TutorialWord = { id: 'w4-b', text: 'LUA', x: 70, y: 35, typedLength: 0 };
      setWords([wA, wB]);
      setTargetId('w4-a');
    } else if (targetPhase === 5) {
      // Fase 5: Ensinando a usar o Painel Customizar
      setCustomizerTested(false);
      setWords([]);
      setTargetId('');
    } else if (targetPhase === 6) {
      // Fase 6: Vitória do Nível
      setWords([]);
      setTargetId('');
      soundManager.playHighScoreBeaten();
    }
  }, []);

  // Inicia na montagem
  useEffect(() => {
    setupPhase(1);
    soundManager.playBGM('menu');
  }, [setupPhase]);

  // Adiciona efeito flutuante
  const addFloatingText = (text: string, x: number, y: number, color: string = '#facc15') => {
    const id = `${Date.now()}_${Math.random()}`;
    setFloatingEffects((prev) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingEffects((prev) => prev.filter((f) => f.id !== id));
    }, 1200);
  };

  // Disparo do Canhão
  const fireCannon = (targetX: number, targetY: number, char: string = '', isFinal: boolean = false) => {
    setIsFiring(true);
    soundManager.playCannonFire();
    const ballId = `${Date.now()}_${Math.random()}`;
    const newBall: CannonBall = {
      id: ballId,
      x: 50,
      y: 94,
      startX: 50,
      startY: 94,
      targetWordId: targetIdRef.current || 'target',
      targetX,
      targetY,
      char,
      charIndex: 0,
      isFinalLetter: isFinal,
      progress: 0,
      speed: 3.5,
      createdAt: performance.now(),
    };
    setCannonBalls((prev) => [...prev, newBall]);
    setTimeout(() => setIsFiring(false), 80);
  };

  // Loop de atualização das balas de canhão
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      setCannonBalls((prev) =>
        prev
          .map((b) => {
            const dx = b.targetX - b.x;
            const dy = b.targetY - b.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 4 || dt * 140 >= dist) {
              return null;
            }
            const moveX = (dx / dist) * 140 * dt;
            const moveY = (dy / dist) * 140 * dt;
            return {
              ...b,
              x: b.x + moveX,
              y: b.y + moveY,
            };
          })
          .filter((b): b is CannonBall => b !== null)
      );

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Troca de alvo (Fase 4)
  const handleSwapTarget = useCallback(() => {
    if (phaseRef.current !== 4) return;
    const currentWords = wordsRef.current;
    if (currentWords.length <= 1) return;

    soundManager.playButtonClick();
    const curId = targetIdRef.current;
    const nextWord = currentWords.find((w) => w.id !== curId);
    if (nextWord) {
      setTargetId(nextWord.id);
      addFloatingText('🎯 ALVO ALTERADO!', nextWord.x, nextWord.y - 12, '#38bdf8');
    }
  }, []);

  // Processa entrada de letra (física ou virtual)
  const handleInputChar = useCallback(
    (charInput: string) => {
      const currentPhase = phaseRef.current;
      const currentWords = wordsRef.current;
      const curTargetId = targetIdRef.current;

      // Se for espaço na Fase 4, alterna o alvo
      if (charInput === ' ' || charInput === 'Space') {
        if (currentPhase === 4) {
          handleSwapTarget();
        }
        return;
      }

      const activeWord = currentWords.find((w) => w.id === curTargetId) || currentWords[0];
      if (!activeWord) return;

      const normInput = normalizeChar(charInput);
      let expectedChar = '';

      if (activeWord.isReverse) {
        // Palavra azul reversa: lê do final para o início
        const reverseIdx = activeWord.text.length - 1 - activeWord.typedLength;
        expectedChar = activeWord.text[reverseIdx] || '';
      } else {
        // Palavra normal / verde
        expectedChar = activeWord.text[activeWord.typedLength] || '';
      }

      if (normalizeChar(expectedChar) === normInput) {
        // Acerto!
        const nextTyped = activeWord.typedLength + 1;
        const isFinal = nextTyped >= activeWord.text.length;
        soundManager.playCannonImpact(isFinal);
        const ballColor = activeWord.isReverse ? '#38bdf8' : activeWord.isGreen ? '#34d399' : '#facc15';
        fireCannon(activeWord.x, activeWord.y, expectedChar, isFinal);

        // Se completou a palavra
        if (isFinal) {
          soundManager.playWordDestroyed();
          addFloatingText('★ DESTRUÍDA! ★', activeWord.x, activeWord.y - 10, ballColor);

          const remaining = currentWords.filter((w) => w.id !== activeWord.id);
          setWords(remaining);

          if (remaining.length > 0) {
            setTargetId(remaining[0].id);
          } else {
            // Concluiu as palavras da fase atual
            if (currentPhase === 1) {
              // Na fase 1, se foi a primeira palavra (FOGO), manda a segunda (DEFESA)
              if (activeWord.text === 'FOGO') {
                setTimeout(() => {
                  setWords([{ id: 'w1-b', text: 'DEFESA', x: 50, y: 32, typedLength: 0 }]);
                  setTargetId('w1-b');
                }, 400);
                return;
              }
            }

            // Avança para a próxima fase com celebração
            soundManager.playLevelUp();
            setTimeout(() => {
              if (currentPhase === 5) {
                setCustomizerTested(true);
                setupPhase(6);
              } else {
                setupPhase((currentPhase + 1) as TutorialPhase);
              }
            }, 700);
          }
        } else {
          // Atualiza o progresso da palavra ativa
          setWords((prev) =>
            prev.map((w) => (w.id === activeWord.id ? { ...w, typedLength: nextTyped } : w))
          );
        }
      } else {
        // Erro
        soundManager.playTypo();
        addFloatingText('ERRO!', activeWord.x, activeWord.y - 12, '#ef4444');
      }
    },
    [handleSwapTarget, setupPhase]
  );

  // Listener de teclado físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
        return;
      }
      if (e.key === ' ') {
        e.preventDefault();
        handleInputChar(' ');
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        handleInputChar(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInputChar, onExit]);

  // Alvo ativo para o canhão mirar
  const activeTargetWord = words.find((w) => w.id === targetId) || words[0] || null;

  // Lógica de teste do customizador na Fase 5
  const handleApplyCustomizerTest = () => {
    soundManager.playButtonClick();
    setCustomizerTested(true);

    // Seleciona palavra de teste de acordo com a categoria escolhida
    const testWordsByCategory: Record<WordCategory, string> = {
      todas: 'GALAXY',
      natureza: 'FLORESTA',
      tecnologia: 'ROBOTICA',
      alimentos: 'MELANCIA',
      espaco: 'METEORO',
    };

    const wordText = testWordsByCategory[customCategory] || 'PLANETA';
    const newWord: TutorialWord = {
      id: 'custom-word',
      text: wordText,
      x: 50,
      y: 35,
      isGreen: customSpawnRates.green > 60,
      isReverse: customSpawnRates.blue > 60,
      typedLength: 0,
    };

    setWords([newWord]);
    setTargetId('custom-word');
    addFloatingText('🚀 PALAVRA CUSTOMIZADA SPAWNADA!', 50, 20, '#a855f7');
  };

  // Reivindica recompensa de graduação
  const handleClaimFinalReward = () => {
    if (hasClaimedReward) return;
    setHasClaimedReward(true);
    soundManager.playBonusStart();
    onCompleteTutorial(200);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden font-sans">
      {/* ===================== BARRA SUPERIOR DO NÍVEL (HUD DO NÍVEL) ===================== */}
      <header className="w-full bg-slate-900/95 border-b border-sky-500/40 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-lg z-30">
        {/* Título & Badge de Nível */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 font-black shadow-md flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                MODO DE JOGO: NÍVEL TUTORIAL
              </span>
              <span className="text-xs font-bold text-amber-300 hidden sm:inline">
                Fase {phase} de 6
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-white tracking-wide">
              Centro de Treinamento de Artilharia
            </h1>
          </div>
        </div>

        {/* Indicador de Passos / Fases (1 a 6) */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-2xl border border-sky-500/20">
          {[1, 2, 3, 4, 5, 6].map((pNum) => (
            <div
              key={pNum}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                phase === pNum
                  ? 'bg-sky-500 text-slate-950 font-black shadow-md scale-105'
                  : phase > pNum
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {phase > pNum ? <Check size={12} /> : <span>{pNum}</span>}
              <span className="text-[10px]">
                {pNum === 1
                  ? 'Básico'
                  : pNum === 2
                  ? 'Verdes'
                  : pNum === 3
                  ? 'Azuis'
                  : pNum === 4
                  ? 'Troca'
                  : pNum === 5
                  ? 'Customizar'
                  : 'Vitória'}
              </span>
            </div>
          ))}
        </div>

        {/* Ações: Som e Sair */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const muted = soundManager.toggleMute();
              setIsMuted(muted);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-200 border border-slate-700 cursor-pointer transition-colors"
            title="Alternar Áudio"
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              onExit();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/50 hover:border-red-500/50 text-slate-200 border border-slate-700 text-xs font-bold cursor-pointer transition-all"
          >
            <Home size={15} />
            <span className="hidden sm:inline">Menu</span>
          </button>
        </div>
      </header>

      {/* ===================== BANNER DE MISSÃO / OBJETIVO ATIVO ===================== */}
      <div className="w-full bg-gradient-to-r from-[#001f3f] via-[#003366] to-[#001f3f] border-b border-sky-400/40 px-3 py-2 text-center text-xs sm:text-sm text-sky-100 flex items-center justify-center gap-2 shadow-inner z-20">
        <Sparkles size={16} className="text-amber-400 shrink-0 animate-pulse" />
        <div className="font-semibold">
          {phase === 1 && (
            <span>
              🎯 <strong>MISSÃO 1:</strong> Digite as letras no teclado para disparar o canhão e defender a cidade!
            </span>
          )}
          {phase === 2 && (
            <span>
              ⚡ <strong>MISSÃO 2:</strong> Palavras Verdes caem rápido! O canhão mira nelas automaticamente com prioridade máxima.
            </span>
          )}
          {phase === 3 && (
            <span>
              ❄️ <strong>MISSÃO 3:</strong> Palavras Azuis têm grafia invertida! Digite de trás para frente (da direita para a esquerda).
            </span>
          )}
          {phase === 4 && (
            <span>
              🔄 <strong>MISSÃO 4:</strong> Dois alvos simultâneos! Pressione <strong>[ESPAÇO]</strong> para alternar a mira do canhão.
            </span>
          )}
          {phase === 5 && (
            <span>
              ⚙️ <strong>MISSÃO 5:</strong> Domine o painel <strong>Customizar</strong>! Configure opções abaixo e teste um disparo.
            </span>
          )}
          {phase === 6 && (
            <span className="text-amber-300 font-bold">
              🏆 <strong>PARABÉNS!</strong> Nível concluído com maestria! Reivindique suas moedas de ouro!
            </span>
          )}
        </div>
      </div>

      {/* ===================== ÁREA DE JOGO / ARENA DE TREINAMENTO ===================== */}
      <div className="relative flex-1 w-full overflow-hidden bg-radial-at-t from-[#001736] via-[#000d20] to-[#00050d] flex flex-col justify-between">
        {/* Estrelas decorativas */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-10 left-16 w-1 h-1 bg-white rounded-full animate-ping" />
          <div className="absolute top-28 right-24 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse" />
          <div className="absolute top-48 left-1/3 w-1 h-1 bg-sky-300 rounded-full" />
          <div className="absolute top-16 right-1/3 w-1 h-1 bg-teal-200 rounded-full" />
        </div>

        {/* Textos de Efeito Flutuante */}
        {floatingEffects.map((ft) => (
          <div
            key={ft.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none font-black text-sm sm:text-base font-mono drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-150 z-40"
            style={{
              left: `${ft.x}%`,
              top: `${ft.y}%`,
              color: ft.color,
            }}
          >
            {ft.text}
          </div>
        ))}

        {/* ===================== CONTEÚDO PRINCIPAL POR FASE ===================== */}
        <div className="relative w-full flex-1 flex flex-col items-center justify-center p-4 z-10">
          {/* FASES 1 A 4: PALAVRAS CAINDO E SENDO ATINGIDAS */}
          {phase <= 4 && (
            <div className="w-full max-w-2xl h-full relative">
              {words.map((w) => {
                const isTarget = w.id === activeTargetWord?.id;

                return (
                  <div
                    key={w.id}
                    className={`absolute -translate-x-1/2 flex flex-col items-center transition-all duration-300 ${
                      isTarget ? 'scale-110 z-20' : 'scale-95 opacity-80 z-10'
                    }`}
                    style={{
                      left: `${w.x}%`,
                      top: `${w.y}%`,
                    }}
                  >
                    {/* Indicador de Alvo com Mira */}
                    {isTarget && (
                      <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-amber-400/50 mb-1 animate-pulse shadow-md">
                        <Target size={12} className="text-amber-400" />
                        <span>ALVO DO CANHÃO</span>
                      </div>
                    )}

                    {/* Badge da Palavra */}
                    <div
                      className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl border-3 shadow-xl backdrop-blur-md flex items-center gap-2.5 transition-all ${
                        w.isGreen
                          ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-emerald-500/40'
                          : w.isReverse
                          ? 'bg-sky-950/80 border-cyan-400 text-white shadow-cyan-500/40'
                          : 'bg-slate-900/90 border-amber-400 text-white shadow-amber-500/30'
                      }`}
                    >
                      {/* Ícone Especial */}
                      {w.isGreen && (
                        <div className="p-1 rounded-lg bg-emerald-500/30 text-emerald-300 animate-bounce">
                          <Zap size={16} />
                        </div>
                      )}
                      {w.isReverse && (
                        <div className="p-1 rounded-lg bg-cyan-500/30 text-cyan-300 animate-spin duration-3000">
                          <RotateCcw size={16} />
                        </div>
                      )}

                      {/* Letras Digitadas vs Restantes */}
                      <div className="font-mono font-black text-xl sm:text-2xl tracking-wider flex items-center">
                        {w.isReverse ? (
                          // Palavra reversa: digitação invertida
                          <>
                            {w.text.split('').map((char, idx) => {
                              const revTargetIdx = w.text.length - 1 - idx;
                              const isCharTyped = revTargetIdx < w.typedLength;
                              const isNextChar = revTargetIdx === w.typedLength;

                              return (
                                <span
                                  key={idx}
                                  className={`relative px-0.5 ${
                                    isCharTyped
                                      ? 'text-cyan-400 line-through opacity-60'
                                      : isNextChar
                                      ? 'text-amber-300 underline underline-offset-4 animate-pulse scale-110 inline-block font-extrabold'
                                      : 'text-white'
                                  }`}
                                >
                                  {char}
                                </span>
                              );
                            })}
                          </>
                        ) : (
                          // Palavra normal / verde: digitação direta
                          <>
                            {w.text.split('').map((char, idx) => {
                              const isCharTyped = idx < w.typedLength;
                              const isNextChar = idx === w.typedLength;

                              return (
                                <span
                                  key={idx}
                                  className={`relative px-0.5 ${
                                    isCharTyped
                                      ? 'text-emerald-400 line-through opacity-60'
                                      : isNextChar
                                      ? 'text-amber-300 underline underline-offset-4 animate-pulse scale-110 inline-block font-extrabold'
                                      : 'text-white'
                                  }`}
                                >
                                  {char}
                                </span>
                              );
                            })}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Dica de Tecla abaixo da palavra */}
                    <div className="mt-2 text-[11px] font-bold text-sky-200 bg-slate-900/90 px-2.5 py-0.5 rounded-full border border-sky-400/30 shadow-sm">
                      {w.isReverse ? (
                        <span>
                          Digite de trás p/ frente:{' '}
                          <strong className="text-cyan-300">
                            {w.text[w.text.length - 1 - w.typedLength] || '✓'}
                          </strong>
                        </span>
                      ) : (
                        <span>
                          Próxima letra:{' '}
                          <strong className="text-amber-300">
                            {w.text[w.typedLength] || '✓'}
                          </strong>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Botão de Troca de Alvo na Fase 4 para Mobile & Desktop */}
              {phase === 4 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-in fade-in duration-200">
                  <button
                    type="button"
                    onClick={handleSwapTarget}
                    className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/40 cursor-pointer flex items-center gap-2 border-2 border-amber-200 active:scale-95 transition-all"
                  >
                    <RotateCcw size={16} />
                    <span>TROCAR ALVO [ESPAÇO]</span>
                  </button>
                  <span className="text-[11px] text-amber-200/90 font-medium">
                    Aperte a barra de espaço ou toque acima para alternar entre SOL e LUA!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ===================== FASE 5: APRENDA A USAR O CUSTOMIZAR ===================== */}
          {phase === 5 && (
            <div className="w-full max-w-xl bg-slate-900/95 border-3 border-sky-400 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-sky-950/80 flex flex-col gap-4 relative animate-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto no-scrollbar">
              {/* Cabeçalho do Mini-Customizador */}
              <div className="flex items-center justify-between border-b border-sky-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-500/20 border border-orange-400/40 text-orange-400">
                    <Sliders size={20} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                      Como Usar o Painel &quot;Customizar&quot;
                    </h2>
                    <p className="text-xs text-sky-200/80">
                      Entenda como moldar o jogo ao seu gosto
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30">
                  Guia Interativo
                </span>
              </div>

              {/* Abas Explicativas do Painel */}
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/70 rounded-2xl border border-sky-500/20 text-xs font-bold text-center">
                <button
                  type="button"
                  onClick={() => setCustomActiveTab('categories')}
                  className={`py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                    customActiveTab === 'categories'
                      ? 'bg-sky-500 text-slate-950 font-black'
                      : 'text-sky-300 hover:text-white'
                  }`}
                >
                  1. Temas
                </button>
                <button
                  type="button"
                  onClick={() => setCustomActiveTab('difficulty')}
                  className={`py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                    customActiveTab === 'difficulty'
                      ? 'bg-sky-500 text-slate-950 font-black'
                      : 'text-sky-300 hover:text-white'
                  }`}
                >
                  2. Dificuldade
                </button>
                <button
                  type="button"
                  onClick={() => setCustomActiveTab('rates')}
                  className={`py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                    customActiveTab === 'rates'
                      ? 'bg-sky-500 text-slate-950 font-black'
                      : 'text-sky-300 hover:text-white'
                  }`}
                >
                  3. Taxas %
                </button>
                <button
                  type="button"
                  onClick={() => setCustomActiveTab('accents')}
                  className={`py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                    customActiveTab === 'accents'
                      ? 'bg-sky-500 text-slate-950 font-black'
                      : 'text-sky-300 hover:text-white'
                  }`}
                >
                  4. Acentos
                </button>
              </div>

              {/* Conteúdo da Aba 1: Categorias de Palavras */}
              {customActiveTab === 'categories' && (
                <div className="space-y-3 bg-slate-950/50 p-3.5 rounded-2xl border border-sky-500/20">
                  <div className="flex items-center gap-2 text-sky-300 text-xs font-bold">
                    <Sparkles size={16} className="text-amber-400" />
                    <span>Escolha um tema de vocabulário para jogar:</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    No botão <strong>&quot;Customizar&quot;</strong> do Menu Principal, você pode focar o treino no vocabulário que mais gosta:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'espaco', label: 'Espaço 🚀', desc: 'Cometa, Órbita, Astro' },
                      { id: 'tecnologia', label: 'Tecnologia 💻', desc: 'Robótica, Chip, Dados' },
                      { id: 'natureza', label: 'Natureza 🌲', desc: 'Floresta, Rio, Vento' },
                      { id: 'alimentos', label: 'Alimentos 🍎', desc: 'Melancia, Fruta, Pão' },
                      { id: 'todas', label: 'Todas 🌟', desc: 'Mistura completa!' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          soundManager.playButtonClick();
                          setCustomCategory(cat.id as WordCategory);
                        }}
                        className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                          customCategory === cat.id
                            ? 'bg-sky-600/40 border-sky-400 shadow-md text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-sky-400/50'
                        }`}
                      >
                        <span className="font-bold text-xs block">{cat.label}</span>
                        <span className="text-[10px] text-sky-200/70 block mt-0.5">{cat.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Conteúdo da Aba 2: Dificuldades e Vidas */}
              {customActiveTab === 'difficulty' && (
                <div className="space-y-3 bg-slate-950/50 p-3.5 rounded-2xl border border-sky-500/20">
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                    <Shield size={16} className="text-indigo-400" />
                    <span>Níveis de Dificuldade & Velocidade:</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    A dificuldade ajusta a <strong>velocidade de queda</strong> das palavras e o número de <strong>vidas da base</strong>:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-pink-950/30 border border-pink-500/40">
                      <span className="font-bold text-pink-300 block">👶 Bebê (5 Vidas)</span>
                      <span className="text-[10px] text-slate-300">Super lento, ideal para iniciantes</span>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
                      <span className="font-bold text-emerald-300 block">🌱 Fácil (4 Vidas)</span>
                      <span className="text-[10px] text-slate-300">Ritmo tranquilo e relaxado</span>
                    </div>
                    <div className="p-2 rounded-xl bg-blue-950/30 border border-blue-500/40">
                      <span className="font-bold text-blue-300 block">🎯 Normal (3 Vidas)</span>
                      <span className="text-[10px] text-slate-300">Equilíbrio perfeito de desafio</span>
                    </div>
                    <div className="p-2 rounded-xl bg-red-950/30 border border-red-500/40">
                      <span className="font-bold text-red-300 block">⚡ Speed Typer (2 Vidas)</span>
                      <span className="text-[10px] text-slate-300">Velocidade extrema para mestres</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Conteúdo da Aba 3: Taxas de Aparição */}
              {customActiveTab === 'rates' && (
                <div className="space-y-3 bg-slate-950/50 p-3.5 rounded-2xl border border-sky-500/20">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                    <Zap size={16} className="text-emerald-400" />
                    <span>Controle de Taxa de Aparição (0% a 100%):</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Você pode calibrar ou até desativar palavras especiais movendo os sliders de <strong>0% a 100%</strong>:
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-700">
                      <span className="text-amber-300 font-bold">Palavras Normais</span>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-md text-slate-300">Base do jogo</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/40">
                      <span className="text-cyan-300 font-bold">Palavras Azuis (Invertidas)</span>
                      <span className="text-[10px] bg-cyan-900/60 px-2 py-0.5 rounded-md text-cyan-200">Aumentam o Bônus</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                      <span className="text-emerald-300 font-bold">Palavras Verdes (Rápidas)</span>
                      <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded-md text-emerald-200">Salvam combos</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Conteúdo da Aba 4: Tolerância a Acentos */}
              {customActiveTab === 'accents' && (
                <div className="space-y-3 bg-slate-950/50 p-3.5 rounded-2xl border border-sky-500/20">
                  <div className="flex items-center gap-2 text-teal-300 text-xs font-bold">
                    <CheckCircle2 size={16} className="text-teal-400" />
                    <span>Tolerância de Acentos e Caracteres Especiais:</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Quando a <strong>Tolerância a Acentos</strong> está ativada no Customizar, você pode digitar sem complicações:
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-teal-500/30 text-xs space-y-1.5 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Palavra: <strong className="text-white">MAÇÃ</strong></span>
                      <span className="text-teal-400">Pode digitar: <strong>M-A-C-A</strong></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Palavra: <strong className="text-white">ÁGUA</strong></span>
                      <span className="text-teal-400">Pode digitar: <strong>A-G-U-A</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Seção Prática: Testar Disparo Customizado */}
              <div className="pt-2 border-t border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-sky-200">
                  <span>Tema selecionado: </span>
                  <strong className="text-amber-300 uppercase">{customCategory}</strong>
                </div>

                {words.length === 0 ? (
                  <button
                    type="button"
                    onClick={handleApplyCustomizerTest}
                    className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wide shadow-lg shadow-emerald-500/30 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Play size={15} />
                    <span>Testar Palavra Temática</span>
                  </button>
                ) : (
                  <div className="text-xs text-emerald-300 font-bold animate-pulse">
                    ⬇️ Digite a palavra temática que surgiu acima!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== FASE 6: VITÓRIA DO NÍVEL TUTORIAL ===================== */}
          {phase === 6 && (
            <div className="w-full max-w-md bg-gradient-to-b from-[#002b5e] to-[#001736] border-4 border-amber-400 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center gap-4 shadow-2xl shadow-amber-500/40 animate-in zoom-in-95 duration-200">
              <div className="p-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 animate-bounce shadow-xl shadow-yellow-500/50">
                <Trophy size={48} />
              </div>

              <div>
                <span className="text-[11px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  MISSÃO CUMPRIDA!
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 uppercase tracking-wide">
                  Nível Tutorial Concluído!
                </h2>
                <p className="text-xs text-sky-200 mt-1">
                  Você dominou o canhão, palavras especiais, troca de alvos e todo o painel de customização!
                </p>
              </div>

              {/* Resumo das Conquistas */}
              <div className="w-full bg-slate-950/60 p-3.5 rounded-2xl border border-sky-400/30 text-left text-xs space-y-1.5 text-slate-200">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <Check size={14} /> <span>Disparo e mira teleguiada</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <Check size={14} /> <span>Palavras Verdes de Alta Prioridade</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Check size={14} /> <span>Palavras Azuis Invertidas</span>
                </div>
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Check size={14} /> <span>Troca rápida de alvo com [ESPAÇO]</span>
                </div>
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <Check size={14} /> <span>Personalização Total via Customizar</span>
                </div>
              </div>

              {/* Recompensa */}
              <div className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-950/60 to-yellow-950/60 border border-amber-400/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins size={22} className="text-yellow-400" />
                  <div className="text-left">
                    <span className="text-[10px] text-amber-300 uppercase font-black block">Recompensa</span>
                    <span className="text-sm font-black text-white">+200 Moedas de Ouro</span>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-400/30">
                  Pronto p/ Resgatar
                </span>
              </div>

              {/* Botão de Finalizar */}
              <button
                type="button"
                onClick={handleClaimFinalReward}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-base uppercase tracking-wider shadow-xl shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Resgatar Recompensa & Jogar</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* ===================== LINHA DE PERIGO & BASE ===================== */}
        <div className="relative w-full z-20">
          <div className="w-full h-1 hazard-stripes-animated shadow-md shadow-red-500/40" />
        </div>

        {/* Canhão na base mirando no alvo ativo */}
        <div className="relative w-full h-24 bg-[#030914] border-t border-slate-700/60 flex items-center justify-center z-15">
          <Turret
            targetX={activeTargetWord ? activeTargetWord.x : 50}
            targetY={activeTargetWord ? activeTargetWord.y : 20}
            isFiring={isFiring}
            cannonBalls={cannonBalls}
            equippedSkinId={equippedSkinId}
          />
        </div>
      </div>

      {/* ===================== TECLADO VIRTUAL DE SUPORTE PARA TOUCH / CELULAR ===================== */}
      {phase <= 5 && (
        <footer className="w-full bg-slate-950 border-t border-slate-800 px-2 py-2 sm:py-3 z-30">
          <div className="max-w-xl mx-auto flex flex-col items-center gap-2">
            {/* Teclas em Destaque para a Palavra Ativa */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {/* Gera botões com as letras da palavra ativa */}
              {activeTargetWord &&
                Array.from(new Set(activeTargetWord.text.split(''))).map((char: string) => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => handleInputChar(char)}
                    className="w-9 h-10 sm:w-11 sm:h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-sky-500 active:text-slate-950 text-white font-mono font-black text-base sm:text-lg border border-sky-400/40 shadow-sm cursor-pointer transition-all"
                  >
                    {char}
                  </button>
                ))}

              {/* Botão de ESPAÇO se na Fase 4 */}
              {phase === 4 && (
                <button
                  type="button"
                  onClick={handleSwapTarget}
                  className="px-4 h-10 sm:h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wide border border-amber-300 shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  <span>[ESPAÇO] Trocar</span>
                </button>
              )}
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              Você pode digitar diretamente no seu teclado físico ou tocar nas teclas virtuais acima!
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};
