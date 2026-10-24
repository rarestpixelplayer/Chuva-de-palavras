import React from 'react';
import { FallingWord } from '../types/game';
import { ArrowLeft, Zap, Sparkles } from 'lucide-react';

interface WordBadgeProps {
  word: FallingWord;
  isTarget: boolean;
  orderNumber: number; // 1, 2, 3...
  fontSize?: 'normal' | 'large';
  isBlindnessMode?: boolean;
}

export const WordBadge: React.FC<WordBadgeProps> = ({
  word,
  isTarget,
  orderNumber,
  fontSize = 'normal',
  isBlindnessMode = false,
}) => {
  const isCompleted = word.typedLength >= word.text.length;
  const isNearDanger = word.y > 80 && !isCompleted;
  const isReverse = Boolean(word.isReverse);
  const isGreen = Boolean(word.isGreen);
  const lettersRemoved = word.lettersRemoved || 0;

  // Se todas as letras já foram removidas pelas bolas de canhão
  if (lettersRemoved >= word.text.length) {
    return null;
  }

  // Tratamento para palavra invertida (Azul) vs Palavra normal
  let remainingChars: string[] = [];
  let nextTypingIndex = -1; // índice dentro do remainingChars que é a próxima letra a ser digitada
  const targetedIndices: Set<number> = new Set();

  if (isReverse) {
    // Palavra invertida: remove do fim para o começo
    const remainingLength = word.text.length - lettersRemoved;
    const remainingText = word.text.slice(0, remainingLength);
    remainingChars = remainingText.split('');

    const inFlightCount = Math.max(0, word.typedLength - lettersRemoved);
    // As letras em vôo são as últimas `inFlightCount` letras da direita
    for (let i = 0; i < inFlightCount; i++) {
      const idx = remainingChars.length - 1 - i;
      if (idx >= 0) targetedIndices.add(idx);
    }
    // A próxima letra a digitar é a letra imediatamente antes das que já estão em vôo
    nextTypingIndex = remainingChars.length - 1 - inFlightCount;
  } else {
    // Palavra normal / verde: remove do começo para o fim
    const remainingText = word.text.slice(lettersRemoved);
    remainingChars = remainingText.split('');

    const inFlightCount = Math.max(0, word.typedLength - lettersRemoved);
    for (let i = 0; i < inFlightCount; i++) {
      if (i < remainingChars.length) targetedIndices.add(i);
    }
    nextTypingIndex = inFlightCount;
  }

  // Determina classes de aura/brilho
  let auraClass = '';
  if (isCompleted) {
    auraClass = 'ring-2 ring-emerald-400/80 shadow-emerald-500/50 opacity-90';
  } else if (isNearDanger) {
    auraClass = 'animate-danger-pulse animate-danger-wobble ring-3 ring-red-500 shadow-red-500/90';
  } else if (isGreen) {
    auraClass = 'animate-green-aura ring-2 ring-emerald-400/80 shadow-emerald-500/60';
  } else if (isReverse) {
    auraClass = 'animate-blue-aura ring-2 ring-sky-400/80 shadow-sky-500/60';
  } else if (word.isBonus) {
    auraClass = 'animate-pulse ring-2 ring-yellow-300 shadow-yellow-500/60';
  } else if (isTarget) {
    auraClass = 'ring-2 ring-orange-400/70 shadow-orange-500/40';
  }

  // Modo Cegueira: as palavras desaparecem gradualmente conforme caem (de y=12% a y=45%)
  let blindnessOpacity = 1;
  let isBlindnessHidden = false;
  if (isBlindnessMode) {
    if (word.y <= 12) {
      blindnessOpacity = 1;
    } else if (word.y >= 45) {
      blindnessOpacity = word.typedLength > 0 ? 0.4 : 0.03;
      isBlindnessHidden = true;
    } else {
      const fadeProgress = (word.y - 12) / 33;
      blindnessOpacity = Math.max(0.03, 1 - fadeProgress);
    }
  }

  return (
    <div
      className={`absolute select-none pointer-events-none transition-transform duration-75 animate-word-spawn ${
        isBlindnessHidden ? 'filter blur-[1px]' : ''
      }`}
      style={{
        left: `${word.x}%`,
        top: `${word.y}%`,
        transform: `translate(-50%, -50%) rotate(${word.tilt ?? 0}deg)`,
        zIndex: isTarget ? 32 : 25,
        opacity: isBlindnessMode ? blindnessOpacity : undefined,
        transition: isBlindnessMode ? 'opacity 0.2s ease-out' : undefined,
      }}
    >
      <div
        className={`relative flex items-center gap-1.5 rounded-2xl font-black tracking-wide shadow-xl transition-all duration-150 backdrop-blur-md ${
          fontSize === 'large'
            ? 'px-4.5 py-2 text-xl sm:text-2xl'
            : 'px-3.5 py-1.5 text-lg sm:text-xl'
        } ${auraClass} ${
          word.isBonus
            ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 border-2 border-yellow-200 shadow-yellow-500/50'
            : isGreen
            ? isTarget
              ? 'bg-emerald-950/90 border-2 border-emerald-400 text-white shadow-emerald-500/40'
              : 'bg-emerald-950/75 border border-emerald-400/70 text-emerald-100'
            : isReverse
            ? isTarget
              ? 'bg-sky-950/90 border-2 border-cyan-400 text-white shadow-cyan-500/40'
              : 'bg-sky-950/75 border border-sky-400/70 text-sky-100'
            : isTarget
            ? isNearDanger
              ? 'bg-red-950/90 border-2 border-red-500 text-white shadow-red-500/50'
              : 'bg-slate-900/90 border-2 border-amber-400 text-white shadow-amber-500/30'
            : 'bg-slate-900/80 border border-slate-700/80 text-white'
        }`}
      >
        {/* Marcador superior para palavra totalmente digitada aguardando impacto final */}
        {isCompleted && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md shadow-md whitespace-nowrap flex items-center gap-1 border border-emerald-300 animate-pulse">
            <span>✓</span>
            <span>Concluída!</span>
          </div>
        )}

        {/* Marcador superior flutuante de alvo / prioridade com animação */}
        {!isCompleted && isTarget && (
          <div
            className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md shadow-md whitespace-nowrap flex items-center gap-1 transition-all ${
              isGreen
                ? 'bg-emerald-600 border border-emerald-300 animate-bounce'
                : isReverse
                ? 'bg-sky-600 border border-sky-300'
                : 'bg-orange-500 border border-orange-300'
            }`}
          >
            {word.mathExpression ? (
              <>
                <Sparkles size={11} className="fill-amber-200" />
                <span>Pense e Calcule!</span>
              </>
            ) : isGreen ? (
              <>
                <Zap size={11} className="fill-white" />
                <span>Prioridade Máxima</span>
              </>
            ) : isReverse ? (
              <>
                <ArrowLeft size={11} className="stroke-[3]" />
                <span>Digite ao contrário</span>
              </>
            ) : (
              <>
                <Sparkles size={10} className="fill-white" />
                <span>Alvo do Canhão</span>
              </>
            )}
          </div>
        )}

        {/* Tag informativa para palavras verdes que não são o alvo */}
        {!isTarget && isGreen && (
          <div className="absolute -top-2.5 left-2 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-sm flex items-center gap-0.5 shadow-sm border border-emerald-300">
            <Zap size={9} className="fill-white" />
            <span>Prioridade</span>
          </div>
        )}

        {/* Tag informativa para palavras azuis que não são o alvo */}
        {!isTarget && isReverse && (
          <div className="absolute -top-2.5 left-2 bg-sky-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-sm flex items-center gap-0.5 shadow-sm border border-sky-300">
            <ArrowLeft size={9} className="stroke-[2.5]" />
            <span>Inversa</span>
          </div>
        )}

        {/* Número da fila para palavras secundárias */}
        {!isTarget && orderNumber > 1 && (
          <div className="absolute -top-2.5 right-1 bg-slate-800/80 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-sm shadow-xs border border-slate-600">
            #{orderNumber}
          </div>
        )}

        {/* Ícone de bônus se for palavra especial */}
        {word.isBonus && (
          <span className="text-yellow-800 text-xs font-black animate-spin">★</span>
        )}

        {/* Ícone de raio para palavra verde */}
        {isGreen && isTarget && (
          <Zap size={15} className="text-emerald-200 fill-emerald-200" />
        )}

        {/* Indicador de seta de digitação reversa */}
        {isReverse && isTarget && (
          <span className="text-yellow-300 text-xs font-black mr-0.5 animate-pulse">
            ←
          </span>
        )}

        {/* Conteúdo da palavra ou conta matemática */}
        {word.mathExpression ? (
          <div className="flex items-center gap-2 select-none font-mono">
            {/* Expressão da conta (ex: "7 + 5 =") */}
            <span className="font-black text-amber-300 flex items-center gap-1 drop-shadow-sm">
              <span className="bg-slate-950/60 px-2 py-0.5 rounded-lg border border-amber-400/40 text-amber-200 font-black text-sm tracking-wide shadow-inner">
                {word.mathExpression}
              </span>
              <span className="text-white font-black text-base">=</span>
            </span>

            {/* Espaço de resposta: NÃO revela a resposta! O jogador deve pensar e digitar! Mostra o que já foi digitado e '?' para o que falta */}
            <span className="flex items-center gap-1">
              {Array.from({ length: word.text.length }).map((_, digitIdx) => {
                const isTyped = digitIdx < word.typedLength;
                const isNext = isTarget && digitIdx === word.typedLength;

                if (isTyped) {
                  return (
                    <span
                      key={`math-char-${digitIdx}`}
                      className="font-black text-emerald-300 bg-emerald-950/90 px-1.5 py-0.5 rounded-md text-sm border border-emerald-400 shadow-xs"
                    >
                      {word.text[digitIdx]}
                    </span>
                  );
                }

                return (
                  <span
                    key={`math-placeholder-${digitIdx}`}
                    className={`font-black px-1.5 py-0.5 rounded-md text-xs font-mono transition-all ${
                      isNext
                        ? 'bg-amber-400 text-slate-950 font-black scale-110 shadow-md ring-2 ring-amber-300 animate-pulse'
                        : 'bg-slate-900/80 text-amber-300/60 border border-slate-700'
                    }`}
                  >
                    {isNext ? '?' : '_'}
                  </span>
                );
              })}
            </span>
          </div>
        ) : (
          <span className="font-mono flex items-center tracking-wider">
            {remainingChars.map((char, idx) => {
              const isTargeted = targetedIndices.has(idx);
              const isNext = isTarget && idx === nextTypingIndex;

              if (isTargeted) {
                return (
                  <span
                    key={`char-${idx}`}
                    className={`font-black line-through opacity-65 px-0.5 rounded-sm transition-all ${
                      isGreen
                        ? 'text-emerald-300'
                        : isReverse
                        ? 'text-cyan-300'
                        : 'text-amber-400'
                    }`}
                  >
                    {char}
                  </span>
                );
              }

              if (isNext) {
                return (
                  <span
                    key={`char-${idx}`}
                    className="font-black text-amber-300 underline underline-offset-4 animate-pulse scale-110 inline-block px-0.5 drop-shadow-[0_0_8px_rgba(251,191,36,0.95)]"
                  >
                    {char}
                  </span>
                );
              }

              return (
                <span
                  key={`char-${idx}`}
                  className={`font-black px-0.5 ${
                    isGreen
                      ? 'text-emerald-100'
                      : isReverse
                      ? 'text-sky-100'
                      : 'text-white'
                  }`}
                >
                  {char}
                </span>
              );
            })}
          </span>
        )}

        {/* Dica de Tecla abaixo da palavra (estilo do Nível Tutorial) */}
        {isTarget && !isCompleted && (
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-sky-200 bg-slate-900/90 px-2 py-0.5 rounded-full border border-sky-400/30 shadow-md whitespace-nowrap z-30">
            {word.mathExpression ? (
              <span>Digite o resultado da conta</span>
            ) : isReverse ? (
              <span>
                Invertida: <strong className="text-cyan-300 font-mono">{remainingChars[nextTypingIndex] || '✓'}</strong>
              </span>
            ) : (
              <span>
                Próxima letra: <strong className="text-amber-300 font-mono">{remainingChars[nextTypingIndex] || '✓'}</strong>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
