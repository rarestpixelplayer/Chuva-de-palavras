import React, { useState, useEffect } from 'react';
import { RankingEntry, fetchLeaderboard } from '../services/firebase';
import { X, Trophy, Medal, Filter, RefreshCw, UserCheck, LogIn, AlertCircle } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface GlobalRankingsModalProps {
  currentUsername: string | null;
  onOpenLogin: () => void;
  onClose: () => void;
}

export const GlobalRankingsModal: React.FC<GlobalRankingsModalProps> = ({
  currentUsername,
  onOpenLogin,
  onClose,
}) => {
  const [selectedMode, setSelectedMode] = useState<string>('CLASSIC');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('todas');
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async (mode: string, diff: string) => {
    setLoading(true);
    const data = await fetchLeaderboard(mode, diff);
    setRankings(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData(selectedMode, selectedDifficulty);
  }, [selectedMode, selectedDifficulty]);

  const modeNames: Record<string, string> = {
    CLASSIC: 'Clássico',
    TIME_ATTACK: 'Contra o Tempo',
    REFLEX: 'Reflexo',
    MATH: 'Matemática',
    DUEL: 'Duelo',
  };

  const difficultyNames: Record<string, string> = {
    todas: 'Geral (Todas)',
    bebe: 'Bebê',
    facil: 'Fácil',
    normal: 'Normal',
    media: 'Média',
    dificil: 'Difícil',
    speed_typer: 'Speed Typer',
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-gradient-to-b from-[#002244] via-[#002f5c] to-[#004282] border-4 border-amber-400 rounded-3xl p-5 sm:p-7 max-w-2xl w-full text-white shadow-2xl shadow-amber-950/80 relative overflow-hidden flex flex-col gap-4 max-h-[92vh]">
        {/* Brilho decorativo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300">
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                Ranking Global Oficial
              </h2>
              <p className="text-xs text-amber-200/80">
                Apenas jogadores reais com sincronização automática
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                loadData(selectedMode, selectedDifficulty);
              }}
              className="p-1.5 rounded-xl text-amber-300 hover:text-white hover:bg-amber-500/20 transition-colors cursor-pointer border border-amber-500/20"
              title="Recarregar"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="p-1.5 rounded-xl text-amber-300 hover:text-white hover:bg-amber-500/20 transition-colors cursor-pointer border border-amber-500/20"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Barra de Perfil do Jogador */}
        <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-amber-400/30 text-xs relative z-10">
          <div className="flex items-center gap-2">
            {currentUsername ? (
              <>
                <span className="p-1 rounded-md bg-emerald-500 text-slate-950">
                  <UserCheck size={14} />
                </span>
                <span>
                  Jogador conectado: <strong className="text-emerald-300">@{currentUsername}</strong>
                </span>
              </>
            ) : (
              <>
                <span className="p-1 rounded-md bg-amber-500 text-slate-950">
                  <AlertCircle size={14} />
                </span>
                <span className="text-slate-300">
                  Conecte sua conta Google para ranquear com seu nome único!
                </span>
              </>
            )}
          </div>

          {!currentUsername && (
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                onOpenLogin();
              }}
              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <LogIn size={13} />
              <span>Conectar</span>
            </button>
          )}
        </div>

        {/* Seletores de Modo e Dificuldade */}
        <div className="flex flex-col sm:flex-row gap-2 relative z-10">
          {/* Modos de Jogo */}
          <div className="flex-1 flex gap-1 p-1 bg-slate-950/50 rounded-xl border border-sky-500/30 overflow-x-auto no-scrollbar">
            {['CLASSIC', 'TIME_ATTACK', 'REFLEX', 'MATH', 'DUEL'].map((m) => {
              const active = selectedMode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setSelectedMode(m);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {modeNames[m]}
                </button>
              );
            })}
          </div>

          {/* Dificuldade */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/50 rounded-xl border border-sky-500/30 overflow-x-auto no-scrollbar">
            <Filter size={14} className="text-amber-400 ml-1 shrink-0" />
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                soundManager.playButtonClick();
                setSelectedDifficulty(e.target.value);
              }}
              className="bg-transparent text-xs font-bold text-white focus:outline-hidden cursor-pointer pr-2"
            >
              {Object.entries(difficultyNames).map(([val, label]) => (
                <option key={val} value={val} className="bg-slate-900 text-white">
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista do Placar de Líderes */}
        <div className="flex-1 overflow-y-auto max-h-[50vh] relative z-10 no-scrollbar pr-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-300">
              <RefreshCw size={24} className="animate-spin text-amber-400" />
              <span className="text-xs">Buscando ranking no Firebase...</span>
            </div>
          ) : rankings.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-center text-slate-300">
              <Trophy size={32} className="text-amber-400/50" />
              <p className="text-sm font-bold text-white">Nenhum recorde registrado ainda!</p>
              <p className="text-xs text-slate-400">
                Seja o primeiro a jogar neste modo/dificuldade e conquiste o topo do ranking mundial!
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {rankings.map((entry, index) => {
                const isUser = entry.username === currentUsername;
                const isTop1 = index === 0;
                const isTop2 = index === 1;
                const isTop3 = index === 2;

                return (
                  <div
                    key={entry.id || `${entry.uid}_${index}`}
                    className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isUser
                        ? 'bg-amber-950/70 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                        : isTop1
                        ? 'bg-yellow-950/40 border-yellow-400/70'
                        : isTop2
                        ? 'bg-slate-800/60 border-slate-300/60'
                        : isTop3
                        ? 'bg-amber-950/30 border-amber-600/50'
                        : 'bg-slate-900/50 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Posição / Medalha */}
                      <div className="w-7 text-center font-black text-sm shrink-0">
                        {isTop1 ? (
                          <span className="text-yellow-400 text-lg">🥇</span>
                        ) : isTop2 ? (
                          <span className="text-slate-300 text-lg">🥈</span>
                        ) : isTop3 ? (
                          <span className="text-amber-500 text-lg">🥉</span>
                        ) : (
                          <span className="text-slate-400">#{index + 1}</span>
                        )}
                      </div>

                      {/* Nome do jogador */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-white truncate">
                            {entry.username}
                          </span>
                          {isUser && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm bg-amber-400 text-slate-950">
                              Você
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>{entry.wordsTyped} palavras</span>
                          <span>•</span>
                          <span>Combo {entry.maxCombo}x</span>
                          {entry.difficulty && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{entry.difficulty}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pontuação */}
                    <div className="text-right shrink-0">
                      <span className="font-mono font-black text-base sm:text-lg text-amber-300">
                        {entry.score.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-sans">pontos</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
