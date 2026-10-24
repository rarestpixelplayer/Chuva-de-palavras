import React, { useState, useRef, useEffect } from 'react';
import { GameStats, GameMode, GameLanguage, ActiveGameMode } from '../types/game';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  Heart,
  Clock,
  Globe,
  MessageSquare,
  Sparkles,
  Flame,
  Target,
  Shield,
  EyeOff,
  Check,
  GraduationCap,
} from 'lucide-react';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '../utils/i18n';
import { soundManager } from '../utils/sound';

interface HUDProps {
  stats: GameStats;
  lives: number;
  maxLives: number;
  gameMode: GameMode;
  activeGameMode?: ActiveGameMode;
  bonusTimeLeft?: number;
  isTimeAttack?: boolean;
  timeAttackLeft?: number;
  isMuted: boolean;
  language: GameLanguage;
  customMissionText?: string;
  onChangeLanguage: (lang: GameLanguage) => void;
  onToggleSound: () => void;
  onTogglePause: () => void;
  onOpenRules: () => void;
  onOpenFeedback?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  lives,
  maxLives,
  gameMode,
  activeGameMode = 'CLASSIC',
  bonusTimeLeft,
  isTimeAttack = false,
  timeAttackLeft = 60,
  isMuted,
  language = 'pt',
  onChangeLanguage,
  onToggleSound,
  onTogglePause,
  onOpenRules,
  onOpenFeedback,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.pt;

  // Próximo marco de conquista de combo (10x, 25x, 30x, 50x)
  const milestoneTargets = [10, 25, 30, 50];
  const nextMilestone = milestoneTargets.find((m) => m > stats.combo) || 50;
  const prevMilestone = [...milestoneTargets].reverse().find((m) => m <= stats.combo) || 0;
  const span = Math.max(1, nextMilestone - prevMilestone);
  const proximity = Math.min(1, Math.max(0, (stats.combo - prevMilestone) / span));

  // Intensidade do brilho pulsante conforme se aproxima da conquista
  const glowOpacity = stats.combo >= 2 ? Math.min(0.95, 0.25 + proximity * 0.7) : 0;
  const glowSpread = Math.round(3 + proximity * 18);
  const pulseSpeedSec = Math.max(0.45, 1.8 - proximity * 1.3);

  // Contagem regressiva e progresso para o Level Bônus (a cada 28 palavras)
  const wordsUntilBonus = isTimeAttack ? 0 : Math.max(1, 28 - (stats.wordsTyped % 28));
  const bonusProgressPercent = Math.min(100, Math.round(((28 - wordsUntilBonus) / 28) * 100));

