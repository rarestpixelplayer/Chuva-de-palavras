import React from 'react';
import { GameStats, GameLanguage } from '../types/game';
import { RotateCcw, Trophy, Target, Zap, Clock, Home } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { TRANSLATIONS } from '../utils/i18n';

interface GameOverModalProps {
  stats: GameStats;
  isNewRecord: boolean;
  isTimeAttack?: boolean;
  language?: GameLanguage;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  isNewRecord,
  isTimeAttack = false,
  language = 'pt',
  onRestart,
  onHome,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.pt;
  const locale = language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'fr-FR';

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-white text-center">
        {/* Ícone de troféu ou término */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
          {isTimeAttack ? <Clock size={32} /> : <Trophy size={32} />}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
          {isTimeAttack ? (language === 'en' ? 'Time Up!' : language === 'es' ? '¡Tiempo Agotado!' : language === 'fr' ? 'Temps Écoulé !' : 'Tempo Esgotado!') : t.gameOverTitle}
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          {t.gameOverSubtitle}
        </p>

        {isNewRecord && (
          <div className="mb-6 py-2 px-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-yellow-500/50 rounded-xl text-yellow-300 font-bold text-sm tracking-wide animate-pulse">
            {t.newRecord}
          </div>
        )}

        {/* Grade de estatísticas com números tabulares */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-left">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">{t.score}</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {stats.score.toLocaleString(locale)}
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">{t.score} Max</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-200 tabular-nums">
              {stats.highScore.toLocaleString(locale)}
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">{t.level}</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">
              {stats.level}
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
              <Clock size={12} />
              <span>{t.wpm}</span>
            </div>
            <span className="text-lg sm:text-xl font-bold font-mono text-slate-200 tabular-nums">
              {stats.wpm} <span className="text-xs font-normal text-slate-400">{t.wpm}</span>
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
              <Target size={12} />
              <span>{t.accuracy}</span>
            </div>
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {stats.accuracy}%
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
              <Zap size={12} />
              <span>{t.maxCombo}</span>
            </div>
            <span className="text-lg sm:text-xl font-bold font-mono text-orange-400 tabular-nums">
              {stats.maxCombo}x
            </span>
          </div>
        </div>

        {/* Resumo de palavras */}
        <div className="text-xs text-slate-400 mb-6 flex justify-around border-t border-slate-800 pt-4">
          <span>{t.wordsTyped}: <strong className="text-white">{stats.wordsTyped}</strong></span>
          <span>{t.bonus}: <strong className="text-amber-400">{stats.bonusWordsTyped}</strong></span>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onRestart();
            }}
            className="flex-1 py-3 px-5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 text-base active:scale-98 cursor-pointer"
          >
            <RotateCcw size={18} />
            <span>{t.playAgain}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onHome();
            }}
            className="py-3 px-5 rounded-xl font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <Home size={16} />
            <span>{t.mainMenu}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
