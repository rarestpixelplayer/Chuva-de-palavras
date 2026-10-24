import React from 'react';
import { CannonSkin } from '../types/game';
import { X, Check, Lock, Shield, Sparkles, Zap, Award } from 'lucide-react';
import { soundManager } from '../utils/sound';

export const CANNON_SKINS: CannonSkin[] = [
  {
    id: 'classic',
    name: 'Canhão Clássico de Ferro',
    description: 'O canhão confiável dos defensores de palavras.',
    color: 'from-slate-700 to-slate-900 border-slate-500',
    barrelColor: '#475569',
    glowColor: '#38bdf8',
    bulletColor: '#38bdf8',
    badge: 'Padrão',
  },
  {
    id: 'emerald',
    name: 'Canhão Esmeralda Plasma',
    description: 'Dispara pulsos de plasma verde hipervelozes.',
    color: 'from-emerald-700 to-emerald-950 border-emerald-400',
    barrelColor: '#059669',
    glowColor: '#34d399',
    bulletColor: '#10b981',
    requiredScore: 1500,
    requiredCombo: 15,
    badge: '1.500 pts ou Combo 15',
  },
  {
    id: 'laser',
    name: 'Canhão Laser Cyber Neon',
    description: 'Canos de feixe quântico com rajadas ultravioleta.',
    color: 'from-fuchsia-700 to-purple-950 border-fuchsia-400',
    barrelColor: '#9333ea',
    glowColor: '#e879f9',
    bulletColor: '#f0abfc',
    requiredScore: 3500,
    requiredCombo: 25,
    badge: '3.500 pts ou Combo 25',
  },
  {
    id: 'cosmic',
    name: 'Canhão Cósmico Estelar',
    description: 'Forjado com poeira estelar das galáxias mais distantes.',
    color: 'from-sky-700 to-indigo-950 border-sky-400',
    barrelColor: '#0284c7',
    glowColor: '#38bdf8',
    bulletColor: '#7dd3fc',
    requiredScore: 6000,
    requiredCombo: 35,
    badge: '6.000 pts ou Combo 35',
  },
  {
    id: 'golden',
    name: 'Canhão Dourado Imperial',
    description: 'Banhado em ouro puro reluzente para os maiores digitadores.',
    color: 'from-amber-600 to-yellow-950 border-yellow-400',
    barrelColor: '#d97706',
    glowColor: '#fde047',
    bulletColor: '#facc15',
    requiredScore: 10000,
    requiredCombo: 50,
    badge: '10.000 pts ou Combo 50',
  },
  {
    id: 'dragon',
    name: 'Canhão Dragão Vulcânico',
    description: 'Cuspidor de meteoros incandescentes com fúria de dragão.',
    color: 'from-red-700 to-stone-950 border-red-500',
    barrelColor: '#dc2626',
    glowColor: '#f87171',
    bulletColor: '#fb7185',
    requiredScore: 15000,
    requiredCombo: 65,
    badge: '15.000 pts ou Combo 65',
  },
  {
    id: 'solar',
    name: 'Canhão Solar Radiante',
    description: 'Relíquia luminosa desbloqueada exclusivamente pelo Bônus Diário!',
    color: 'from-amber-500 via-orange-500 to-yellow-300 border-yellow-200',
    barrelColor: '#f59e0b',
    glowColor: '#fef08a',
    bulletColor: '#fbbf24',
    badge: 'Recompensa do Bônus Diário (Dia 7)',
  },
];

interface InventoryModalProps {
  highScore: number;
  maxCombo: number;
  equippedSkinId: string;
  unlockedSkins?: string[];
  coins?: number;
  onEquipSkin: (skinId: string) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  highScore,
  maxCombo,
  equippedSkinId,
  unlockedSkins = [],
  coins = 0,
  onEquipSkin,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-gradient-to-b from-[#002244] via-[#002f5c] to-[#004282] border-4 border-indigo-400 rounded-3xl p-5 sm:p-7 max-w-xl w-full text-white shadow-2xl shadow-indigo-950/80 relative overflow-hidden flex flex-col gap-4 max-h-[92vh]">
        {/* Brilho decorativo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-24 bg-indigo-400/20 rounded-full blur-xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/40 rounded-xl text-indigo-300">
              <Shield size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                Arsenal de Canhões
              </h2>
              <p className="text-xs text-indigo-200/80">
                Desbloqueie modelos exclusivos alcançando metas de pontuação e combo!
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
          >
            <X size={20} />
          </button>
        </div>

        {/* Resumo do jogador */}
        <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-950/60 rounded-xl border border-indigo-500/30 text-xs relative z-10 font-bold">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Award size={15} />
            <span className="truncate">Recorde: {highScore.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sky-300">
            <Zap size={15} />
            <span className="truncate">Combo: {maxCombo}x</span>
          </div>
          <div className="flex items-center gap-1.5 text-yellow-300">
            <span>🪙</span>
            <span className="truncate">Moedas: {coins.toLocaleString()}</span>
          </div>
        </div>

        {/* Lista de Canhões */}
        <div className="space-y-3 overflow-y-auto max-h-[58vh] pr-1 relative z-10 no-scrollbar">
          {CANNON_SKINS.map((skin) => {
            const isUnlocked =
              skin.id === 'solar'
                ? unlockedSkins.includes('solar')
                : !skin.requiredScore && !skin.requiredCombo
                ? true
                : (skin.requiredScore && highScore >= skin.requiredScore) ||
                  (skin.requiredCombo && maxCombo >= skin.requiredCombo) ||
                  unlockedSkins.includes(skin.id);

            const isEquipped = equippedSkinId === skin.id;

            return (
              <div
                key={skin.id}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isEquipped
                    ? 'bg-indigo-950/70 border-indigo-400 shadow-lg shadow-indigo-950/50'
                    : isUnlocked
                    ? 'bg-slate-900/60 border-slate-700/80 hover:border-slate-500'
                    : 'bg-slate-950/50 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Visual do Canhão */}
                  <div
                    className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0 shadow-md bg-gradient-to-br ${skin.color}`}
                  >
                    <div
                      className="w-5 h-7 rounded-sm border-2 border-white/60 shadow-inner"
                      style={{ backgroundColor: skin.barrelColor }}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm sm:text-base text-white truncate">
                        {skin.name}
                      </h4>
                      {isEquipped && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                          Equipado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 truncate">{skin.description}</p>
                    <div className="text-[11px] font-semibold text-indigo-300 mt-1 flex items-center gap-1">
                      {isUnlocked ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Sparkles size={12} /> Desbloqueado
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <Lock size={12} /> Requer: {skin.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botão de Equipar */}
                <div className="shrink-0">
                  {isEquipped ? (
                    <button
                      type="button"
                      disabled
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-400/50 font-bold text-xs flex items-center gap-1 cursor-default"
                    >
                      <Check size={14} /> Ativo
                    </button>
                  ) : isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playButtonClick();
                        onEquipSkin(skin.id);
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                    >
                      Equipar
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-semibold flex items-center gap-1">
                      <Lock size={13} /> Bloqueado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
