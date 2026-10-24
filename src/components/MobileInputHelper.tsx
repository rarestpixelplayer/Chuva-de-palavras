import React, { useRef, useEffect, useState } from 'react';
import { Keyboard, ArrowLeftRight, ChevronDown, ChevronUp, Smartphone } from 'lucide-react';
import { GameLanguage } from '../types/game';
import { TRANSLATIONS } from '../utils/i18n';
import { soundManager } from '../utils/sound';

interface MobileInputHelperProps {
  onKeyPress: (char: string) => void;
  onSwitchTarget: () => void;
  canSwitchTarget: boolean;
  hasActiveGreen: boolean;
  targetWordText?: string;
  typedLength?: number;
  isReverse?: boolean;
  isGreen?: boolean;
  isMath?: boolean;
  language?: GameLanguage;
}

export const MobileInputHelper: React.FC<MobileInputHelperProps> = ({
  onKeyPress,
  onSwitchTarget,
  canSwitchTarget,
  hasActiveGreen,
  targetWordText,
  typedLength = 0,
  isReverse = false,
  isGreen = false,
  isMath = false,
  language = 'pt',
}) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.pt;

  useEffect(() => {
    // Se o teclado virtual estiver desativado, foca suavemente o input nativo
    if (!showVirtualKeyboard && !isMinimized && hiddenInputRef.current) {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (isTouch) {
        hiddenInputRef.current.focus();
      }
    }
  }, [showVirtualKeyboard, isMinimized]);

  const handleNativeInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const value = input.value;
    if (value.length > 0) {
      const lastChar = value.slice(-1);
      onKeyPress(lastChar);
      input.value = '';
    }
  };

  // No modo matemática NUNCA expõe o caractere de resposta! O jogador deve pensar e responder
  const nextChar = isMath
    ? null
    : targetWordText
    ? isReverse
      ? targetWordText[targetWordText.length - 1 - typedLength] || null
      : targetWordText[typedLength] || null
    : null;

  // Fileira numérica (essencial para Modo Matemática)
  const numberRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  // Letras das fileiras do teclado de toque
  const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  if (language === 'pt' || language === 'fr') {
    row2.push('Ç');
  } else if (language === 'es') {
    row2.push('Ñ');
  }
  const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  // Letras acentuadas para idiomas com acentos (Português, Francês, Espanhol)
  const accentChars: string[] = [];
  if (language === 'pt') {
    accentChars.push('Á', 'Ã', 'Â', 'É', 'Ê', 'Í', 'Ó', 'Ô', 'Õ', 'Ú');
  } else if (language === 'es') {
    accentChars.push('Á', 'É', 'Í', 'Ó', 'Ú');
  } else if (language === 'fr') {
    accentChars.push('É', 'È', 'Ê', 'À', 'Â', 'Ô', 'Î', 'Ù');
  }

  const handleTouchKey = (char: string) => {
    onKeyPress(char);
  };

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 flex flex-col pointer-events-auto select-none">
      {/* Input nativo oculto para modo de teclado do sistema */}
      <input
        ref={hiddenInputRef}
        type="text"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className="opacity-0 w-1 h-1 absolute -top-10 pointer-events-none"
        onChange={handleNativeInput}
      />

      {/* Barra de Status e Controles Rápidos Mobile */}
      <div className="bg-slate-950/95 backdrop-blur-md border-t-2 border-slate-700/80 px-2 py-1.5 flex items-center justify-between gap-1.5 shadow-2xl">
        {/* Botão de Trocar Alvo (Equivalente ao Espaço na tela) */}
        <button
          type="button"
          onClick={() => {
            if (canSwitchTarget) {
              onSwitchTarget();
            } else if (hasActiveGreen) {
              soundManager.playTypo();
            }
          }}
          disabled={!canSwitchTarget || hasActiveGreen}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer ${
            hasActiveGreen
              ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-50'
              : canSwitchTarget
              ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white border border-sky-400 active:bg-sky-500'
              : 'bg-slate-800 text-slate-500 border border-slate-700/50 opacity-60'
          }`}
          title={hasActiveGreen ? 'Palavra verde tem prioridade!' : t.groundHintSpace}
        >
          <ArrowLeftRight size={13} className={canSwitchTarget && !hasActiveGreen ? 'animate-pulse' : ''} />
          <span className="text-[11px] whitespace-nowrap">{t.switchTargetMobile}</span>
        </button>

        {/* Indicador da Próxima Letra / Palavra Ativa */}
        {isMath ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-black shadow-md border bg-amber-600 text-white border-amber-300 ring-2 ring-amber-400/40 animate-pulse">
            <span className="text-sm">🧠</span>
            <span className="text-[11px] text-amber-100 uppercase font-sans font-bold">
              Pense e Digite a Resposta!
            </span>
            <span className="bg-amber-900/90 text-amber-200 px-1.5 py-0.5 rounded-md text-xs font-black border border-amber-300 shadow-inner">
              ?
            </span>
          </div>
        ) : nextChar ? (
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono text-xs font-black shadow-md border ${
              isGreen
                ? 'bg-emerald-600 text-white border-emerald-300 ring-2 ring-emerald-400/40'
                : isReverse
                ? 'bg-sky-600 text-white border-sky-300 ring-2 ring-sky-400/40'
                : 'bg-orange-500/90 text-white border-orange-300'
            }`}
          >
            {isGreen && <span className="text-xs">⚡</span>}
            {isReverse && <span className="text-xs">←</span>}
            <span className="text-[10px] text-white/80 uppercase font-sans hidden sm:inline">
              {t.nextLetter}
            </span>
            <span className="text-sm font-black underline decoration-2">{nextChar.toUpperCase()}</span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 font-medium truncate">
            {t.groundHint1}
          </div>
        )}

        {/* Alternador Teclado na Tela vs Teclado Nativo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              setShowVirtualKeyboard((prev) => {
                const next = !prev;
                if (!next && hiddenInputRef.current) {
                  setTimeout(() => hiddenInputRef.current?.focus(), 50);
                }
                return next;
              });
            }}
            className={`p-1.5 rounded-xl border flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer ${
              showVirtualKeyboard
                ? 'bg-amber-500/20 border-amber-400/60 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title={showVirtualKeyboard ? t.nativeKeyboard : t.virtualKeyboard}
          >
            {showVirtualKeyboard ? <Keyboard size={15} /> : <Smartphone size={15} />}
          </button>

          {/* Minimizar / Recolher barra */}
          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 active:bg-slate-700 cursor-pointer"
            aria-label={isMinimized ? 'Expandir' : 'Minimizar'}
          >
            {isMinimized ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* TECLADO DE TOQUE NA TELA (On-Screen Touch Keyboard para Celular) */}
      {!isMinimized && showVirtualKeyboard && (
        <div className="bg-slate-950/98 border-t border-slate-800 p-1.5 pb-2.5 flex flex-col gap-1.5 shadow-2xl animate-in slide-in-from-bottom-2 duration-150">
          {/* Fileira Numérica: Sempre visível no Modo Matemática para digitar resultados */}
          {isMath && (
            <div className="flex justify-center gap-1 w-full py-0.5 px-0.5 bg-amber-950/50 rounded-xl border border-amber-400/40">
              {numberRow.map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleTouchKey(digit)}
                  className="flex-1 max-w-[36px] h-11 rounded-lg font-black text-base flex items-center justify-center transition-all cursor-pointer shadow-md select-none touch-manipulation bg-gradient-to-t from-amber-700 to-yellow-500 text-slate-950 border border-yellow-200 active:scale-90"
                >
                  {digit}
                </button>
              ))}
            </div>
          )}
          {/* Barra de Acentos (para Português, Espanhol, Francês) */}
          {accentChars.length > 0 && (
            <div className="flex justify-center gap-1 w-full overflow-x-auto no-scrollbar py-0.5 px-1 bg-slate-900/60 rounded-lg">
              {accentChars.map((char) => {
                const isNext = nextChar?.toUpperCase() === char;
                return (
                  <button
                    key={char}
                    type="button"
                    onClick={() => handleTouchKey(char)}
                    className={`flex-1 min-w-[28px] max-w-[34px] h-7 rounded-md font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-xs select-none touch-manipulation ${
                      isNext
                        ? 'bg-gradient-to-t from-orange-600 to-amber-500 text-white border border-amber-200 ring-2 ring-amber-400/70 scale-110 z-10 font-black'
                        : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95'
                    }`}
                  >
                    {char}
                  </button>
                );
              })}
            </div>
          )}

          {/* Fileira 1 */}
          <div className="flex justify-center gap-1 w-full">
            {row1.map((char) => {
              const isNext = nextChar?.toUpperCase() === char;
              return (
                <button
                  key={char}
                  type="button"
                  onClick={() => handleTouchKey(char)}
                  className={`flex-1 max-w-[36px] h-10 rounded-lg font-bold text-sm flex items-center justify-center transition-all cursor-pointer shadow-md select-none touch-manipulation ${
                    isNext
                      ? 'bg-gradient-to-t from-orange-600 to-amber-500 text-white border border-amber-200 ring-2 ring-amber-400/60 scale-105 z-10'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 active:scale-90 active:bg-slate-600'
                  }`}
                >
                  {char}
                </button>
              );
            })}
          </div>

          {/* Fileira 2 */}
          <div className="flex justify-center gap-1 w-full px-1">
            {row2.map((char) => {
              const isNext = nextChar?.toUpperCase() === char;
              return (
                <button
                  key={char}
                  type="button"
                  onClick={() => handleTouchKey(char)}
                  className={`flex-1 max-w-[36px] h-10 rounded-lg font-bold text-sm flex items-center justify-center transition-all cursor-pointer shadow-md select-none touch-manipulation ${
                    isNext
                      ? 'bg-gradient-to-t from-orange-600 to-amber-500 text-white border border-amber-200 ring-2 ring-amber-400/60 scale-105 z-10'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 active:scale-90 active:bg-slate-600'
                  }`}
                >
                  {char}
                </button>
              );
            })}
          </div>

          {/* Fileira 3 com botão de espaço e letras restantes */}
          <div className="flex justify-center gap-1 w-full">
            {/* Tecla Trocar Alvo */}
            <button
              type="button"
              onClick={() => {
                if (canSwitchTarget) onSwitchTarget();
              }}
              disabled={!canSwitchTarget || hasActiveGreen}
              className={`px-2.5 h-10 rounded-lg font-bold text-xs flex items-center justify-center gap-1 border transition-all cursor-pointer shadow-md touch-manipulation ${
                hasActiveGreen || !canSwitchTarget
                  ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                  : 'bg-blue-600 text-white border-blue-400 active:scale-95'
              }`}
            >
              <ArrowLeftRight size={13} />
              <span className="text-[10px]">⇄</span>
            </button>

            {row3.map((char) => {
              const isNext = nextChar?.toUpperCase() === char;
              return (
                <button
                  key={char}
                  type="button"
                  onClick={() => handleTouchKey(char)}
                  className={`flex-1 max-w-[36px] h-10 rounded-lg font-bold text-sm flex items-center justify-center transition-all cursor-pointer shadow-md select-none touch-manipulation ${
                    isNext
                      ? 'bg-gradient-to-t from-orange-600 to-amber-500 text-white border border-amber-200 ring-2 ring-amber-400/60 scale-105 z-10'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 active:scale-90 active:bg-slate-600'
                  }`}
                >
                  {char}
                </button>
              );
            })}

            {/* Tecla de Espaço / Troca Rápida */}
            <button
              type="button"
              onClick={() => {
                if (canSwitchTarget) onSwitchTarget();
              }}
              disabled={!canSwitchTarget || hasActiveGreen}
              className={`px-3 h-10 rounded-lg font-bold text-xs flex items-center justify-center border transition-all cursor-pointer shadow-md touch-manipulation ${
                hasActiveGreen || !canSwitchTarget
                  ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                  : 'bg-slate-700 text-slate-200 border-slate-600 active:bg-slate-600'
              }`}
              title="Espaço"
            >
              Espaço
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
