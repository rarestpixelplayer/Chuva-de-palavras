import React, { useState } from 'react';
import {
  X,
  Volume2,
  Volume1,
  VolumeX,
  Keyboard,
  Trophy,
  Trash2,
  HelpCircle,
  Check,
  Settings,
  Sparkles,
  Play,
  AlertTriangle,
  Crosshair,
  Sliders,
  Music,
  Sun,
  Sunset,
  Moon,
  Type,
  RotateCcw,
  Globe,
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import {
  ScreenShakeSetting,
  SkyTheme,
  WordFontSize,
  GameLanguage,
} from '../types/game';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '../utils/i18n';

interface SettingsModalProps {
  isMuted: boolean;
  onToggleSound: () => void;
  volume: number;
  onChangeVolume: (val: number) => void;
  musicVolume?: number;
  onChangeMusicVolume?: (val: number) => void;
  melodicTyping: boolean;
  onToggleMelodicTyping: () => void;
  screenShakeSetting: ScreenShakeSetting;
  onChangeScreenShakeSetting: (setting: ScreenShakeSetting) => void;
  skyTheme: SkyTheme;
  onChangeSkyTheme: (theme: SkyTheme) => void;
  wordFontSize: WordFontSize;
  onChangeWordFontSize: (size: WordFontSize) => void;
  showParticles: boolean;
  onToggleParticles: () => void;
  showSkyParticles: boolean;
  onToggleSkyParticles: () => void;
  language?: GameLanguage;
  highScore: number;
  timeAttackHighScore: number;
  reflexHighScore: number;
  onResetHighScores: () => void;
  onResetTutorials: () => void;
  onOpenRules: () => void;
  onClose: () => void;
}

type TabType = 'audio' | 'gameplay' | 'visual' | 'data';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isMuted,
  onToggleSound,
  volume,
  onChangeVolume,
  musicVolume = 0.4,
  onChangeMusicVolume,
  melodicTyping,
  onToggleMelodicTyping,
  screenShakeSetting,
  onChangeScreenShakeSetting,
  skyTheme,
  onChangeSkyTheme,
  wordFontSize,
  onChangeWordFontSize,
  showParticles,
  onToggleParticles,
  showSkyParticles,
  onToggleSkyParticles,
  language = 'pt',
  highScore,
  timeAttackHighScore,
  reflexHighScore,
  onResetHighScores,
  onResetTutorials,
  onOpenRules,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('audio');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [tutorialSuccessMessage, setTutorialSuccessMessage] = useState<string | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.pt;

  const handleResetScoresClick = () => {
    onResetHighScores();
    setShowConfirmReset(false);
    setResetSuccessMessage('Recordes zerados com sucesso!');
    setTimeout(() => {
      setResetSuccessMessage(null);
    }, 2500);
  };

  const handleResetTutorialsClick = () => {
    onResetTutorials();
    setTutorialSuccessMessage(t.resetTutorialsDesc);
    setTimeout(() => {
      setTutorialSuccessMessage(null);
    }, 2500);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-gradient-to-b from-[#002244] via-[#002f5c] to-[#004282] border-4 border-indigo-400 rounded-3xl p-4 sm:p-6 max-w-xl w-full text-white shadow-2xl shadow-indigo-950/90 relative overflow-hidden flex flex-col gap-4 max-h-[92vh]">
        {/* Brilho decorativo no topo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 h-24 bg-indigo-400/20 rounded-full blur-xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/40 rounded-xl text-indigo-300">
              <Settings size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                {t.settingsTitle}
              </h2>
              <p className="text-xs text-indigo-200/80">
                {t.settingsSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-indigo-300 hover:text-white hover:bg-indigo-500/20 transition-colors cursor-pointer border border-indigo-500/20"
            aria-label={t.close}
          >
            <X size={20} />
          </button>
        </div>

        {/* Barra de Navegação por Abas (4 abas com ícones e textos) */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/60 rounded-xl border border-indigo-500/30 relative z-10 text-[11px] sm:text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('audio');
            }}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'audio'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-indigo-200 hover:text-white hover:bg-indigo-500/10'
            }`}
          >
            <Volume2 size={13} />
            <span className="hidden sm:inline">{t.tabAudio}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('gameplay');
            }}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'gameplay'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-indigo-200 hover:text-white hover:bg-indigo-500/10'
            }`}
          >
            <Crosshair size={13} />
            <span className="hidden sm:inline">{t.tabCannon}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('visual');
            }}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-indigo-200 hover:text-white hover:bg-indigo-500/10'
            }`}
          >
            <Sparkles size={13} />
            <span className="hidden sm:inline">{t.tabVisuals}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('data');
            }}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'data'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-indigo-200 hover:text-white hover:bg-indigo-500/10'
            }`}
          >
            <Trophy size={13} />
            <span className="hidden sm:inline">{t.tabData}</span>
          </button>
        </div>

        {/* Conteúdo da Aba Ativa */}
        <div className="flex-1 overflow-y-auto no-scrollbar pr-1 relative z-10 space-y-3.5">
          {/* ===================== ABA 1: ÁUDIO ===================== */}
          {activeTab === 'audio' && (
            <div className="space-y-3">
              {/* Volume Master Slider */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-indigo-400/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-200 font-bold">
                    {volume === 0 || isMuted ? (
                      <VolumeX size={18} className="text-red-400" />
                    ) : volume < 0.5 ? (
                      <Volume1 size={18} className="text-amber-400" />
                    ) : (
                      <Volume2 size={18} className="text-emerald-400" />
                    )}
                    <span>{t.volumeLabel}</span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-indigo-500/40 text-amber-300">
                    {Math.round(volume * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onChangeVolume(val);
                    }}
                    className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Volume Música de Fundo 8-Bit */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-indigo-400/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-200 font-bold">
                    <Music size={18} className="text-pink-400" />
                    <span>Música de Fundo 8-Bit (BGM)</span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-indigo-500/40 text-pink-300">
                    {Math.round(musicVolume * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={musicVolume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onChangeMusicVolume?.(val);
                    }}
                    className="w-full accent-pink-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Digitação Melódica Dinâmica */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-indigo-400/30 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-indigo-200 font-bold">
                    <Music size={18} className="text-sky-400" />
                    <span>{t.melodicTypingLabel}</span>
                  </div>
                  <p className="text-xs text-indigo-300/70">
                    {t.melodicTypingDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    onToggleMelodicTyping();
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer border ${
                    melodicTyping
                      ? 'bg-emerald-600 border-emerald-400 justify-end'
                      : 'bg-slate-800 border-slate-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>
          )}

          {/* ===================== ABA 2: JOGABILIDADE ===================== */}
          {activeTab === 'gameplay' && (
            <div className="space-y-3">


              {/* Tremor de Tela (Screen Shake) */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-indigo-400/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-200 font-bold">
                    <Sliders size={18} className="text-pink-400" />
                    <span>{t.screenShakeLabel}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      onChangeScreenShakeSetting('high');
                    }}
                    className={`py-2 rounded-xl border font-bold transition-all cursor-pointer ${
                      screenShakeSetting === 'high'
                        ? 'bg-pink-600/30 border-pink-400 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-700 text-indigo-200 hover:bg-slate-900'
                    }`}
                  >
                    {t.shakeHigh}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      onChangeScreenShakeSetting('low');
                    }}
                    className={`py-2 rounded-xl border font-bold transition-all cursor-pointer ${
                      screenShakeSetting === 'low'
                        ? 'bg-pink-600/30 border-pink-400 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-700 text-indigo-200 hover:bg-slate-900'
                    }`}
                  >
                    {t.shakeLow}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      onChangeScreenShakeSetting('off');
                    }}
                    className={`py-2 rounded-xl border font-bold transition-all cursor-pointer ${
                      screenShakeSetting === 'off'
                        ? 'bg-slate-800 border-slate-500 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-700 text-indigo-200 hover:bg-slate-900'
                    }`}
                  >
                    {t.shakeOff}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== ABA 3: VISUAIS ===================== */}
          {activeTab === 'visual' && (
            <div className="space-y-3">
              {/* Tema do Céu */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-indigo-400/30 space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-200 font-bold">
                  <Sun size={18} className="text-yellow-400" />
                  <span>{t.skyThemeLabel}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      onChangeSkyTheme('day');
                    }}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      skyTheme === 'day'
                        ? 'bg-sky-500/30 border-sky-300 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-700 text-indigo-200 hover:bg-slate-900'
                    }`}
                  >
                    <Sun size={18} className="mx-auto mb-1 text-sky-300" />
                    <span className="font-bold text-xs block">{t.themeDay}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      onChangeSkyTheme('sunset');
                    }}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      skyTheme === 'sunset'
                        ? 'bg-orange-500/30 border-orange-300 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-700 text-indigo-200 hover:bg-slate-900'
                    }`}
                  >
                    <Sunset size={18} className="mx-auto mb-1 text-orange-400" />
                    <span className="font-bold text-xs block">{t.themeSunset}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      onChangeSkyTheme('night');
                    }}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      skyTheme === 'night'
                        ? 'bg-indigo-600/40 border-indigo-300 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-700 text-indigo-200 hover:bg-slate-900'
                    }`}
                  >
                    <Moon size={18} className="mx-auto mb-1 text-indigo-300" />
                    <span className="font-bold text-xs block">{t.themeNight}</span>
                  </button>
                </div>
              </div>

              {/* Tamanho da Fonte das Palavras */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-indigo-400/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-200 font-bold">
                    <Type size={18} className="text-emerald-400" />
                    <span>{t.fontSizeLabel}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      onChangeWordFontSize('normal');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      wordFontSize === 'normal'
                        ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-700 text-indigo-200 hover:bg-slate-900'
                    }`}
                  >
                    {t.fontNormal}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      onChangeWordFontSize('large');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      wordFontSize === 'large'
                        ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-700 text-indigo-200 hover:bg-slate-900'
                    }`}
                  >
                    {t.fontLarge}
                  </button>
                </div>
              </div>

              {/* Partículas e Detritos de Explosão */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-indigo-400/30 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-indigo-200 font-bold">
                    <Sparkles size={18} className="text-yellow-400" />
                    <span>{t.particlesLabel}</span>
                  </div>
                  <p className="text-xs text-indigo-300/70">
                    {t.particlesDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    onToggleParticles();
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer border ${
                    showParticles
                      ? 'bg-yellow-500 border-yellow-300 justify-end'
                      : 'bg-slate-800 border-slate-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Efeitos do Céu: Neve e Estrelas Cadentes */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-indigo-400/30 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-indigo-200 font-bold">
                    <Sparkles size={18} className="text-sky-300" />
                    <span>Efeitos do Céu (Neve & Estrelas Cadentes)</span>
                  </div>
                  <p className="text-xs text-indigo-300/70">
                    Partículas ambientais imersivas de neve suave e estrelas cadentes riscando o céu.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    onToggleSkyParticles();
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer border ${
                    showSkyParticles
                      ? 'bg-sky-500 border-sky-300 justify-end'
                      : 'bg-slate-800 border-slate-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>
          )}

          {/* ===================== ABA 5: DADOS & GUIA ===================== */}
          {activeTab === 'data' && (
            <div className="space-y-3">
              {/* Recordes Atuais */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-indigo-400/30 space-y-2">
                <div className="flex items-center gap-2 text-indigo-200 font-bold">
                  <Trophy size={18} className="text-amber-400" />
                  <span>Recordes Armazenados Localmente</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-sans">Clássico</span>
                    <span className="text-sm font-bold text-amber-300">{highScore}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-sans">Tempo</span>
                    <span className="text-sm font-bold text-sky-300">{timeAttackHighScore}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-sans">Reflexo</span>
                    <span className="text-sm font-bold text-emerald-300">{reflexHighScore}</span>
                  </div>
                </div>
              </div>

              {/* Botão de Zerar Recordes */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-indigo-400/30 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-xs sm:text-sm text-red-200 block">
                    {t.resetScores}
                  </span>
                  <span className="text-xs text-indigo-300/70">
                    {t.resetScoresDesc}
                  </span>
                </div>
                {!showConfirmReset ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(true)}
                    className="py-1.5 px-3 rounded-xl bg-red-600/80 hover:bg-red-600 border border-red-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Zerar</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleResetScoresClick}
                      className="py-1.5 px-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs cursor-pointer"
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmReset(false)}
                      className="py-1.5 px-2 rounded-xl bg-slate-800 text-slate-300 text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              {/* Reativar Tutoriais */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-indigo-400/30 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-xs sm:text-sm text-indigo-100 block">
                    {t.resetTutorials}
                  </span>
                  <span className="text-xs text-indigo-300/70">
                    {t.resetTutorialsDesc}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetTutorialsClick}
                  className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reativar</span>
                </button>
              </div>

              {tutorialSuccessMessage && (
                <div className="p-2 rounded-xl bg-emerald-600/30 border border-emerald-400 text-emerald-200 text-xs text-center font-bold">
                  {tutorialSuccessMessage}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="pt-2 border-t border-indigo-500/20 flex items-center justify-between relative z-10">
          <button
            type="button"
            onClick={onOpenRules}
            className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white transition-colors cursor-pointer"
          >
            <HelpCircle size={15} />
            <span>{t.rules}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-md cursor-pointer flex items-center gap-1"
          >
            <Check size={15} />
            <span>{t.close}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
