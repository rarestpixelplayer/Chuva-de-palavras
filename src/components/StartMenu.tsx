import React, { useEffect } from 'react';
import { Difficulty, WordCategory, ActiveGameMode, GameLanguage } from '../types/game';
import {
  Trophy,
  Clock,
  Zap,
  Target,
  Shield,
  Award,
  Flame,
  User as UserIcon,
  LogIn,
  CheckCircle2,
  Sparkles,
  Gift,
  MessageSquare,
  GraduationCap,
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import { TRANSLATIONS } from '../utils/i18n';
import { UserProfileData } from '../services/firebase';

interface StartMenuProps {
  difficulty: Difficulty;
  category: WordCategory;
  activeGameMode: ActiveGameMode;
  highScore: number;
  timeAttackHighScore: number;
  reflexHighScore: number;
  language?: GameLanguage;
  dailyStreak: number;
  userProfile: UserProfileData | null;
  hasClaimedDailyBonusToday?: boolean;
  onOpenCustomize: () => void;
  onOpenModes: () => void;
  onOpenSettings: () => void;
  onOpenRankings: () => void;
  onOpenMissions: () => void;
  onOpenAchievements: () => void;
  onOpenInventory: () => void;
  onOpenDailyBonus: () => void;
  onOpenFeedback: () => void;
  onOpenAuth: () => void;
  onStartGame: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  difficulty,
  category,
  activeGameMode,
  highScore,
  timeAttackHighScore,
  reflexHighScore,
  language = 'pt',
  dailyStreak,
  userProfile,
  hasClaimedDailyBonusToday = false,
  onOpenCustomize,
  onOpenModes,
  onOpenSettings,
  onOpenRankings,
  onOpenMissions,
  onOpenAchievements,
  onOpenInventory,
  onOpenDailyBonus,
  onOpenFeedback,
  onOpenAuth,
  onStartGame,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.pt;

  // Atalho: pressionar Enter inicia a partida imediatamente
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        soundManager.playButtonClick();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStartGame]);

  const currentRecord =
    activeGameMode === 'CLASSIC'
      ? highScore
      : activeGameMode === 'TIME_ATTACK'
      ? timeAttackHighScore
      : reflexHighScore;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#002244] via-[#002f5c] to-[#004282] border-4 border-sky-400 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-[#001833]/90 flex flex-col items-center justify-center text-center gap-3.5 sm:gap-4 relative overflow-hidden max-h-[95vh] overflow-y-auto no-scrollbar">
        {/* Brilho decorativo no topo */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-sky-400/25 rounded-full blur-2xl pointer-events-none" />

        {/* Barra de Perfil e Daily Streak no Topo */}
        <div className="w-full flex items-center justify-between p-2 rounded-2xl bg-slate-950/70 border border-sky-400/30 relative z-10 shadow-inner text-xs">
          {/* Badge de Daily Streak */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black shadow-sm">
            <Flame size={15} className="fill-amber-300 text-amber-200 animate-pulse" />
            <span className="text-[11px] uppercase tracking-wide">
              Daily streak: {dailyStreak} {dailyStreak === 1 ? 'dia' : 'dias'}
            </span>
          </div>

          {/* Perfil do Jogador / Login */}
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              onOpenAuth();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-200 border border-sky-400/40 font-bold transition-all cursor-pointer hover:border-amber-400"
          >
            {userProfile ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-white max-w-[100px] truncate">@{userProfile.username}</span>
              </>
            ) : (
              <>
                <LogIn size={13} className="text-amber-400" />
                <span className="text-amber-300">Entrar</span>
              </>
            )}
          </button>
        </div>

        {/* Título Principal */}
        <div className="space-y-0.5 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-wider leading-none uppercase drop-shadow-md">
            {t.appNameLine1}
          </h1>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-sky-400 tracking-wider leading-none uppercase drop-shadow-md">
            {t.appNameLine2}
          </h1>
          <p className="text-[11px] sm:text-xs text-sky-200/80 font-medium">
            {t.appSubtitle}
          </p>
        </div>

        {/* Botão JOGAR em destaque */}
        <div className="w-full flex flex-col items-center gap-2.5 relative z-10">
          <button
            type="button"
            onMouseEnter={() => soundManager.playButtonHover()}
            onClick={() => {
              soundManager.playButtonClick();
              onStartGame();
            }}
            className="w-full max-w-xs py-3.5 sm:py-4 px-6 border-4 border-emerald-400 bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:text-slate-950 active:scale-95 transition-all font-black text-2xl sm:text-3xl tracking-widest uppercase cursor-pointer rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center hover:shadow-emerald-400/50"
          >
            {t.play}
          </button>

          {/* Grade com Modos e Customizar */}
          <div className="w-full max-w-xs grid grid-cols-2 gap-2">
            <button
              type="button"
              onMouseEnter={() => soundManager.playButtonHover()}
              onClick={() => {
                soundManager.playButtonClick();
                onOpenModes();
              }}
              className="py-2.5 px-3 border-2 border-indigo-400 bg-[#3b5998] hover:bg-[#4c70ba] text-white active:scale-95 transition-all font-bold text-xs sm:text-sm tracking-wide uppercase cursor-pointer rounded-xl shadow-md flex items-center justify-center gap-1.5"
            >
              <Clock size={16} />
              <span>{t.modes}</span>
            </button>

            <button
              type="button"
              onMouseEnter={() => soundManager.playButtonHover()}
              onClick={() => {
                soundManager.playButtonClick();
                onOpenCustomize();
              }}
              className="py-2.5 px-3 border-2 border-orange-400 bg-orange-600 hover:bg-orange-500 text-white active:scale-95 transition-all font-bold text-xs sm:text-sm tracking-wide uppercase cursor-pointer rounded-xl shadow-md flex items-center justify-center gap-1.5"
            >
              <Sparkles size={16} />
              <span>{t.customize}</span>
            </button>
          </div>

          {/* Grade de 4 Recursos Especiais (Ranking, Missões, Conquistas, Arsenal) */}
          <div className="w-full max-w-xs grid grid-cols-2 gap-2">
            {/* Ranking */}
            <button
              type="button"
              onMouseEnter={() => soundManager.playButtonHover()}
              onClick={() => {
                soundManager.playButtonClick();
                onOpenRankings();
              }}
              className="py-2 px-2.5 border border-amber-400/60 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Trophy size={15} />
              <span>Ranking</span>
            </button>

            {/* Missões Diárias */}
            <button
              type="button"
              onMouseEnter={() => soundManager.playButtonHover()}
              onClick={() => {
                soundManager.playButtonClick();
                onOpenMissions();
              }}
              className="py-2 px-2.5 border border-emerald-400/60 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Target size={15} />
              <span>Missões</span>
            </button>

            {/* Bônus Diário */}
            <button
              type="button"
              onMouseEnter={() => soundManager.playButtonHover()}
              onClick={() => {
                soundManager.playButtonClick();
                onOpenDailyBonus();
              }}
              className="py-2 px-2.5 border border-amber-300/70 bg-gradient-to-r from-amber-900/50 to-orange-950/50 hover:from-amber-800/60 hover:to-orange-900/60 text-amber-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs relative overflow-hidden"
            >
              {!hasClaimedDailyBonusToday && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
              <Gift size={15} className={!hasClaimedDailyBonusToday ? 'animate-bounce text-amber-300' : 'text-amber-400'} />
              <span>Bônus Diário</span>
            </button>

            {/* Conquistas */}
            <button
              type="button"
              onMouseEnter={() => soundManager.playButtonHover()}
              onClick={() => {
                soundManager.playButtonClick();
                onOpenAchievements();
              }}
              className="py-2 px-2.5 border border-yellow-400/60 bg-yellow-950/40 hover:bg-yellow-900/60 text-yellow-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Award size={15} />
              <span>Conquistas</span>
            </button>

            {/* Arsenal / Inventário de Canhões */}
            <button
              type="button"
              onMouseEnter={() => soundManager.playButtonHover()}
              onClick={() => {
                soundManager.playButtonClick();
                onOpenInventory();
              }}
              className="py-2 px-2.5 border border-indigo-400/60 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Shield size={15} />
              <span>Arsenal</span>
            </button>

            {/* Botão de Feedback */}
            <button
              type="button"
              onMouseEnter={() => soundManager.playButtonHover()}
              onClick={() => {
                soundManager.playButtonClick();
                onOpenFeedback();
              }}
              className="py-2 px-2.5 border border-sky-400/60 bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <MessageSquare size={15} />
              <span>Feedback</span>
            </button>
          </div>

          {/* Configurações */}
          <button
            type="button"
            onMouseEnter={() => soundManager.playButtonHover()}
            onClick={() => {
              soundManager.playButtonClick();
              onOpenSettings();
            }}
            className="w-full max-w-xs py-2 px-4 border border-sky-400/50 bg-[#001833]/70 hover:bg-[#002244] text-sky-200 active:scale-95 transition-all font-semibold text-xs tracking-wide cursor-pointer rounded-xl shadow-xs"
          >
            {t.settings}
          </button>
        </div>

        {/* Rodapé com Recorde Atual */}
        <div className="w-full flex items-center justify-center gap-2 pt-1 border-t border-sky-500/20 text-xs text-sky-200 relative z-10">
          <Trophy size={14} className="text-amber-400" />
          <span>
            {activeGameMode === 'CLASSIC'
              ? `${t.score} Recorde:`
              : activeGameMode === 'TIME_ATTACK'
              ? `${t.score} Contra o Tempo:`
              : activeGameMode === 'REFLEX'
              ? `${t.score} Reflexo:`
              : activeGameMode === 'MATH'
              ? `${t.score} Matemática:`
              : `${t.score} Duelo:`}
          </span>
          <span className="font-bold text-amber-400 font-mono">
            {currentRecord.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
