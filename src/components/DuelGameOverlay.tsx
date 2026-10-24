import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameLanguage, Difficulty } from '../types/game';
import { getRandomWordByLength, normalizeChar } from '../utils/words';
import { soundManager } from '../utils/sound';
import {
  X,
  Swords,
  Users,
  Wifi,
  Trophy,
  RotateCcw,
  Zap,
  CheckCircle,
  AlertTriangle,
  Play,
  Heart,
  Copy,
  Check,
  Search,
  Globe,
  Loader2,
  RefreshCw,
  Home,
  Sparkles,
  Target,
} from 'lucide-react';
import { Turret } from './Turret';
import { db } from '../services/firebase';
import {
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';

interface DuelGameOverlayProps {
  language: GameLanguage;
  difficulty: Difficulty;
  currentUsername: string | null;
  onExit: () => void;
}

interface DuelWord {
  id: string;
  text: string;
  normalizedText: string;
  x: number;
  y: number;
  typedLength: number;
  length: number;
}

interface OnlineRoomInfo {
  id: string;
  hostName: string;
  status: string;
  createdAt: number;
}

export const DuelGameOverlay: React.FC<DuelGameOverlayProps> = ({
  language,
  difficulty,
  currentUsername,
  onExit,
}) => {
  const [subMode, setSubMode] = useState<'SELECT' | 'LOCAL' | 'ONLINE_LOBBY' | 'ONLINE_PLAYING'>('SELECT');
  const [lobbyTab, setLobbyTab] = useState<'SEARCH' | 'CREATE' | 'JOIN'>('SEARCH');

  // Estado Local & Jogo
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [p1WordsDestroyed, setP1WordsDestroyed] = useState<number>(0);
  const [p2WordsDestroyed, setP2WordsDestroyed] = useState<number>(0);
  const [winner, setWinner] = useState<'P1' | 'P2' | null>(null);
  const [localWordsP1, setLocalWordsP1] = useState<DuelWord[]>([]);
  const [localWordsP2, setLocalWordsP2] = useState<DuelWord[]>([]);

  // Estado Online
  const [roomCode, setRoomCode] = useState<string>('');
  const [joinInputCode, setJoinInputCode] = useState<string>('');
  const [onlineStatus, setOnlineStatus] = useState<string>('');
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [opponentName, setOpponentName] = useState<string>('Oponente');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isSearchingRooms, setIsSearchingRooms] = useState<boolean>(false);
  const [publicRooms, setPublicRooms] = useState<OnlineRoomInfo[]>([]);

  const roomUnsubRef = useRef<(() => void) | null>(null);

  // Limpeza de listener ao desmontar
  useEffect(() => {
    return () => {
      if (roomUnsubRef.current) {
        roomUnsubRef.current();
      }
    };
  }, []);

  // Buscar salas online disponíveis
  const fetchOpenRooms = useCallback(async () => {
    setIsSearchingRooms(true);
    setOnlineError(null);
    try {
      const q = query(
        collection(db, 'duels'),
        where('status', '==', 'WAITING'),
        limit(10)
      );
      const snap = await getDocs(q);
      const rooms: OnlineRoomInfo[] = [];
      snap.forEach((d) => {
        const data = d.data();
        rooms.push({
          id: d.id,
          hostName: data.hostName || 'Desafiante',
          status: data.status,
          createdAt: data.createdAt || Date.now(),
        });
      });
      setPublicRooms(rooms);
    } catch {
      // Fallback gracioso se offline
      setPublicRooms([]);
    } finally {
      setIsSearchingRooms(false);
    }
  }, []);

  useEffect(() => {
    if (subMode === 'ONLINE_LOBBY' && lobbyTab === 'SEARCH') {
      fetchOpenRooms();
    }
  }, [subMode, lobbyTab, fetchOpenRooms]);

  // Iniciar partida local / inicializar estado das palavras
  const startDuelGame = useCallback((isOnline: boolean = false) => {
    soundManager.playBonusStart();
    setP1Score(0);
    setP2Score(0);
    setP1WordsDestroyed(0);
    setP2WordsDestroyed(0);
    setWinner(null);

    // Gera a primeira palavra para ambos com EXATAMENTE o mesmo tamanho (5 letras)
    const len = 5;
    const w1 = getRandomWordByLength(len, language);
    const w2 = getRandomWordByLength(len, language);

    setLocalWordsP1([
      {
        id: `p1-${Date.now()}`,
        text: w1,
        normalizedText: w1.toLowerCase(),
        x: 50,
        y: 12,
        typedLength: 0,
        length: w1.length,
      },
    ]);

    setLocalWordsP2([
      {
        id: `p2-${Date.now()}`,
        text: w2,
        normalizedText: w2.toLowerCase(),
        x: 50,
        y: 12,
        typedLength: 0,
        length: w2.length,
      },
    ]);

    setSubMode(isOnline ? 'ONLINE_PLAYING' : 'LOCAL');
  }, [language]);

  // Criação de sala online com código de 6 dígitos
  const handleCreateOnlineRoom = async () => {
    // Código de 6 dígitos puro (ex: 839214)
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setRoomCode(code);
    setIsHost(true);
    setOnlineStatus(`Sala ${code} criada! Aguardando oponente...`);
    setOnlineError(null);

    try {
      const roomRef = doc(db, 'duels', code);
      await setDoc(roomRef, {
        id: code,
        hostName: currentUsername || 'Jogador 1',
        guestName: null,
        status: 'WAITING',
        winner: null,
        createdAt: Date.now(),
        p1Score: 0,
        p2Score: 0,
      });

      // Escuta mudanças na sala (quando convidado entrar)
      if (roomUnsubRef.current) roomUnsubRef.current();
      roomUnsubRef.current = onSnapshot(roomRef, (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (data.status === 'PLAYING') {
          setOpponentName(data.guestName || 'Oponente');
          startDuelGame(true);
        }
        if (data.winner) {
          setWinner(data.winner);
        }
      });
    } catch {
      // Fallback offline: permite simular ou aguardar
      setOnlineStatus(`Sala ${code} pronta (Modo Local/Offline).`);
    }
  };

  // Entrar em sala online via código de 6 dígitos
  const handleJoinOnlineRoomByCode = async (codeToJoin?: string) => {
    const raw = (codeToJoin || joinInputCode).trim().replace(/\D/g, '');
    if (raw.length !== 6) {
      setOnlineError('O código deve conter exatamente 6 dígitos numéricos.');
      return;
    }

    setRoomCode(raw);
    setIsHost(false);
    setOnlineError(null);
    setOnlineStatus('Conectando à sala...');

    try {
      const roomRef = doc(db, 'duels', raw);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) {
        setOnlineError(`Sala com o código "${raw}" não encontrada. Verifique se o host já a criou.`);
        return;
      }

      const host = snap.data()?.hostName || 'Jogador 1';
      setOpponentName(host);

      await updateDoc(roomRef, {
        guestName: currentUsername || 'Jogador 2',
        status: 'PLAYING',
      });

      // Escuta atualizações da partida
      if (roomUnsubRef.current) roomUnsubRef.current();
      roomUnsubRef.current = onSnapshot(roomRef, (s) => {
        if (!s.exists()) return;
        const d = s.data();
        if (d.winner) {
          setWinner(d.winner);
        }
      });

      startDuelGame(true);
    } catch {
      setOnlineError('Não foi possível conectar à sala. Iniciando modo duelo local.');
      startDuelGame(true);
    }
  };

  // Partida rápida: procura sala existente ou cria uma se não houver
  const handleQuickMatch = async () => {
    setIsSearchingRooms(true);
    setOnlineError(null);
    try {
      const q = query(
        collection(db, 'duels'),
        where('status', '==', 'WAITING'),
        limit(5)
      );
      const snap = await getDocs(q);
      const available: string[] = [];
      snap.forEach((d) => {
        if (d.id) available.push(d.id);
      });

      if (available.length > 0) {
        // Entra na primeira sala disponível
        const targetCode = available[0];
        await handleJoinOnlineRoomByCode(targetCode);
      } else {
        // Nenhuma sala encontrada: cria uma automaticamente com 6 dígitos
        setLobbyTab('CREATE');
        await handleCreateOnlineRoom();
      }
    } catch {
      // Fallback
      setLobbyTab('CREATE');
      await handleCreateOnlineRoom();
    } finally {
      setIsSearchingRooms(false);
    }
  };

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard?.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Captura de Teclado no Duelo
  useEffect(() => {
    if ((subMode !== 'LOCAL' && subMode !== 'ONLINE_PLAYING') || winner) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
        return;
      }

      const key = e.key;
      if (key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;

      const canPlayP1 = subMode === 'LOCAL' || (subMode === 'ONLINE_PLAYING' && isHost);
      const canPlayP2 = subMode === 'LOCAL' || (subMode === 'ONLINE_PLAYING' && !isHost);

      // Digitação do Jogador 1
      if (canPlayP1) {
        setLocalWordsP1((prev) => {
          if (!prev.length) return prev;
          const target = prev[0];
          const expected = target.text[target.typedLength];
          if (expected && normalizeChar(expected) === normalizeChar(key)) {
            const nextTyped = target.typedLength + 1;
            soundManager.playKeyStroke(nextTyped);

            if (nextTyped >= target.text.length) {
              soundManager.playWordDestroyed(false);
              const earned = target.text.length * 100;
              setP1Score((s) => s + earned);
              setP1WordsDestroyed((c) => c + 1);

              const nextLen = Math.floor(Math.random() * 4) + 4;
              const newWordText = getRandomWordByLength(nextLen, language);
              return [
                {
                  id: `p1-${Date.now()}`,
                  text: newWordText,
                  normalizedText: newWordText.toLowerCase(),
                  x: 30 + Math.random() * 40,
                  y: 10,
                  typedLength: 0,
                  length: newWordText.length,
                },
              ];
            }
            return [{ ...target, typedLength: nextTyped }];
          }
          return prev;
        });
      }

      // Digitação do Jogador 2
      if (canPlayP2) {
        setLocalWordsP2((prev) => {
          if (!prev.length) return prev;
          const target = prev[0];
          const expected = target.text[target.typedLength];
          if (expected && normalizeChar(expected) === normalizeChar(key)) {
            const nextTyped = target.typedLength + 1;
            soundManager.playKeyStroke(nextTyped);

            if (nextTyped >= target.text.length) {
              soundManager.playWordDestroyed(false);
              const earned = target.text.length * 100;
              setP2Score((s) => s + earned);
              setP2WordsDestroyed((c) => c + 1);

              const nextLen = Math.floor(Math.random() * 4) + 4;
              const newWordText = getRandomWordByLength(nextLen, language);
              return [
                {
                  id: `p2-${Date.now()}`,
                  text: newWordText,
                  normalizedText: newWordText.toLowerCase(),
                  x: 30 + Math.random() * 40,
                  y: 10,
                  typedLength: 0,
                  length: newWordText.length,
                },
              ];
            }
            return [{ ...target, typedLength: nextTyped }];
          }
          return prev;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [subMode, winner, isHost, language, onExit]);

  // Loop de queda das palavras
  useEffect(() => {
    if ((subMode !== 'LOCAL' && subMode !== 'ONLINE_PLAYING') || winner) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const deltaSec = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const fallSpeed = 9.5; // % por segundo

      // Queda P1
      setLocalWordsP1((prev) => {
        return prev.map((w) => {
          const nextY = w.y + fallSpeed * deltaSec;
          if (nextY >= 88) {
            soundManager.playGameOver();
            setWinner('P2');
            if (subMode === 'ONLINE_PLAYING' && roomCode) {
              updateDoc(doc(db, 'duels', roomCode), { winner: 'P2' }).catch(() => {});
            }
          }
          return { ...w, y: nextY };
        });
      });

      // Queda P2
      setLocalWordsP2((prev) => {
        return prev.map((w) => {
          const nextY = w.y + fallSpeed * deltaSec;
          if (nextY >= 88) {
            soundManager.playGameOver();
            setWinner('P1');
            if (subMode === 'ONLINE_PLAYING' && roomCode) {
              updateDoc(doc(db, 'duels', roomCode), { winner: 'P1' }).catch(() => {});
            }
          }
          return { ...w, y: nextY };
        });
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [subMode, winner, roomCode]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden animate-in fade-in duration-200">
      {/* Top Header do Duelo (Estilo Nível Tutorial) */}
      <header className="w-full bg-slate-900/95 border-b border-sky-500/40 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-lg z-30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 text-slate-950 font-black shadow-md flex items-center justify-center">
            <Swords size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                MODO DE JOGO: DUELO PVP
              </span>
              <span className="text-xs font-bold text-amber-300 hidden sm:inline">
                {subMode === 'LOCAL' ? 'Local (Mesmo Teclado)' : subMode === 'ONLINE_PLAYING' ? `Online (Sala #${roomCode || 'Ativa'})` : 'Seleção de Duelo'}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-white tracking-wide">
              Arena de Combate Jogador vs Jogador
            </h1>
          </div>
        </div>

        {/* Indicadores de Placar no Centro */}
        {(subMode === 'LOCAL' || subMode === 'ONLINE_PLAYING') && (
          <div className="hidden sm:flex items-center gap-2.5 bg-slate-950/70 px-4 py-1.5 rounded-2xl border border-sky-500/30">
            <span className="text-sky-400 font-black text-xs">J1: {p1Score} pts</span>
            <span className="text-slate-500 font-bold">vs</span>
            <span className="text-orange-400 font-black text-xs">J2: {p2Score} pts</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              onExit();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/50 hover:border-red-500/50 text-slate-200 border border-slate-700 text-xs font-bold cursor-pointer transition-all"
          >
            <Home size={15} />
            <span className="hidden sm:inline">Menu</span>
          </button>
        </div>
      </header>

      {/* Banner de Missão Ativa do Duelo */}
      <div className="w-full bg-gradient-to-r from-[#001f3f] via-[#003366] to-[#001f3f] border-b border-sky-400/40 px-3 py-1.5 text-center text-xs text-sky-100 flex items-center justify-center gap-2 shadow-inner z-20">
        <Sparkles size={14} className="text-amber-400 shrink-0 animate-pulse" />
        <span className="font-semibold text-[11px] sm:text-xs">
          ⚔️ <strong>MISSÃO PVP:</strong> Digite mais rápido que seu adversário! Não deixe a palavra atingir a linha de perigo!
        </span>
      </div>

      {/* TELA DE SELEÇÃO: LOCAL VS ONLINE */}
      {subMode === 'SELECT' && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-[#002244] to-[#004282] border-4 border-sky-400 rounded-3xl p-6 sm:p-8 text-center flex flex-col gap-5 shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
                Escolha o Tipo de Duelo
              </h3>
              <p className="text-xs text-sky-200/80">
                Palavras de mesmo tamanho para ambos. Quem deixar cair no chão primeiro, perde!
              </p>
            </div>

            <div className="space-y-3">
              {/* Opção 1: Duelo Local */}
              <button
                type="button"
                onClick={() => startDuelGame(false)}
                className="w-full p-4 rounded-2xl border-2 border-indigo-400 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg uppercase flex items-center justify-center gap-3 transition-all cursor-pointer hover:scale-102 active:scale-98 shadow-lg"
              >
                <Users size={24} />
                <span>Duelo Local (Mesmo Teclado)</span>
              </button>

              {/* Opção 2: Duelo Online */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setSubMode('ONLINE_LOBBY');
                }}
                className="w-full p-4 rounded-2xl border-2 border-sky-400 bg-sky-600 hover:bg-sky-500 text-white font-black text-lg uppercase flex items-center justify-center gap-3 transition-all cursor-pointer hover:scale-102 active:scale-98 shadow-lg"
              >
                <Wifi size={24} />
                <span>Duelo Online (Pela Internet)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MENU DO MODO ONLINE COM 3 OPÇÕES (BUSCAR SALA, CRIAR CÓDIGO 6 DÍGITOS, ENTRAR COM CÓDIGO) */}
      {subMode === 'ONLINE_LOBBY' && (
        <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#002244] via-[#002e5e] to-[#004282] border-4 border-sky-400 rounded-3xl p-5 sm:p-7 text-center flex flex-col gap-4 shadow-2xl relative">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-bold">
                <Globe size={14} /> Duelo Online Multijogador
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-wider">
                Lobby Online
              </h3>
            </div>

            {/* Abas do Lobby Online */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/60 rounded-xl border border-sky-500/30 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setLobbyTab('SEARCH');
                  setOnlineError(null);
                }}
                className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  lobbyTab === 'SEARCH'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-sky-200 hover:text-white hover:bg-sky-500/10'
                }`}
              >
                <Search size={14} />
                <span>Buscar Sala</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setLobbyTab('CREATE');
                  setOnlineError(null);
                  if (!roomCode) handleCreateOnlineRoom();
                }}
                className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  lobbyTab === 'CREATE'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-sky-200 hover:text-white hover:bg-sky-500/10'
                }`}
              >
                <Wifi size={14} />
                <span>Criar 6 Dígitos</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setLobbyTab('JOIN');
                  setOnlineError(null);
                }}
                className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  lobbyTab === 'JOIN'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-sky-200 hover:text-white hover:bg-sky-500/10'
                }`}
              >
                <Swords size={14} />
                <span>Digitar Código</span>
              </button>
            </div>

            {/* Feedback de Erro */}
            {onlineError && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-400 text-rose-200 text-xs flex items-center gap-2 text-left animate-shake">
                <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                <span>{onlineError}</span>
              </div>
            )}

            {/* ABA 1: BUSCAR SALA ONLINE OU PARTIDA RÁPIDA */}
            {lobbyTab === 'SEARCH' && (
              <div className="space-y-3.5">
                <button
                  type="button"
                  onClick={handleQuickMatch}
                  disabled={isSearchingRooms}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base uppercase rounded-2xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSearchingRooms ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Zap size={18} />
                  )}
                  <span>Partida Rápida (Emparelhamento)</span>
                </button>

                <div className="flex items-center justify-between text-xs text-sky-200 px-1 pt-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <Globe size={13} /> Salas Públicas Aguardando ({publicRooms.length})
                  </span>
                  <button
                    type="button"
                    onClick={fetchOpenRooms}
                    className="p-1 text-sky-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    title="Atualizar lista"
                  >
                    <RefreshCw size={12} className={isSearchingRooms ? 'animate-spin' : ''} />
                    <span>Atualizar</span>
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {publicRooms.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-sky-400/20 text-xs text-sky-300/70">
                      Nenhuma sala aguardando no momento. Crie sua própria sala ou use a Partida Rápida!
                    </div>
                  ) : (
                    publicRooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-sky-400/30 hover:border-sky-400 transition-all"
                      >
                        <div className="text-left">
                          <p className="font-bold text-white text-sm">{room.hostName}</p>
                          <p className="text-[10px] text-sky-300/70 font-mono">Código: {room.id}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleJoinOnlineRoomByCode(room.id)}
                          className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase rounded-lg cursor-pointer transition-all"
                        >
                          Entrar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ABA 2: CRIAR SALA COM CÓDIGO DE 6 DÍGITOS */}
            {lobbyTab === 'CREATE' && (
              <div className="space-y-4 py-2">
                <p className="text-xs text-sky-200">
                  Compartilhe este código de 6 dígitos com seu amigo para ele entrar e disputar com você:
                </p>

                <div className="p-4 bg-slate-950/80 rounded-2xl border-2 border-amber-400 flex items-center justify-center gap-3">
                  <span className="text-3xl sm:text-4xl font-mono font-black text-amber-300 tracking-[0.25em]">
                    {roomCode || '------'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl border border-amber-400/40 cursor-pointer transition-all"
                    title="Copiar Código"
                  >
                    {copiedCode ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                  </button>
                </div>

                {copiedCode && (
                  <p className="text-xs text-emerald-300 font-bold">Código copiado para a área de transferência!</p>
                )}

                <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-400/30 flex items-center justify-center gap-2 text-xs text-sky-200">
                  <Loader2 size={16} className="animate-spin text-sky-400" />
                  <span>Aguardando seu amigo digitar o código...</span>
                </div>

                <button
                  type="button"
                  onClick={handleCreateOnlineRoom}
                  className="text-xs text-sky-300 hover:text-white underline cursor-pointer"
                >
                  Gerar novo código
                </button>
              </div>
            )}

            {/* ABA 3: ENTRAR COM CÓDIGO DE 6 DÍGITOS */}
            {lobbyTab === 'JOIN' && (
              <div className="space-y-4 py-2">
                <p className="text-xs text-sky-200">
                  Digite o código de 6 dígitos que seu amigo compartilhou com você:
                </p>

                <div className="space-y-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={joinInputCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setJoinInputCode(val);
                      if (val.length === 6) {
                        handleJoinOnlineRoomByCode(val);
                      }
                    }}
                    placeholder="000000"
                    className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 border-2 border-sky-400 text-white font-mono text-2xl sm:text-3xl text-center tracking-[0.25em] font-black focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                  <p className="text-[11px] text-sky-300/70">Digite os 6 números</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleJoinOnlineRoomByCode()}
                  disabled={joinInputCode.length !== 6}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-base uppercase rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Entrar no Duelo
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                setSubMode('SELECT');
              }}
              className="text-xs text-sky-300 hover:text-white underline cursor-pointer pt-2"
            >
              Voltar ao menu de duelo
            </button>
          </div>
        </div>
      )}

      {/* ARENA DO DUELO (TELA DIVIDIDA 50% / 50%) COM ESTILO DO TUTORIAL */}
      {(subMode === 'LOCAL' || subMode === 'ONLINE_PLAYING') && (
        <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden select-none">
          {/* LADO DO JOGADOR 1 (AZUL / ESQUERDA) */}
          <div className="flex-1 flex flex-col border-b-4 md:border-b-0 md:border-r-4 border-sky-400/60 relative bg-radial-at-t from-[#001f3f] via-[#000d20] to-[#00050d] overflow-hidden">
            {/* Estrelas cintilantes no fundo J1 */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={`star-p1-${i}`}
                  className="absolute w-1 h-1 bg-sky-200 rounded-full animate-ping"
                  style={{
                    left: `${(i * 17) % 96}%`,
                    top: `${(i * 23) % 90}%`,
                    animationDuration: `${1.8 + (i % 3) * 0.7}s`,
                    animationDelay: `${(i * 0.25).toFixed(2)}s`,
                  }}
                />
              ))}
            </div>

            {/* Barra de Status J1 */}
            <div className="flex items-center justify-between p-3 bg-slate-950/80 backdrop-blur-sm border-b border-sky-500/40 text-xs font-black z-25">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400 animate-pulse" />
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-[11px] font-black text-sky-300 uppercase tracking-wider">
                  {subMode === 'ONLINE_PLAYING'
                    ? isHost
                      ? `${currentUsername || 'Você'} (Anfitrião)`
                      : `${opponentName} (Anfitrião)`
                    : 'Jogador 1 (Azul)'}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-amber-400/30 text-amber-300 font-mono text-xs font-black">
                  {p1Score} pts
                </span>
                <span className="px-2 py-1 rounded-xl bg-slate-900/90 border border-emerald-400/30 text-emerald-400 text-xs font-bold">
                  {p1WordsDestroyed} 💥
                </span>
                <span className="px-2 py-1 rounded-xl bg-slate-900/90 border border-rose-500/40 text-rose-400 text-xs font-bold flex items-center gap-1">
                  <Heart size={13} className="fill-rose-500" /> 1 Vida
                </span>
              </div>
            </div>

            {/* Céu de queda J1 */}
            <div className="flex-1 relative overflow-hidden">
              {/* Canhão do Jogador 1 no chão */}
              <Turret
                targetX={localWordsP1[0]?.x ?? 50}
                targetY={localWordsP1[0]?.y ?? 20}
                isFiring={false}
                cannonBalls={[]}
                equippedSkinId="cosmic"
              />

              {localWordsP1.map((w) => {
                const nextChar = w.text[w.typedLength] || '';
                return (
                  <div
                    key={w.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-transform duration-75 z-30"
                    style={{ left: `${w.x}%`, top: `${w.y}%` }}
                  >
                    {/* Cartão da Palavra Estilo Tutorial */}
                    <div className="relative px-4 py-2 rounded-2xl bg-slate-900/95 border-2 border-sky-400 shadow-xl shadow-sky-500/30 backdrop-blur-md flex flex-col items-center">
                      <div className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-sky-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
                        {subMode === 'ONLINE_PLAYING' ? (isHost ? 'SEU ALVO' : 'ALVO J1') : 'ALVO J1'}
                      </div>

                      {/* Letras com highlight da próxima letra */}
                      <div className="font-mono font-black text-xl sm:text-2xl tracking-wider flex items-center pt-1">
                        {w.text.split('').map((char, idx) => {
                          const isCharTyped = idx < w.typedLength;
                          const isNextChar = idx === w.typedLength;

                          return (
                            <span
                              key={idx}
                              className={`relative px-0.5 ${
                                isCharTyped
                                  ? 'text-cyan-400 line-through opacity-60'
                                  : isNextChar
                                  ? 'text-amber-300 underline underline-offset-4 animate-pulse scale-110 inline-block font-extrabold drop-shadow-[0_0_8px_rgba(251,191,36,0.95)]'
                                  : 'text-white'
                              }`}
                            >
                              {char}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sub-Pill com Próxima Letra */}
                    <div className="mt-1.5 text-[10px] sm:text-[11px] font-bold text-sky-200 bg-slate-900/90 px-2.5 py-0.5 rounded-full border border-sky-400/40 shadow-sm flex items-center gap-1">
                      <span>Próxima:</span>
                      <strong className="text-amber-300 font-mono text-xs">{nextChar || '✓'}</strong>
                    </div>
                  </div>
                );
              })}

              {/* Linha de perigo animada com faixas de advertência */}
              <div className="absolute bottom-10 left-0 right-0 h-1.5 hazard-stripes-animated shadow-lg shadow-rose-500/70 z-20" />

              {/* Chão azul escuro / Base */}
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#001736] border-t border-sky-500/30 flex items-center justify-center text-[10px] sm:text-[11px] font-semibold text-sky-200/80 z-10 px-2 text-center">
                <span>⌨️ {subMode === 'ONLINE_PLAYING' && !isHost ? 'Oponente digitando...' : 'Digite as letras no teclado!'}</span>
              </div>
            </div>
          </div>

          {/* LADO DO JOGADOR 2 (LARANJA / DIREITA) */}
          <div className="flex-1 flex flex-col relative bg-radial-at-t from-[#2a0e00] via-[#140600] to-[#050100] overflow-hidden">
            {/* Estrelas cintilantes no fundo J2 */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={`star-p2-${i}`}
                  className="absolute w-1 h-1 bg-amber-200 rounded-full animate-ping"
                  style={{
                    left: `${(i * 19) % 96}%`,
                    top: `${(i * 29) % 90}%`,
                    animationDuration: `${1.8 + (i % 3) * 0.7}s`,
                    animationDelay: `${(i * 0.22).toFixed(2)}s`,
                  }}
                />
              ))}
            </div>

            {/* Barra de Status J2 */}
            <div className="flex items-center justify-between p-3 bg-slate-950/80 backdrop-blur-sm border-b border-orange-500/40 text-xs font-black z-25">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-sm shadow-orange-400 animate-pulse" />
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-400/40 text-[11px] font-black text-orange-300 uppercase tracking-wider">
                  {subMode === 'ONLINE_PLAYING'
                    ? !isHost
                      ? `${currentUsername || 'Você'} (Convidado)`
                      : `${opponentName} (Convidado)`
                    : 'Jogador 2 (Laranja)'}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-amber-400/30 text-amber-300 font-mono text-xs font-black">
                  {p2Score} pts
                </span>
                <span className="px-2 py-1 rounded-xl bg-slate-900/90 border border-emerald-400/30 text-emerald-400 text-xs font-bold">
                  {p2WordsDestroyed} 💥
                </span>
                <span className="px-2 py-1 rounded-xl bg-slate-900/90 border border-rose-500/40 text-rose-400 text-xs font-bold flex items-center gap-1">
                  <Heart size={13} className="fill-rose-500" /> 1 Vida
                </span>
              </div>
            </div>

            {/* Céu de queda J2 */}
            <div className="flex-1 relative overflow-hidden">
              {/* Canhão do Jogador 2 no chão */}
              <Turret
                targetX={localWordsP2[0]?.x ?? 50}
                targetY={localWordsP2[0]?.y ?? 20}
                isFiring={false}
                cannonBalls={[]}
                equippedSkinId="solar"
              />

              {localWordsP2.map((w) => {
                const nextChar = w.text[w.typedLength] || '';
                return (
                  <div
                    key={w.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-transform duration-75 z-30"
                    style={{ left: `${w.x}%`, top: `${w.y}%` }}
                  >
                    {/* Cartão da Palavra Estilo Tutorial */}
                    <div className="relative px-4 py-2 rounded-2xl bg-slate-900/95 border-2 border-amber-400 shadow-xl shadow-amber-500/30 backdrop-blur-md flex flex-col items-center">
                      <div className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
                        {subMode === 'ONLINE_PLAYING' ? (!isHost ? 'SEU ALVO' : 'ALVO J2') : 'ALVO J2'}
                      </div>

                      {/* Letras com highlight da próxima letra */}
                      <div className="font-mono font-black text-xl sm:text-2xl tracking-wider flex items-center pt-1">
                        {w.text.split('').map((char, idx) => {
                          const isCharTyped = idx < w.typedLength;
                          const isNextChar = idx === w.typedLength;

                          return (
                            <span
                              key={idx}
                              className={`relative px-0.5 ${
                                isCharTyped
                                  ? 'text-amber-400 line-through opacity-60'
                                  : isNextChar
                                  ? 'text-amber-300 underline underline-offset-4 animate-pulse scale-110 inline-block font-extrabold drop-shadow-[0_0_8px_rgba(251,191,36,0.95)]'
                                  : 'text-white'
                              }`}
                            >
                              {char}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sub-Pill com Próxima Letra */}
                    <div className="mt-1.5 text-[10px] sm:text-[11px] font-bold text-amber-200 bg-slate-900/90 px-2.5 py-0.5 rounded-full border border-amber-400/40 shadow-sm flex items-center gap-1">
                      <span>Próxima:</span>
                      <strong className="text-amber-300 font-mono text-xs">{nextChar || '✓'}</strong>
                    </div>
                  </div>
                );
              })}

              {/* Linha de perigo animada com faixas de advertência */}
              <div className="absolute bottom-10 left-0 right-0 h-1.5 hazard-stripes-animated shadow-lg shadow-rose-500/70 z-20" />

              {/* Chão escuro / Base */}
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#1f0b00] border-t border-amber-500/30 flex items-center justify-center text-[10px] sm:text-[11px] font-semibold text-amber-200/80 z-10 px-2 text-center">
                <span>⌨️ {subMode === 'ONLINE_PLAYING' && isHost ? 'Oponente digitando...' : 'Digite as letras no teclado!'}</span>
              </div>
            </div>
          </div>

          {/* VENCEDOR MODAL */}
          {winner && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-40 flex items-center justify-center p-4">
              <div className="bg-gradient-to-b from-[#002244] to-[#004282] border-4 border-yellow-400 rounded-3xl p-8 max-w-sm w-full text-center flex flex-col items-center gap-4 shadow-2xl animate-in zoom-in-95">
                <div className="p-4 bg-yellow-400/20 border-2 border-yellow-300 rounded-full text-yellow-300 animate-bounce">
                  <Trophy size={48} />
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-wider">
                  {winner === 'P1' ? 'JOGADOR 1 VENCEU!' : 'JOGADOR 2 VENCEU!'}
                </h3>
                <p className="text-xs text-sky-200">
                  {winner === 'P1'
                    ? 'O Jogador 2 deixou a palavra cair no chão!'
                    : 'O Jogador 1 deixou a palavra cair no chão!'}
                </p>

                <div className="w-full flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => startDuelGame(subMode === 'ONLINE_PLAYING')}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={16} /> Revanche
                  </button>
                  <button
                    type="button"
                    onClick={onExit}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm uppercase rounded-xl transition-all cursor-pointer"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