  return (
    <div className="absolute top-0 inset-x-0 z-40 flex flex-col select-none">
      {/* Top Header Bar (Estilo do Nível Tutorial) */}
      <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-sky-500/40 px-2 sm:px-6 py-2 flex items-center justify-between gap-2 sm:gap-4 text-white shadow-lg">
        {/* Zone 1: Marca do Jogo & Modo Ativo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className={`p-1.5 sm:p-2 rounded-xl text-slate-950 font-black shadow-md flex items-center justify-center ${
              gameMode === 'BONUS'
                ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950'
                : isTimeAttack
                ? 'bg-gradient-to-br from-sky-400 to-blue-600 text-slate-950'
                : activeGameMode === 'MATH'
                ? 'bg-gradient-to-br from-purple-500 to-indigo-700 text-white'
                : activeGameMode === 'BLINDNESS'
                ? 'bg-gradient-to-br from-violet-600 to-purple-900 text-white'
                : 'bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950'
            }`}
          >
            {gameMode === 'BONUS' ? (
              <Sparkles size={17} className="text-slate-950" />
            ) : isTimeAttack ? (
              <Clock size={17} className="text-slate-950" />
            ) : activeGameMode === 'MATH' ? (
              <span className="font-mono font-black text-sm">∑</span>
            ) : activeGameMode === 'BLINDNESS' ? (
              <EyeOff size={17} className="text-white" />
            ) : (
              <Target size={17} className="text-slate-950" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  gameMode === 'BONUS'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : isTimeAttack
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : activeGameMode === 'MATH'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : activeGameMode === 'BLINDNESS'
                    ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {gameMode === 'BONUS'
                  ? 'RODADA BÔNUS'
                  : isTimeAttack
                  ? `CONTRA O TEMPO: ${timeAttackLeft}s`
                  : activeGameMode === 'MATH'
                  ? 'MODO MATEMÁTICA'
                  : activeGameMode === 'BLINDNESS'
                  ? 'MODO CEGUEIRA'
                  : `MODO CLÁSSICO · NÍVEL ${stats.level}`}
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-black text-white tracking-wide whitespace-nowrap">
              Chuva de Palavras
            </h1>
          </div>
        </div>

      {/* Zone 2: Métricas de Jogo em Tempo Real */}
      <div className="flex items-center gap-2 sm:gap-5 text-xs sm:text-sm font-medium text-slate-300 overflow-x-auto no-scrollbar">
        {/* Pontuação */}
        <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0">
          <span className="text-slate-400 text-[11px] sm:text-xs">{t.score}:</span>
          <span className="font-mono text-sm sm:text-base md:text-lg font-bold text-amber-400 tabular-nums">
            {stats.score.toLocaleString(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'fr-FR')}
          </span>
        </div>

        <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>

        {/* Nível / Fase ou Tempo */}
        <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0">
          <span className="text-slate-400 text-[11px] sm:text-xs">{isTimeAttack ? `${t.time}:` : `${t.level}:`}</span>
          <span
            className={`font-bold font-mono tabular-nums text-xs sm:text-sm ${
              isTimeAttack
                ? timeAttackLeft <= 10
                  ? 'text-red-400 font-black animate-bounce'
                  : 'text-sky-300'
                : 'text-white'
            }`}
          >
            {isTimeAttack ? `${timeAttackLeft}s` : stats.level}
          </span>
        </div>

        <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>

        {/* Combo com Indicador Visual, Medidor e Partículas ao atingir 10x ou mais */}
        <div
          className={`flex flex-col items-start gap-0.5 whitespace-nowrap shrink-0 px-2.5 py-1 rounded-xl transition-all duration-300 border relative ${
            stats.combo >= 2
              ? 'bg-gradient-to-r from-orange-950/70 via-amber-950/60 to-orange-950/70 border-amber-400/60 shadow-lg'
              : 'border-transparent'
          }`}
          style={{
            boxShadow:
              stats.combo >= 2
                ? `0 0 ${glowSpread}px ${glowSpread / 2}px rgba(245, 158, 11, ${glowOpacity}), inset 0 0 8px rgba(251, 191, 36, ${glowOpacity * 0.5})`
                : undefined,
            animation: stats.combo >= 2 ? `pulse ${pulseSpeedSec}s cubic-bezier(0.4, 0, 0.6, 1) infinite` : undefined,
          }}
        >
          {/* Animação de Partículas ao redor do Medidor de Combo (10x ou superior) */}
          {stats.combo >= 10 && (
            <div className="absolute -inset-1.5 pointer-events-none overflow-visible">
              {Array.from({ length: Math.min(12, 6 + Math.floor((stats.combo - 10) / 4)) }).map((_, i) => {
                const total = Math.min(12, 6 + Math.floor((stats.combo - 10) / 4));
                const angle = (i / total) * 360;
                const dist = 16 + (i % 3) * 5;
                const x = Math.cos((angle * Math.PI) / 180) * dist;
                const y = Math.sin((angle * Math.PI) / 180) * dist;
                const delay = (i * 0.12).toFixed(2);
                const isSuper = stats.combo >= 25;
                return (
                  <span
                    key={i}
                    className={`absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full animate-ping ${
                      isSuper
                        ? 'bg-amber-300 shadow-[0_0_8px_#f59e0b]'
                        : 'bg-orange-400 shadow-[0_0_6px_#ea580c]'
                    }`}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                      animationDuration: `${Math.max(0.5, 1.2 - stats.combo * 0.012)}s`,
                      animationDelay: `${delay}s`,
                      opacity: 0.85,
                    }}
                  />
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-1 sm:gap-1.5 relative z-10">
            <span className="text-slate-400 text-[11px] sm:text-xs">{t.combo}:</span>
            <span
              className={`font-mono font-black text-xs sm:text-sm tabular-nums flex items-center gap-1 ${
                stats.combo >= 25
                  ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                  : stats.combo >= 10
                  ? 'text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]'
                  : stats.combo >= 4
                  ? 'text-amber-400'
                  : 'text-slate-200'
              }`}
            >
              {stats.combo >= 10 ? (
                <Flame size={14} className="text-orange-400 fill-orange-400 animate-bounce" />
              ) : stats.combo >= 4 ? (
                <span className="text-xs animate-bounce">🔥</span>
              ) : null}
              <span>{stats.combo}x</span>
            </span>
            <span className="text-[9px] text-amber-200 font-bold hidden sm:inline bg-amber-500/20 px-1 rounded-sm border border-amber-400/30">
              {nextMilestone - stats.combo} p/ {nextMilestone}x
            </span>
          </div>

          {/* Barra Visual de Medidor do Combo que preenche com o Streak */}
          <div
            className="w-14 sm:w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 relative"
            title={`Faltam ${nextMilestone - stats.combo} acertos para a conquista de ${nextMilestone}x!`}
          >
            <div
              className={`h-full rounded-full transition-all duration-150 ${
                stats.combo >= 25
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 shadow-[0_0_6px_#f59e0b]'
                  : stats.combo >= 10
                  ? 'bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 shadow-[0_0_4px_#ea580c]'
                  : 'bg-gradient-to-r from-orange-600 to-amber-500'
              }`}
              style={{ width: `${Math.max(8, proximity * 100)}%` }}
            />
          </div>
        </div>

        <span className="text-slate-600 hidden md:inline" aria-hidden="true">·</span>

        {/* WPM / PPM */}
        <div className="hidden md:flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <span className="text-slate-400 text-[11px]">{t.wpm}:</span>
          <span className="font-mono font-bold text-slate-200 tabular-nums">
            {stats.wpm}
          </span>
        </div>

        <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>

        {/* Vidas */}
        <div className="flex items-center gap-1 whitespace-nowrap shrink-0">
          {isTimeAttack ? (
            <span className="text-[10px] sm:text-xs font-bold text-sky-300 bg-sky-500/20 border border-sky-400/40 px-2 py-0.5 rounded-full">
              {t.noLives}
            </span>
          ) : (
            <>
              <span className="text-slate-400 text-[11px] mr-0.5 hidden sm:inline">{t.lives}:</span>
              <div className="flex items-center gap-0.5 sm:gap-1">
                {Array.from({ length: maxLives }).map((_, i) => (
                  <Heart
                    key={i}
                    size={15}
                    className={`transition-all duration-300 ${
                      i < lives
                        ? 'text-red-500 fill-red-500 filter drop-shadow scale-100 animate-pulse'
                        : 'text-slate-600 fill-slate-800/50 scale-75 opacity-40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Zone 3: Ações de Jogo */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {onOpenFeedback && (
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onOpenFeedback();
            }}
            title="Feedback"
            className="text-xs text-sky-300 hover:text-white p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-sky-500/40 hover:bg-sky-500/20 transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer shadow-xs"
          >
            <MessageSquare size={14} className="shrink-0" />
            <span className="hidden sm:inline">Feedback</span>
          </button>
        )}

        <button
          onClick={onOpenRules}
          title={t.rules}
          className="text-xs text-slate-300 hover:text-white px-2 py-1.5 rounded-lg border border-slate-700/80 hover:bg-slate-800 transition-colors hidden sm:block whitespace-nowrap cursor-pointer"
        >
          {t.rules}
        </button>

        <button
          onClick={onToggleSound}
          title={isMuted ? 'Mute' : 'Unmute'}
          className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer"
          aria-label={isMuted ? 'Sound Off' : 'Sound On'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {gameMode === 'PLAYING' || gameMode === 'BONUS' ? (
          <button
            onClick={onTogglePause}
            title={t.paused}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 border border-slate-600 transition-colors cursor-pointer"
            aria-label={t.paused}
          >
            <Pause size={16} />
          </button>
        ) : gameMode === 'PAUSED' ? (
          <button
            onClick={onTogglePause}
            title={t.resumeGame}
            className="p-1.5 sm:p-2 rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors cursor-pointer"
            aria-label={t.resumeGame}
          >
            <Play size={16} />
          </button>
        ) : null}
      </div>

      {/* Barra de Progresso do Level Bônus (Contador de quantas palavras faltam para o bônus) */}
      {!isTimeAttack && (gameMode === 'PLAYING' || gameMode === 'BONUS') && (
        <div className="absolute top-full right-4 sm:right-6 mt-1 z-35 flex items-center gap-2 bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/50 shadow-xl text-[10px] sm:text-xs select-none animate-in fade-in slide-in-from-top-1">
          <Sparkles size={13} className="text-amber-400 fill-amber-300 animate-pulse shrink-0" />
          <span className="text-slate-200 font-medium whitespace-nowrap">
            {gameMode === 'BONUS' ? (
              <span className="text-amber-300 font-black tracking-wide">⭐ RODADA BÔNUS ATIVA!</span>
            ) : (
              <>
                Level Bônus: <strong className="text-amber-300 font-black font-mono">{wordsUntilBonus}</strong> {wordsUntilBonus === 1 ? 'restante' : 'restantes'}
              </>
            )}
          </span>
          {gameMode !== 'BONUS' && (
            <div
              className="w-16 sm:w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-amber-500/40 shrink-0"
              title={`Faltam ${wordsUntilBonus} palavras para o Level Bônus!`}
            >
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-300 shadow-[0_0_6px_#f59e0b]"
                style={{ width: `${bonusProgressPercent}%` }}
              />
            </div>
          )}
        </div>
      )}
      </header>

      {/* Zone 4: Banner de Missão Ativa do Level (Estilo Nível Tutorial) */}
      <div className="w-full bg-gradient-to-r from-[#001f3f] via-[#003366] to-[#001f3f] border-b border-sky-400/40 px-3 py-1.5 text-center text-xs text-sky-100 flex items-center justify-center gap-2 shadow-inner z-35">
        <Sparkles size={14} className="text-amber-400 shrink-0 animate-pulse" />
        <span className="font-semibold text-[11px] sm:text-xs">
          {gameMode === 'BONUS' ? (
            <span className="text-amber-300 font-black">
              ⭐ <strong>RODADA BÔNUS ATIVA!</strong> Palavras douradas com pontuação multiplicada!
            </span>
          ) : isTimeAttack ? (
            <span>
              ⚡ <strong>MISSÃO:</strong> Elimine o maior número de palavras antes que os <strong>60 segundos</strong> acabem!
            </span>
          ) : activeGameMode === 'MATH' ? (
            <span>
              ∑ <strong>MISSÃO:</strong> Calcule o resultado da operação matemática e digite o número correto!
            </span>
          ) : activeGameMode === 'BLINDNESS' ? (
            <span>
              👁️ <strong>MISSÃO:</strong> As palavras desaparecem na descida! Memorize a grafia e digite de cabeça!
            </span>
          ) : (
            <span>
              🎯 <strong>MISSÃO (NÍVEL {stats.level}):</strong> Defenda a base contra a chuva de palavras! Mantenha o combo para ativar o Level Bônus.
            </span>
          )}
        </span>
      </div>
    </div>
  );
};
