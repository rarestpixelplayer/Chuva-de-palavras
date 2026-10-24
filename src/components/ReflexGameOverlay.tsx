import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReflexRoundResult, GameLanguage } from '../types/game';
import { getReflexWord, normalizeChar } from '../utils/words';
import { soundManager } from '../utils/sound';
import { Zap, Trophy, RotateCcw, Home, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface ReflexGameOverlayProps {
  accentTolerant: boolean;
  language?: GameLanguage;
  onRestart: () => void;
  onExit: () => void;
}

type RoundPhase = 'WAITING' | 'ACTIVE' | 'ROUND_SUCCESS' | 'RESULTS';

export const ReflexGameOverlay: React.FC<ReflexGameOverlayProps> = ({
  accentTolerant,
  language = 'pt',
  onRestart,
  onExit,
}) => {
  const ROUND_LENGTHS = [3, 4, 5, 6, 7];
  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0);
  const [phase, setPhase] = useState<RoundPhase>('WAITING');
  const [currentWord, setCurrentWord] = useState<string>('');
  const [typedLength, setTypedLength] = useState<number>(0);
  const [roundErrors, setRoundErrors] = useState<number>(0);
  const [lastRoundTime, setLastRoundTime] = useState<number>(0);
  const [lastRoundPoints, setLastRoundPoints] = useState<number>(0);
  const [results, setResults] = useState<ReflexRoundResult[]>([]);
  const [elapsedDisplay, setElapsedDisplay] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('chuva_palavras_reflexo_highscore') || '0', 10);
  });
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  const phaseRef = useRef<RoundPhase>(phase);
  phaseRef.current = phase;

  const currentWordRef = useRef<string>(currentWord);
  currentWordRef.current = currentWord;

  const typedLengthRef = useRef<number>(typedLength);
  typedLengthRef.current = typedLength;

  const roundStartTimeRef = useRef<number>(0);
  const waitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tickerRef = useRef<NodeJS.Timeout | null>(null);

  // Inicia uma nova rodada
  const startRound = useCallback((roundIdx: number) => {
    if (roundIdx >= ROUND_LENGTHS.length) {
      setPhase('RESULTS');
      return;
    }

    const length = ROUND_LENGTHS[roundIdx];
    const word = getReflexWord(length, language);

    setCurrentRoundIdx(roundIdx);
    setCurrentWord(word);
    setTypedLength(0);
    setRoundErrors(0);
    setElapsedDisplay(0);
    setPhase('WAITING');

    // Tempo aleatório imprevisível entre 1500ms e 3200ms
    const randomWaitMs = 1500 + Math.random() * 1700;

    if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);
    waitTimeoutRef.current = setTimeout(() => {
      roundStartTimeRef.current = performance.now();
      setPhase('ACTIVE');
      soundManager.playReflexSpawn();

      // Atualiza o display de milissegundos
      if (tickerRef.current) clearInterval(tickerRef.current);
      tickerRef.current = setInterval(() => {
        if (phaseRef.current === 'ACTIVE') {
          setElapsedDisplay(Math.round(performance.now() - roundStartTimeRef.current));
        }
      }, 30);
    }, randomWaitMs);
  }, []);

  // Início na montagem
  useEffect(() => {
    startRound(0);
    return () => {
      if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, [startRound]);

  // Digitação do caractere
  const handleKeyInput = useCallback(
    (charTyped: string) => {
      if (phaseRef.current !== 'ACTIVE') return;

      const word = currentWordRef.current;
      const currentTyped = typedLengthRef.current;
      if (currentTyped >= word.length) return;

      const expectedChar = word[currentTyped];
      const normTyped = accentTolerant ? normalizeChar(charTyped) : charTyped.toLowerCase();
      const normExpected = accentTolerant ? normalizeChar(expectedChar) : expectedChar.toLowerCase();

      if (normTyped === normExpected) {
        const nextTyped = currentTyped + 1;
        soundManager.playKeyStroke(nextTyped);
        setTypedLength(nextTyped);

        // Palavra concluída!
        if (nextTyped === word.length) {
          if (tickerRef.current) clearInterval(tickerRef.current);
          const roundTimeMs = Math.round(performance.now() - roundStartTimeRef.current);
          setLastRoundTime(roundTimeMs);

          // Cálculo dos pontos
          const length = word.length;
          const basePoints = length * 1000;
          const speedBonus = Math.max(200, Math.round(4500 - roundTimeMs * 2.2));
          const penalty = roundErrors * 150;
          const pointsEarned = Math.max(100, basePoints + speedBonus - penalty);

          setLastRoundPoints(pointsEarned);
          soundManager.playReflexSuccess();
          setPhase('ROUND_SUCCESS');

          const newResult: ReflexRoundResult = {
            round: currentRoundIdx + 1,
            length,
            word,
            reactionTimeMs: roundTimeMs,
            errors: roundErrors,
            points: pointsEarned,
          };

          const nextResults = [...results, newResult];
          setResults(nextResults);

          // Próxima rodada ou tela final
          setTimeout(() => {
            if (currentRoundIdx + 1 < ROUND_LENGTHS.length) {
              startRound(currentRoundIdx + 1);
            } else {
              // Fim do teste de reflexo
              setPhase('RESULTS');
              const totalScore = nextResults.reduce((acc, r) => acc + r.points, 0);
              const currentSavedHigh = parseInt(
                localStorage.getItem('chuva_palavras_reflexo_highscore') || '0',
                10
              );
              if (totalScore > currentSavedHigh) {
                setIsNewRecord(true);
                setHighScore(totalScore);
                localStorage.setItem('chuva_palavras_reflexo_highscore', String(totalScore));
                soundManager.playHighScoreBeaten();
              } else {
                soundManager.playLevelUp();
              }
            }
          }, 1400);
        }
      } else {
        // Erro
        soundManager.playTypo();
        setRoundErrors((p) => p + 1);
      }
    },
    [accentTolerant, currentRoundIdx, roundErrors, results, startRound]
  );

  // Listener global de teclado para o Modo Reflexo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundManager.playButtonClick();
        onExit();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length === 1 && !e.repeat) {
        handleKeyInput(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyInput, onExit]);

  // Totais na tela final
  const totalScore = results.reduce((acc, r) => acc + r.points, 0);
  const avgReactionTime =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.reactionTimeMs, 0) / results.length)
      : 0;

  const getRankBadge = (avgMs: number) => {
    if (avgMs <= 600) return { title: '⚡ Reflexo de Relâmpago', color: 'text-amber-400 bg-amber-500/20 border-amber-400' };
    if (avgMs <= 900) return { title: '🦅 Águia Veloz', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-400' };
    if (avgMs <= 1300) return { title: '🥋 Ninja da Digitação', color: 'text-sky-400 bg-sky-500/20 border-sky-400' };
    if (avgMs <= 1800) return { title: '🏃 Rápido e Preciso', color: 'text-blue-300 bg-blue-500/20 border-blue-400' };
    return { title: '🎯 Em Treinamento', color: 'text-slate-300 bg-slate-500/20 border-slate-400' };
  };

  const rank = getRankBadge(avgReactionTime);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-[#001833] via-[#002f5c] to-[#004282] text-white select-none overflow-hidden">
      {/* Barra de Progresso Superior */}
      <div className="w-full max-w-xl flex items-center justify-between border-b border-sky-400/30 pb-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-orange-500/20 border border-orange-400/50 rounded-lg text-orange-400">
            <Zap size={20} />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-white">
              Modo Reflexo
            </h2>
            <p className="text-[11px] text-sky-200/80">
              {phase === 'RESULTS'
                ? 'Desafio Concluído!'
                : `Rodada ${currentRoundIdx + 1} de 5 (${ROUND_LENGTHS[currentRoundIdx]} Letras)`}
            </p>
          </div>
        </div>

        {/* Indicador de Rodadas */}
        <div className="flex items-center gap-1.5">
          {ROUND_LENGTHS.map((len, idx) => (
            <div
              key={len}
              className={`px-2 py-1 rounded-md text-xs font-mono font-bold border transition-all ${
                idx < currentRoundIdx
                  ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                  : idx === currentRoundIdx
                  ? 'bg-orange-500 text-slate-950 border-orange-300 scale-110 shadow-md shadow-orange-500/40'
                  : 'bg-slate-900/60 border-slate-700 text-slate-400'
              }`}
            >
              {len}L
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            onExit();
          }}
          className="text-xs text-sky-300 hover:text-white px-3 py-1.5 rounded-lg border border-sky-400/30 hover:bg-sky-500/20 transition-colors cursor-pointer"
        >
          Sair (ESC)
        </button>
      </div>

      {/* ÁREA CENTRAL DO JOGO */}
      <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center text-center px-4 relative">
        {/* FASE: AGUARDANDO (SUSPENSE) */}
        {phase === 'WAITING' && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-200">
            <div className="w-24 h-24 rounded-full border-4 border-dashed border-sky-400/60 animate-spin flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-sky-500/20 animate-pulse flex items-center justify-center text-sky-300 font-black text-xl font-mono">
                {ROUND_LENGTHS[currentRoundIdx]}L
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-sky-300 uppercase tracking-widest animate-pulse">
                Atenção...
              </h3>
              <p className="text-sm text-sky-200/80">
                A palavra vai aparecer a qualquer momento. Prepare os dedos!
              </p>
            </div>
          </div>
        )}

        {/* FASE: ATIVA (A PALAVRA APARECEU!) */}
        {phase === 'ACTIVE' && (
          <div className="w-full flex flex-col items-center gap-6 animate-in zoom-in-95 duration-100">
            {/* Cronômetro de Milissegundos em Tempo Real */}
            <div className="flex items-center gap-2 bg-slate-950/60 border border-orange-400/50 px-4 py-1.5 rounded-full font-mono text-base font-bold text-orange-400 shadow-md">
              <Zap size={16} className="animate-bounce" />
              <span>{elapsedDisplay} ms</span>
            </div>

            {/* Display da Palavra em letras gigantes */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 p-6 sm:p-8 bg-slate-950/80 border-4 border-orange-500 rounded-3xl shadow-2xl shadow-orange-500/30">
              {currentWord.split('').map((char, idx) => {
                const isTyped = idx < typedLength;
                const isCurrent = idx === typedLength;
                return (
                  <div
                    key={idx}
                    className={`w-12 h-16 sm:w-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-3xl sm:text-4xl uppercase border-2 transition-all ${
                      isTyped
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300 scale-95 shadow-md shadow-emerald-500/40'
                        : isCurrent
                        ? 'bg-slate-900 text-white border-orange-400 ring-4 ring-orange-400/40 scale-105 animate-pulse'
                        : 'bg-slate-900/70 text-slate-400 border-slate-700'
                    }`}
                  >
                    <span>{char}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-slate-300">
              Digite agora no teclado! Letras restantes:{' '}
              <strong className="text-white font-mono">{currentWord.length - typedLength}</strong>
            </p>
          </div>
        )}

        {/* FASE: SUCESSO DA RODADA */}
        {phase === 'ROUND_SUCCESS' && (
          <div className="flex flex-col items-center gap-4 animate-in zoom-in-90 duration-150">
            <div className="p-4 bg-emerald-500/20 border-2 border-emerald-400 rounded-full text-emerald-400 shadow-xl shadow-emerald-500/30 animate-bounce">
              <CheckCircle size={48} />
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-wider">
                {currentWord.toUpperCase()}
              </h3>
              <div className="flex items-center justify-center gap-4 text-base font-mono font-bold">
                <span className="text-orange-400">⚡ {lastRoundTime} ms</span>
                <span className="text-emerald-400">+{lastRoundPoints.toLocaleString('pt-BR')} pts</span>
              </div>
            </div>
          </div>
        )}

        {/* FASE: RESULTADOS FINAIS */}
        {phase === 'RESULTS' && (
          <div className="w-full max-w-xl bg-slate-900/90 border-4 border-sky-400 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-left animate-in zoom-in-95 duration-200">
            {/* Cabeçalho do Resultado */}
            <div className="text-center space-y-1 border-b border-sky-500/30 pb-3">
              <div className="flex items-center justify-center gap-2">
                <Trophy size={28} className="text-amber-400" />
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
                  Pontuação de Reflexo
                </h3>
              </div>
              <p className="text-xs text-sky-200/80">
                Soma de todas as 5 rodadas de 3 a 7 letras
              </p>
            </div>

            {/* Destaque da Pontuação Total e Tempo Médio */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-400/50 rounded-2xl">
                <span className="text-xs text-amber-300 font-medium">Pontuação Total</span>
                <div className="font-mono text-2xl sm:text-3xl font-black text-amber-400">
                  {totalScore.toLocaleString('pt-BR')}
                </div>
                {isNewRecord && (
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider bg-amber-500/30 px-2 py-0.5 rounded-full inline-block mt-1">
                    ★ Novo Recorde! ★
                  </span>
                )}
              </div>

              <div className="p-3 bg-slate-800/80 border border-sky-400/40 rounded-2xl flex flex-col justify-center">
                <span className="text-xs text-sky-300 font-medium">Tempo Médio de Reação</span>
                <div className="font-mono text-2xl sm:text-3xl font-black text-white">
                  {avgReactionTime} <span className="text-sm text-sky-300">ms</span>
                </div>
                <div className={`mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full border self-center ${rank.color}`}>
                  {rank.title}
                </div>
              </div>
            </div>

            {/* Tabela detalhada das rodadas */}
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Desempenho por Rodada:
              </span>
              <div className="space-y-1 text-xs font-mono">
                {results.map((res) => (
                  <div
                    key={res.round}
                    className="p-2 rounded-xl bg-slate-950/60 border border-slate-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <span className="text-sky-400">{res.length}L:</span>
                      <span className="text-white uppercase">{res.word}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-orange-400">{res.reactionTimeMs}ms</span>
                      <span className="text-emerald-400 font-black">+{res.points.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recorde Geral Salvo */}
            {highScore > 0 && (
              <div className="text-center text-xs text-sky-200 flex items-center justify-center gap-1.5">
                <Trophy size={14} className="text-amber-400" />
                <span>Melhor Recorde Reflexo: <strong className="text-amber-300 font-mono">{highScore.toLocaleString('pt-BR')}</strong> pts</span>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setResults([]);
                  startRound(0);
                }}
                className="flex-1 py-3 px-4 rounded-xl font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all uppercase tracking-wider text-xs sm:text-sm cursor-pointer shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-98"
              >
                <RotateCcw size={16} /> Jogar Novamente
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  onExit();
                }}
                className="py-3 px-5 rounded-xl font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all uppercase tracking-wider text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <Home size={16} /> Menu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rodapé explicativo */}
      <div className="text-center text-[11px] sm:text-xs text-sky-200/70 py-1">
        <span>Digite as letras exatamente como aparecem no teclado o mais rápido possível</span>
      </div>
    </div>
  );
};
