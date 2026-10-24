import React from 'react';
import { Difficulty, WordCategory, GameLanguage, WordSpawnRates } from '../types/game';
import { X, Sparkles, Trees, Cpu, Apple, Orbit, Check, Layers, RotateCcw, Zap, Globe, Keyboard } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '../utils/i18n';

interface CustomizeModalProps {
  category: WordCategory;
  onChangeCategory: (cat: WordCategory) => void;
  difficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
  spawnRates: WordSpawnRates;
  onChangeSpawnRate: (type: 'normal' | 'blue' | 'green', rate: number) => void;
  accentTolerant: boolean;
  onToggleAccentTolerant: () => void;
  language?: GameLanguage;
  onChangeLanguage?: (lang: GameLanguage) => void;
  onClose: () => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  category,
  onChangeCategory,
  difficulty,
  onChangeDifficulty,
  spawnRates,
  onChangeSpawnRate,
  accentTolerant,
  onToggleAccentTolerant,
  language = 'pt',
  onChangeLanguage,
  onClose,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.pt;

  const categories: { id: WordCategory; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'todas',
      label: t.catAll,
      desc: t.catAllDesc,
      icon: <Sparkles size={17} className="text-amber-500" />,
    },
    {
      id: 'natureza',
      label: t.catNature,
      desc: t.catNatureDesc,
      icon: <Trees size={17} className="text-emerald-500" />,
    },
    {
      id: 'tecnologia',
      label: t.catTech,
      desc: t.catTechDesc,
      icon: <Cpu size={17} className="text-blue-500" />,
    },
    {
      id: 'alimentos',
      label: t.catFood,
      desc: t.catFoodDesc,
      icon: <Apple size={17} className="text-rose-500" />,
    },
    {
      id: 'espaco',
      label: t.catSpace,
      desc: t.catSpaceDesc,
      icon: <Orbit size={17} className="text-purple-500" />,
    },
  ];

  const difficulties: {
    id: Difficulty;
    label: string;
    speedDesc: string;
    lives: number;
    color: string;
  }[] = [
    { id: 'bebe', label: t.diffBaby, speedDesc: t.diffBabyDesc, lives: 5, color: 'border-pink-300 text-pink-700 bg-pink-50' },
    { id: 'facil', label: t.diffEasy, speedDesc: t.diffEasyDesc, lives: 4, color: 'border-emerald-300 text-emerald-700 bg-emerald-50' },
    { id: 'normal', label: t.diffNormal, speedDesc: t.diffNormalDesc, lives: 3, color: 'border-blue-300 text-blue-700 bg-blue-50' },
    { id: 'media', label: t.diffMedium, speedDesc: t.diffMediumDesc, lives: 3, color: 'border-indigo-300 text-indigo-700 bg-indigo-50' },
    { id: 'dificil', label: t.diffHard, speedDesc: t.diffHardDesc, lives: 3, color: 'border-orange-300 text-orange-700 bg-orange-50' },
    { id: 'speed_typer', label: t.diffSpeedTyper, speedDesc: t.diffSpeedTyperDesc, lives: 2, color: 'border-red-400 text-red-700 bg-red-50' },
  ];

  const percentageSteps = [0, 25, 50, 75, 100];

  const renderPercentageSlider = (
    type: 'normal' | 'blue' | 'green',
    title: string,
    desc: string,
    value: number,
    icon: React.ReactNode,
    colorClass: string
  ) => {
    return (
      <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/90 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border font-bold text-sm ${colorClass}`}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-slate-900">{title}</span>
                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-sm ${
                  value === 0 ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {value === 0 ? '0% (Desativada)' : `${value}% de aparecimento`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{desc}</p>
            </div>
          </div>
        </div>

        {/* Linha com bola deslizante de porcentagem (0%, 25%, 50%, 75%, 100%) */}
        <div className="px-2 pt-1 pb-2">
          <div className="relative flex items-center w-full">
            {/* Linha de fundo */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-150"
                style={{ width: `${value}%` }}
              />
            </div>

            {/* Input range invisível posicionado por cima para clique e arraste com o mouse */}
            <input
              type="range"
              min="0"
              max="100"
              step="25"
              value={value}
              onChange={(e) => {
                const nextVal = parseInt(e.target.value, 10);
                soundManager.playButtonClick();
                onChangeSpawnRate(type, nextVal);
              }}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-6 z-20"
            />

            {/* Bola de arraste com mouse */}
            <div
              className="absolute w-5 h-5 bg-white border-3 border-orange-500 rounded-full shadow-md pointer-events-none transform -translate-x-1/2 transition-all duration-150 z-10 flex items-center justify-center"
              style={{ left: `${value}%` }}
            >
              <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
            </div>
          </div>

          {/* Marcadores de passos (0%, 25%, 50%, 75%, 100%) */}
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mt-2 px-1">
            {percentageSteps.map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  onChangeSpawnRate(type, step);
                }}
                className={`transition-colors cursor-pointer hover:text-slate-800 ${
                  value === step ? 'text-orange-600 font-black scale-110' : ''
                }`}
              >
                {step}%
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl bg-white rounded-3xl p-4 sm:p-7 shadow-2xl border border-slate-200 text-slate-800 max-h-[92vh] overflow-y-auto no-scrollbar relative flex flex-col">
        {/* Header do Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              {t.customizeTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalize o vocabulário, idiomas, proporções e digitação
            </p>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label={t.close}
          >
            <X size={20} />
          </button>
        </div>

        {/* 1. SELETOR DE IDIOMA (Exclusivo no Customizar) */}
        {onChangeLanguage && (
          <div className="mb-5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Globe size={14} className="text-indigo-600" />
                {t.languageSelectTitle}
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUPPORTED_LANGUAGES.map((langItem) => {
                const isSelected = language === langItem.code;
                return (
                  <button
                    key={langItem.code}
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      onChangeLanguage(langItem.code);
                    }}
                    className={`p-2 rounded-xl border text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/30 font-bold shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="text-base">{langItem.flag}</span>
                    <span className="text-xs truncate">{langItem.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. DIGITAÇÃO ÁGIL (TOLERÂNCIA DE ACENTOS) */}
        <div className="mb-5 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Keyboard size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-indigo-950">
                  {t.accentTolerantLabel}
                </span>
                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-sm ${
                  accentTolerant ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {accentTolerant ? 'Ativada' : 'Desativada'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {t.accentTolerantDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              onToggleAccentTolerant();
            }}
            className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
              accentTolerant ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* 3. NÍVEL DE APARECIMENTO DE CADA TIPO DE PALAVRA (SLIDERS COM LINHA E BOLA 0% A 100%) */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Nível de Aparecimento das Palavras
            </label>
            <span className="text-[10px] text-slate-400 font-medium">
              Arraste a bola para definir a porcentagem (0% a 100%)
            </span>
          </div>

          <div className="space-y-3">
            {renderPercentageSlider(
              'normal',
              'Palavras Normais',
              'Palavras padrão com leitura direta da esquerda para a direita.',
              spawnRates.normal,
              <Layers size={17} className="text-slate-700" />,
              'bg-white border-slate-300'
            )}

            {renderPercentageSlider(
              'blue',
              'Palavras Azuis (Invertidas)',
              'Devem ser digitadas de trás para a frente.',
              spawnRates.blue,
              <RotateCcw size={17} className="text-blue-600" />,
              'bg-blue-50 border-blue-300'
            )}

            {renderPercentageSlider(
              'green',
              'Palavras Verdes (Prioridade)',
              'Descem mais rápido e atraem a mira prioritária do canhão.',
              spawnRates.green,
              <Zap size={17} className="text-emerald-600" />,
              'bg-emerald-50 border-emerald-300'
            )}
          </div>
        </div>

        {/* 4. Categorias de Palavras */}
        <div className="mb-5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            {t.categoriesTitle}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundManager.playButtonClick();
                    onChangeCategory(cat.id);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/70 text-slate-900 ring-2 ring-orange-400/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                      {cat.icon}
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900">
                        {cat.label}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{cat.desc}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Níveis de Dificuldade */}
        <div className="mb-5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            {t.difficultiesTitle}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {difficulties.map((diff) => {
              const isSelected = difficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  onClick={() => {
                    soundManager.playButtonClick();
                    onChangeDifficulty(diff.id);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 text-slate-900 ring-2 ring-orange-400/30 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {diff.label}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-tight mb-2">
                      {diff.speedDesc}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60 w-fit">
                    <span>❤️</span>
                    <span>{diff.lives} {t.livesSuffix}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botão de Concluir */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-bold rounded-2xl transition-all shadow-md cursor-pointer text-sm uppercase tracking-wide flex items-center justify-center gap-2"
          >
            <Check size={18} />
            <span>Confirmar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
