import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameMode,
  ActiveGameMode,
  Difficulty,
  WordCategory,
  FallingWord,
  CannonBall,
  FlyingLetter,
  FloatingText,
  GameStats,
  ScreenShakeSetting,
  SkyTheme,
  WordFontSize,
  GameLanguage,
  WordSpawnRates,
  DailyMission,
  Achievement,
} from './types/game';
import { getRandomWord, getRandomMathProblem, normalizeChar } from './utils/words';
import { TRANSLATIONS } from './utils/i18n';
import { soundManager } from './utils/sound';
import { EyeOff, AlertTriangle, Trophy } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, autoSubmitScore, getUserProfile, UserProfileData } from './services/firebase';
import { Turret } from './components/Turret';
import { WordBadge } from './components/WordBadge';
import { HUD } from './components/HUD';
import { BonusRoundOverlay } from './components/BonusRoundOverlay';
import { GameOverModal } from './components/GameOverModal';
import { StartMenu } from './components/StartMenu';
import { RulesModal } from './components/RulesModal';
import { CustomizeModal } from './components/CustomizeModal';
import { SettingsModal } from './components/SettingsModal';
import { GameModesModal } from './components/GameModesModal';
import { ReflexGameOverlay } from './components/ReflexGameOverlay';
import { ReverseWordTutorialModal } from './components/ReverseWordTutorialModal';
import { GreenWordTutorialModal } from './components/GreenWordTutorialModal';
import { MobileInputHelper } from './components/MobileInputHelper';
import { SkyParticles } from './components/SkyParticles';
import { GlobalRankingsModal } from './components/GlobalRankingsModal';
import { DailyMissionsModal } from './components/DailyMissionsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { AchievementPopup } from './components/AchievementPopup';
import { InventoryModal } from './components/InventoryModal';
import { AuthModal } from './components/AuthModal';
import { DuelGameOverlay } from './components/DuelGameOverlay';
import { DailyBonusModal } from './components/DailyBonusModal';
import { FeedbackModal } from './components/FeedbackModal';
import { TutorialLevelOverlay } from './components/TutorialLevelOverlay';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  isStar?: boolean;
}

interface Shockwave {
  id: string;
  x: number;
  y: number;
  color: string;
  createdAt: number;
}

const getMaxLivesByDifficulty = (diff: Difficulty): number => {
  switch (diff) {
    case 'bebe':
      return 5;
    case 'facil':
      return 4;
    case 'normal':
      return 3;
    case 'media':
      return 3;
    case 'dificil':
      return 3;
    case 'speed_typer':
      return 2;
  }
};

export default function App() {
  // Game states: se for a primeira vez no jogo, inicia diretamente no Nível Tutorial jogável
  const [gameMode, setGameMode] = useState<GameMode>(() => {
    if (typeof window !== 'undefined') {
      const firstDone = localStorage.getItem('chuva_palavras_first_tutorial_done');
      if (!firstDone) return 'TUTORIAL';
    }
    return 'MENU';
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [category, setCategory] = useState<WordCategory>('todas');
  const [accentTolerant, setAccentTolerant] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.isMuted());
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showCustomize, setShowCustomize] = useState<boolean>(false);
  const [showModes, setShowModes] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showReverseTutorial, setShowReverseTutorial] = useState<boolean>(false);
  const [hasSeenReverseTutorial, setHasSeenReverseTutorial] = useState<boolean>(false);
  const [showGreenTutorial, setShowGreenTutorial] = useState<boolean>(false);
  const [hasSeenGreenTutorial, setHasSeenGreenTutorial] = useState<boolean>(false);

  // Modo de Jogo Ativo: Clássico, Contra o Tempo ou Reflexo
  const [activeGameMode, setActiveGameMode] = useState<ActiveGameMode>('CLASSIC');
  const activeGameModeRef = useRef<ActiveGameMode>(activeGameMode);
  activeGameModeRef.current = activeGameMode;

  // Tempo restante no Modo Contra o Tempo (60 segundos)
  const [timeAttackLeft, setTimeAttackLeft] = useState<number>(60);
  const timeAttackLeftRef = useRef<number>(60);
  timeAttackLeftRef.current = timeAttackLeft;

  // Vidas dinâmicas baseadas na dificuldade escolhida
  const maxLives = getMaxLivesByDifficulty(difficulty);
  const [lives, setLives] = useState<number>(maxLives);

  // High Scores salvos
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chuva_palavras_highscore');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [timeAttackHighScore, setTimeAttackHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chuva_palavras_timeattack_highscore');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [reflexHighScore, setReflexHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chuva_palavras_reflexo_highscore');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [mathHighScore, setMathHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chuva_palavras_math_highscore');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [blindnessHighScore, setBlindnessHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chuva_palavras_blindness_highscore');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  // Autenticação Firebase & Perfil do Jogador
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setCurrentUser(u);
      if (u) {
        const p = await getUserProfile(u.uid);
        setUserProfile(p);
      } else {
        setUserProfile(null);
      }
    });
    return () => unsub();
  }, []);

  // Modais de Novos Recursos
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [showRankings, setShowRankings] = useState<boolean>(false);
  const [showMissions, setShowMissions] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [showDailyBonus, setShowDailyBonus] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [currentAchievementPopup, setCurrentAchievementPopup] = useState<Achievement | null>(null);

  // Efeitos visuais imersivos: Combo Break, Distorção de Perda de Vida e Transição de Nível
  const [comboBreakFlash, setComboBreakFlash] = useState<boolean>(false);
  const [lifeLossDistortion, setLifeLossDistortion] = useState<boolean>(false);
  const [levelUpTransition, setLevelUpTransition] = useState<{ level: number; show: boolean }>({
    level: 1,
    show: false,
  });

  // Volume da música de fundo 8-Bit
  const [musicVolume, setMusicVolume] = useState<number>(() => soundManager.getMusicVolume());

  // Moedas in-game
  const [coins, setCoins] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem('chuva_palavras_coins') || '0', 10);
  });

  // Skins Desbloqueadas
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['classic'];
    try {
      const saved = localStorage.getItem('chuva_palavras_unlocked_skins');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['classic'];
  });

  // Daily Bonus (Sistema de 7 dias com recompensas de moedas e cosmético especial)
  const [dailyBonusDay, setDailyBonusDay] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const saved = parseInt(localStorage.getItem('chuva_palavras_daily_bonus_day') || '1', 10);
    return Math.min(7, Math.max(1, saved));
  });

  const [hasClaimedDailyBonusToday, setHasClaimedDailyBonusToday] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const lastClaimed = localStorage.getItem('chuva_palavras_daily_bonus_last_date');
    const today = new Date().toISOString().slice(0, 10);
    return lastClaimed === today;
  });

  // Verifica primeiro login do dia para abrir o modal comemorativo de Bônus Diário
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const today = new Date().toISOString().slice(0, 10);
    const lastClaimed = localStorage.getItem('chuva_palavras_daily_bonus_last_date');
    if (lastClaimed !== today) {
      if (lastClaimed) {
        const last = new Date(lastClaimed);
        const current = new Date(today);
        const diffDays = Math.round((current.getTime() - last.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          const nextDay = (dailyBonusDay % 7) + 1;
          setDailyBonusDay(nextDay);
          localStorage.setItem('chuva_palavras_daily_bonus_day', String(nextDay));
        } else if (diffDays > 1) {
          setDailyBonusDay(1);
          localStorage.setItem('chuva_palavras_daily_bonus_day', '1');
        }
      }
      setHasClaimedDailyBonusToday(false);
      // Apresenta o modal de bônus diário na primeira sessão do dia caso o tutorial de primeira viagem não esteja aberto
      const timer = setTimeout(() => {
        if (localStorage.getItem('chuva_palavras_first_tutorial_done')) {
          setShowDailyBonus(true);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClaimDailyBonus = useCallback((day: number) => {
    const today = new Date().toISOString().slice(0, 10);
    const coinsByDay: Record<number, number> = {
      1: 100,
      2: 150,
      3: 200,
      4: 250,
      5: 350,
      6: 500,
      7: 1000,
    };
    const rewardCoins = coinsByDay[day] || 100;
    setCoins((prev) => {
      const next = prev + rewardCoins;
      localStorage.setItem('chuva_palavras_coins', String(next));
      return next;
    });

    if (day === 7) {
      // Cosmético lendário: Canhão Solar Radiante
      setUnlockedSkins((prev) => {
        const next = Array.from(new Set([...prev, 'solar']));
        localStorage.setItem('chuva_palavras_unlocked_skins', JSON.stringify(next));
        return next;
      });
      setEquippedSkinId('solar');
      localStorage.setItem('chuva_palavras_equipped_cannon', 'solar');
    }

    localStorage.setItem('chuva_palavras_daily_bonus_last_date', today);
    localStorage.setItem('chuva_palavras_daily_bonus_day', String(day));
    setHasClaimedDailyBonusToday(true);
  }, []);

  const handleCompleteInteractiveTutorial = useCallback(
    (rewardCoins: number = 200) => {
      soundManager.playButtonClick();
      if (typeof window !== 'undefined') {
        localStorage.setItem('chuva_palavras_first_tutorial_done', 'true');
      }
      setCoins((prev) => {
        const next = prev + rewardCoins;
        if (typeof window !== 'undefined') {
          localStorage.setItem('chuva_palavras_coins', String(next));
        }
        return next;
      });
      setActiveGameMode('CLASSIC');
      setGameMode('MENU');
      if (!hasClaimedDailyBonusToday) {
        setTimeout(() => setShowDailyBonus(true), 400);
      }
    },
    [hasClaimedDailyBonusToday]
  );

  // Daily Streak
  const [dailyStreak, setDailyStreak] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const savedStreak = parseInt(localStorage.getItem('chuva_palavras_daily_streak') || '0', 10);
    const lastDate = localStorage.getItem('chuva_palavras_last_streak_date');
    const today = new Date().toISOString().slice(0, 10);

    if (!lastDate) {
      localStorage.setItem('chuva_palavras_daily_streak', '1');
      localStorage.setItem('chuva_palavras_last_streak_date', today);
      return 1;
    }
    if (lastDate === today) {
      return Math.max(1, savedStreak);
    }
    const last = new Date(lastDate);
    const current = new Date(today);
    const diffDays = Math.round((current.getTime() - last.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      const next = savedStreak + 1;
      localStorage.setItem('chuva_palavras_daily_streak', String(next));
      localStorage.setItem('chuva_palavras_last_streak_date', today);
      return next;
    } else if (diffDays > 1) {
      localStorage.setItem('chuva_palavras_daily_streak', '1');
      localStorage.setItem('chuva_palavras_last_streak_date', today);
      return 1;
    }
    return Math.max(1, savedStreak);
  });

  // Missões Diárias
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(() => {
    if (typeof window === 'undefined') return [];
    const today = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem(`chuva_palavras_missions_${today}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'm1',
        title: 'Caçador de Esmeraldas',
        description: 'Destrua 10 palavras verdes com prioridade.',
        target: 10,
        progress: 0,
        completed: false,
        type: 'green_words',
        reward: '500 pts bônus',
      },
      {
        id: 'm2',
        title: 'Mestre do Combo',
        description: 'Alcance uma sequência de combo de 25x.',
        target: 25,
        progress: 0,
        completed: false,
        type: 'combo',
        reward: 'Skin de Canhão',
      },
      {
        id: 'm3',
        title: 'Chuva de Palavras',
        description: 'Digite 50 palavras no total.',
        target: 50,
        progress: 0,
        completed: false,
        type: 'total_words',
        reward: 'Troféu Estelar',
      },
    ];
  });

  // Conquistas
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('chuva_palavras_achievements');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'first_shot',
        title: 'Primeiro Disparo',
        description: 'Acerte e destrua sua primeira palavra.',
        tier: 'bronze',
        icon: '🎯',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
      },
      {
        id: 'combo_10',
        title: 'Combo de 10',
        description: 'Mantenha o foco e alcance um combo de 10x.',
        tier: 'bronze',
        icon: '⚡',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
      },
      {
        id: 'words_100',
        title: 'Centurião da Digitação',
        description: 'Destrua 100 palavras nas suas partidas.',
        tier: 'bronze',
        icon: '📜',
        unlocked: false,
        progress: 0,
        maxProgress: 100,
      },
      {
        id: 'combo_30',
        title: 'Mestre do Ritmo',
        description: 'Alcance uma sequência de combo de 30x.',
        tier: 'silver',
        icon: '🔥',
        unlocked: false,
        progress: 0,
        maxProgress: 30,
      },
      {
        id: 'green_25',
        title: 'Sentinela das Esmeraldas',
        description: 'Destrua 25 palavras verdes prioritárias.',
        tier: 'silver',
        icon: '💎',
        unlocked: false,
        progress: 0,
        maxProgress: 25,
      },
      {
        id: 'math_ace',
        title: 'Mente Brilhante',
        description: 'Pontue mais de 2.000 pontos no Modo Matemática.',
        tier: 'silver',
        icon: '🧮',
        unlocked: false,
        progress: 0,
        maxProgress: 2000,
      },
      {
        id: 'combo_50',
        title: 'Combo Implacável',
        description: 'Alcance o incrível marco de combo 50x sem errar.',
        tier: 'gold',
        icon: '👑',
        unlocked: false,
        progress: 0,
        maxProgress: 50,
      },
      {
        id: 'words_1000',
        title: 'Lenda das Letras',
        description: 'Digite um total impressionante de 1.000 palavras.',
        tier: 'gold',
        icon: '🏆',
        unlocked: false,
        progress: 0,
        maxProgress: 1000,
      },
      {
        id: 'score_15k',
        title: 'Pontuação Lendária',
        description: 'Alcance mais de 15.000 pontos em uma partida.',
        tier: 'gold',
        icon: '🌟',
        unlocked: false,
        progress: 0,
        maxProgress: 15000,
      },
    ];
  });

  // Skin equipada do canhão
  const [equippedSkinId, setEquippedSkinId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chuva_palavras_equipped_cannon') || 'classic';
    }
    return 'classic';
  });

  const handleEquipSkin = useCallback((skinId: string) => {
    setEquippedSkinId(skinId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chuva_palavras_equipped_cannon', skinId);
    }
  }, []);

  // Efeitos visuais do céu: Neve e Estrelas Cadentes
  const [showSkyParticles, setShowSkyParticles] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chuva_palavras_sky_particles') !== 'false';
    }
    return true;
  });

  const handleToggleSkyParticles = useCallback(() => {
    setShowSkyParticles((prev) => {
      const next = !prev;
      localStorage.setItem('chuva_palavras_sky_particles', String(next));
      return next;
    });
  }, []);

  // Níveis de aparecimento de cada palavra (0%, 25%, 50%, 75%, 100%)
  const [spawnRates, setSpawnRates] = useState<WordSpawnRates>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chuva_palavras_spawn_rates');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return { normal: 100, blue: 50, green: 50 };
  });

  const spawnRatesRef = useRef<WordSpawnRates>(spawnRates);
  spawnRatesRef.current = spawnRates;

  const handleChangeSpawnRate = useCallback((type: 'normal' | 'blue' | 'green', rate: number) => {
    setSpawnRates((prev) => {
      const next = { ...prev, [type]: rate };
      localStorage.setItem('chuva_palavras_spawn_rates', JSON.stringify(next));
      return next;
    });
  }, []);

  // Configurações personalizadas adicionais
  const [volume, setVolume] = useState<number>(() => soundManager.getVolume());
  const [melodicTyping, setMelodicTyping] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chuva_palavras_melodic') !== 'false';
    }
    return true;
  });
  const [screenShakeSetting, setScreenShakeSetting] = useState<ScreenShakeSetting>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('chuva_palavras_screenshake') as ScreenShakeSetting) || 'high';
    }
    return 'high';
  });
  const [skyTheme, setSkyTheme] = useState<SkyTheme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('chuva_palavras_skytheme') as SkyTheme) || 'day';
    }
    return 'day';
  });
  const [wordFontSize, setWordFontSize] = useState<WordFontSize>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('chuva_palavras_wordfontsize') as WordFontSize) || 'normal';
    }
    return 'normal';
  });

  // Idioma do jogo (Português, English, Español, Français)
  const [language, setLanguage] = useState<GameLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chuva_palavras_language') as GameLanguage;
      if (saved && (saved === 'pt' || saved === 'en' || saved === 'es' || saved === 'fr')) {
        return saved;
      }
    }
    return 'pt';
  });
  const languageRef = useRef<GameLanguage>(language);
  languageRef.current = language;

  const handleSetLanguage = useCallback((lang: GameLanguage) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chuva_palavras_language', lang);
    }
  }, []);

  const t = TRANSLATIONS[language] || TRANSLATIONS.pt;
  const [showParticles, setShowParticles] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chuva_palavras_particles') !== 'false';
    }
    return true;
  });

  // Posição do cursor do mouse na área do jogo (para mira interativa 180°)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Estatísticas da partida
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    level: 1,
    wordsTyped: 0,
    bonusWordsTyped: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    errors: 0,
    combo: 0,
    maxCombo: 0,
    startTime: 0,
    wpm: 0,
    accuracy: 100,
  });

  // Fila de palavras ativas (na ordem em que apareceram)
  const [words, setWords] = useState<FallingWord[]>([]);
  // Bolas de canhão teleguiadas em vôo
  const [cannonBalls, setCannonBalls] = useState<CannonBall[]>([]);
  // Letras arrancadas voando pelo ar
  const [flyingLetters, setFlyingLetters] = useState<FlyingLetter[]>([]);
  // Textos flutuantes de pontuação (+100, COMBO!, etc.)
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  // Partículas de explosão
  const [particles, setParticles] = useState<Particle[]>([]);
  // Ondas de choque dinâmicas
  const [shockwaves, setShockwaves] = useState<Shockwave[]>([]);
  // Efeito de tremor de tela (Screen Shake)
  const [screenShake, setScreenShake] = useState<'none' | 'sm' | 'lg' | 'heavy'>('none');
  // Efeito de flash no chão por dano
  const [groundDangerFlash, setGroundDangerFlash] = useState<boolean>(false);
  // Animação de disparo do canhão
  const [isFiring, setIsFiring] = useState<boolean>(false);

  // Rodada Bônus
  const [showBonusIntro, setShowBonusIntro] = useState<boolean>(false);
  const [bonusTimeLeft, setBonusTimeLeft] = useState<number>(20);
  const [bonusScoreEarned, setBonusScoreEarned] = useState<number>(0);
  const [bonusWordsCount, setBonusWordsCount] = useState<number>(0);

  // Ref para medição e coordenadas da área de jogo
  const gameAreaRef = useRef<HTMLDivElement | null>(null);

  // Refs para loop de animação
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const lastSpawnTimeRef = useRef<number>(0);
  const wordsRef = useRef<FallingWord[]>([]);
  wordsRef.current = words;

  const gameModeRef = useRef<GameMode>(gameMode);
  gameModeRef.current = gameMode;

  const statsRef = useRef<GameStats>(stats);
  statsRef.current = stats;

  const livesRef = useRef<number>(lives);
  livesRef.current = lives;

  const bonusTimeLeftRef = useRef<number>(bonusTimeLeft);
  bonusTimeLeftRef.current = bonusTimeLeft;

  const showReverseTutorialRef = useRef<boolean>(false);
  showReverseTutorialRef.current = showReverseTutorial;

  const hasSeenReverseTutorialRef = useRef<boolean>(false);
  hasSeenReverseTutorialRef.current = hasSeenReverseTutorial;

  const showGreenTutorialRef = useRef<boolean>(false);
  showGreenTutorialRef.current = showGreenTutorial;

  const hasSeenGreenTutorialRef = useRef<boolean>(false);
  hasSeenGreenTutorialRef.current = hasSeenGreenTutorial;

  const hasBeatenHighScoreRef = useRef<boolean>(false);

  // Adiciona texto flutuante
  const addFloatingText = useCallback((text: string, x: number, y: number, color: string = '#facc15') => {
    const item: FloatingText = {
      id: `ft-${Date.now()}-${Math.random()}`,
      text,
      x,
      y,
      color,
      createdAt: performance.now(),
    };
    setFloatingTexts((prev) => [...prev, item]);
  }, []);

  // Atualizador e validador de Missões Diárias e Conquistas em tempo real
  const updateMissionsAndAchievements = useCallback(
    (isGreen: boolean, currentCombo: number, totalWordsCount: number, currentScore: number) => {
      // 1. Atualiza Missões Diárias
      setDailyMissions((prevMissions) => {
        let changed = false;
        const updated = prevMissions.map((mission) => {
          if (mission.completed) return mission;
          let newProgress = mission.progress;
          if (mission.type === 'green_words' && isGreen) {
            newProgress += 1;
          } else if (mission.type === 'combo' && currentCombo > mission.progress) {
            newProgress = currentCombo;
          } else if (mission.type === 'total_words') {
            newProgress += 1;
          }

          if (newProgress !== mission.progress) {
            changed = true;
            const completed = newProgress >= mission.target;
            if (completed) {
              soundManager.playDailyMissionComplete();
              addFloatingText(`★ MISSÃO CONCLUÍDA: ${mission.title}! ★`, 50, 20, '#10b981');
            }
            return {
              ...mission,
              progress: Math.min(newProgress, mission.target),
              completed,
            };
          }
          return mission;
        });

        if (changed) {
          const today = new Date().toISOString().slice(0, 10);
          localStorage.setItem(`chuva_palavras_missions_${today}`, JSON.stringify(updated));
        }
        return updated;
      });

      // 2. Atualiza Conquistas e toca efeito 8-bit com POP UP
      setAchievements((prevAchievements) => {
        let changed = false;
        const updated = prevAchievements.map((ach) => {
          if (ach.unlocked) return ach;
          let newProg = ach.progress;

          if (ach.id === 'first_shot') {
            newProg = 1;
          } else if (ach.id === 'combo_10' || ach.id === 'combo_30' || ach.id === 'combo_50') {
            newProg = Math.max(ach.progress, currentCombo);
          } else if (ach.id === 'words_100' || ach.id === 'words_1000') {
            newProg = totalWordsCount;
          } else if (ach.id === 'green_25' && isGreen) {
            newProg += 1;
          } else if (ach.id === 'math_ace' && activeGameModeRef.current === 'MATH') {
            newProg = Math.max(ach.progress, currentScore);
          } else if (ach.id === 'score_15k') {
            newProg = Math.max(ach.progress, currentScore);
          }

          if (newProg !== ach.progress) {
            changed = true;
            const unlocked = newProg >= ach.maxProgress;
            if (unlocked) {
              soundManager.playAchievementUnlocked(ach.tier);
              setCurrentAchievementPopup({ ...ach, unlocked: true, progress: newProg });
            }
            return {
              ...ach,
              progress: Math.min(newProg, ach.maxProgress),
              unlocked,
            };
          }
          return ach;
        });

        if (changed) {
          localStorage.setItem('chuva_palavras_achievements', JSON.stringify(updated));
        }
        return updated;
      });
    },
    [addFloatingText]
  );

  // Atualiza recorde local com som especial e aviso na primeira vez que ultrapassa
  const updateHighScoreIfNeeded = useCallback((currentScore: number) => {
    if (activeGameModeRef.current === 'TIME_ATTACK') {
      if (currentScore > timeAttackHighScore) {
        if (timeAttackHighScore > 0 && !hasBeatenHighScoreRef.current) {
          hasBeatenHighScoreRef.current = true;
          soundManager.playHighScoreBeaten();
          addFloatingText('★ NOVO RECORDE CONTRA O TEMPO! ★', 50, 22, '#38bdf8');
        }
        setTimeAttackHighScore(currentScore);
        localStorage.setItem('chuva_palavras_timeattack_highscore', String(currentScore));
        if (userProfile?.username) {
          autoSubmitScore(
            userProfile.uid,
            userProfile.username,
            currentScore,
            'TIME_ATTACK',
            difficulty,
            statsRef.current.wordsTyped,
            statsRef.current.maxCombo,
            statsRef.current.accuracy
          );
        }
        return true;
      }
      return false;
    }

    if (activeGameModeRef.current === 'BLINDNESS') {
      if (currentScore > blindnessHighScore) {
        if (blindnessHighScore > 0 && !hasBeatenHighScoreRef.current) {
          hasBeatenHighScoreRef.current = true;
          soundManager.playHighScoreBeaten();
          addFloatingText('★ NOVO RECORDE MODO CEGUEIRA! ★', 50, 22, '#a855f7');
        }
        setBlindnessHighScore(currentScore);
        localStorage.setItem('chuva_palavras_blindness_highscore', String(currentScore));
        if (userProfile?.username) {
          autoSubmitScore(
            userProfile.uid,
            userProfile.username,
            currentScore,
            'BLINDNESS',
            difficulty,
            statsRef.current.wordsTyped,
            statsRef.current.maxCombo,
            statsRef.current.accuracy
          );
        }
        return true;
      }
      return false;
    }

    if (currentScore > highScore) {
      if (highScore > 0 && !hasBeatenHighScoreRef.current) {
        hasBeatenHighScoreRef.current = true;
        soundManager.playHighScoreBeaten();
        addFloatingText('★ NOVO RECORDE! ★', 50, 22, '#fbbf24');
      }
      setHighScore(currentScore);
      localStorage.setItem('chuva_palavras_highscore', String(currentScore));
      if (userProfile?.username) {
        autoSubmitScore(
          userProfile.uid,
          userProfile.username,
          currentScore,
          activeGameModeRef.current,
          difficulty,
          statsRef.current.wordsTyped,
          statsRef.current.maxCombo,
          statsRef.current.accuracy
        );
      }
      return true;
    }
    return false;
  }, [highScore, timeAttackHighScore, addFloatingText, userProfile, difficulty]);

  // Aciona tremor de tela (screen shake) respeitando a preferência do jogador
  const triggerScreenShake = useCallback((intensity: 'sm' | 'lg' | 'heavy') => {
    if (screenShakeSetting === 'off') return;
    const finalIntensity = screenShakeSetting === 'low' && intensity === 'heavy' ? 'sm' : intensity;
    setScreenShake(finalIntensity);
    setTimeout(() => {
      setScreenShake('none');
    }, finalIntensity === 'heavy' ? 480 : finalIntensity === 'lg' ? 350 : 180);
  }, [screenShakeSetting]);

  // Rastreia a posição do cursor na área de jogo para mira interativa 180°
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
  }, []);

  // Rastreia o toque na tela em dispositivos móveis (mira 180° por toque no celular)
  const handleTouchAim = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!gameAreaRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
  }, []);

  // Cria uma onda de choque expansiva
  const triggerShockwave = useCallback((xPercent: number, yPercent: number, color: string = 'rgba(255, 255, 255, 0.8)') => {
    const newShockwave: Shockwave = {
      id: `sw-${Date.now()}-${Math.random()}`,
      x: xPercent,
      y: yPercent,
      color,
      createdAt: performance.now(),
    };
    setShockwaves((prev) => [...prev.slice(-4), newShockwave]);
  }, []);

  // Efeito de impacto violento no chão: erupção de cratera, fogo e detritos para cima
  const triggerGroundImpact = useCallback((xPercent: number) => {
    triggerScreenShake('heavy');
    triggerShockwave(xPercent, 96, 'rgba(239, 68, 68, 0.95)');

    // Jato de chamas e fagulhas para cima a partir do chão
    const craterParticles: Particle[] = [];
    const colors = ['#ef4444', '#f97316', '#fbbf24', '#ffffff', '#b91c1c', '#dc2626'];
    for (let i = 0; i < 30; i++) {
      const vx = (Math.random() - 0.5) * 16;
      const vy = -4 - Math.random() * 11;
      craterParticles.push({
        id: `crater-${Date.now()}-${Math.random()}`,
        x: xPercent + (Math.random() - 0.5) * 6,
        y: 96,
        vx,
        vy,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
        alpha: 1,
        life: 0,
      });
    }
    setParticles((prev) => [...prev, ...craterParticles]);
  }, [triggerScreenShake, triggerShockwave]);

  // Cria partículas de explosão remasterizadas (faíscas, estrelas e plasma)
  const triggerExplosion = useCallback((xPercent: number, yPercent: number, isBonus: boolean = false, isGreen: boolean = false) => {
    const newParticles: Particle[] = [];
    const count = isBonus ? 30 : isGreen ? 28 : 20;
    const colors = isBonus
      ? ['#fbbf24', '#f59e0b', '#fef08a', '#ffffff', '#ea580c', '#ffd700']
      : isGreen
      ? ['#10b981', '#34d399', '#059669', '#6ee7b7', '#ffffff', '#a7f3d0', '#047857']
      : ['#38bdf8', '#0284c7', '#f97316', '#fbbf24', '#ffffff', '#60a5fa'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const speed = 1.8 + Math.random() * 4.2;
      const isStar = (isBonus || isGreen) && Math.random() < 0.35;
      newParticles.push({
        id: `p-${Date.now()}-${Math.random()}`,
        x: xPercent,
        y: yPercent,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: isStar ? 12 : 3 + Math.random() * 5,
        alpha: 1,
        life: 0,
        isStar,
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  // Finaliza a partida do Modo Contra o Tempo quando o cronômetro chega a 0
  const finishTimeAttack = useCallback(() => {
    soundManager.playGameOver();
    setGameMode('GAME_OVER');
    setStats((prev) => {
      const finalScore = prev.score;
      if (finalScore > timeAttackHighScore) {
        setTimeAttackHighScore(finalScore);
        localStorage.setItem('chuva_palavras_timeattack_highscore', String(finalScore));
        soundManager.playHighScoreBeaten();
      }
      return prev;
    });
  }, [timeAttackHighScore]);

  // Inicia uma nova partida
  const startGame = useCallback(() => {
    soundManager.playButtonClick();

    if (activeGameModeRef.current === 'REFLEX') {
      setGameMode('REFLEX');
      return;
    }

    const now = performance.now();
    const startLives = getMaxLivesByDifficulty(difficulty);
    setLives(startLives);
    setWords([]);
    setCannonBalls([]);
    setFlyingLetters([]);
    setParticles([]);
    setFloatingTexts([]);
    setGroundDangerFlash(false);
    setShowBonusIntro(false);
    setBonusTimeLeft(20);
    setBonusScoreEarned(0);
    setBonusWordsCount(0);
    setShowReverseTutorial(false);
    setHasSeenReverseTutorial(false);
    showReverseTutorialRef.current = false;
    hasSeenReverseTutorialRef.current = false;
    setShowGreenTutorial(false);
    setHasSeenGreenTutorial(false);
    showGreenTutorialRef.current = false;
    hasSeenGreenTutorialRef.current = false;
    hasBeatenHighScoreRef.current = false;

    if (activeGameModeRef.current === 'TIME_ATTACK') {
      setTimeAttackLeft(60);
      timeAttackLeftRef.current = 60;
    }

    setStats({
      score: 0,
      highScore:
        activeGameModeRef.current === 'TIME_ATTACK'
          ? timeAttackHighScore
          : activeGameModeRef.current === 'BLINDNESS'
          ? blindnessHighScore
          : highScore,
      level: 1,
      wordsTyped: 0,
      bonusWordsTyped: 0,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      errors: 0,
      combo: 0,
      maxCombo: 0,
      startTime: now,
      wpm: 0,
      accuracy: 100,
    });

    lastTimeRef.current = now;
    lastSpawnTimeRef.current = activeGameModeRef.current === 'TIME_ATTACK' ? now - 4000 : now - 1500;
    setGameMode('PLAYING');
  }, [difficulty, highScore, timeAttackHighScore, blindnessHighScore]);

  // Alteração de volume e persistência da trilha 8-Bit
  const handleChangeMusicVolume = useCallback((val: number) => {
    setMusicVolume(val);
    soundManager.setMusicVolume(val);
  }, []);

  // Sistema de Trilha Sonora 8-Bit que altera dinamicamente com base no modo de jogo
  useEffect(() => {
    if (isMuted || musicVolume <= 0) {
      soundManager.stopBGM();
      return;
    }

    if (gameMode === 'MENU') {
      soundManager.playBGM('menu');
    } else if (gameMode === 'PLAYING') {
      if (activeGameMode === 'TIME_ATTACK') {
        soundManager.playBGM('time_attack');
      } else if (activeGameMode === 'BLINDNESS') {
        soundManager.playBGM('blindness');
      } else {
        soundManager.playBGM('classic');
      }
    } else if (gameMode === 'BONUS') {
      soundManager.playBGM('bonus');
    } else if (gameMode === 'DUEL') {
      soundManager.playBGM('duel');
    } else if (gameMode === 'PAUSED' || gameMode === 'GAME_OVER') {
      soundManager.stopBGM();
    }
  }, [gameMode, activeGameMode, isMuted, musicVolume]);

  // Transição para Nível Bônus
  const startBonusRound = useCallback(() => {
    soundManager.playBonusStart();
    setShowBonusIntro(true);
    setBonusTimeLeft(20);
    setBonusScoreEarned(0);
    setBonusWordsCount(0);

    // Limpa palavras normais que caíram para focar na rodada bônus
    setWords([]);
    setCannonBalls([]);

    setTimeout(() => {
      setShowBonusIntro(false);
      setGameMode('BONUS');
      lastSpawnTimeRef.current = performance.now();
    }, 2400);
  }, []);

  // Finaliza a Rodada Bônus e volta ao jogo normal
  const finishBonusRound = useCallback(() => {
    soundManager.playWordDestroyed(true);

    if (bonusWordsCount >= 3) {
      soundManager.playExtraLife();
      setLives((prev) => Math.min(maxLives, prev + 1));
      addFloatingText('+1 VIDA EXTRA!', 50, 45, '#10b981');
    }

    addFloatingText(`BÔNUS CONCLUÍDO: +${bonusScoreEarned} PTS!`, 50, 40, '#f59e0b');

    setStats((prev) => ({
      ...prev,
      level: prev.level + 1,
    }));

    setWords([]);
    setCannonBalls([]);
    setGameMode('PLAYING');
    lastSpawnTimeRef.current = performance.now();
  }, [bonusWordsCount, bonusScoreEarned, maxLives, addFloatingText]);

  // Calcula velocidade base e spawn rate baseado no nível e dificuldade
  const getSpeedAndInterval = useCallback(() => {
    const lvl = statsRef.current.level;
    let baseSpeed = 4.0;
    let spawnInterval = 3000;

    switch (difficulty) {
      case 'bebe':
        baseSpeed = 1.9 + (lvl - 1) * 0.25;
        spawnInterval = Math.max(2200, 4200 - (lvl - 1) * 180);
        break;
      case 'facil':
        baseSpeed = 3.0 + (lvl - 1) * 0.4;
        spawnInterval = Math.max(1800, 3600 - (lvl - 1) * 200);
        break;
      case 'normal':
        baseSpeed = 4.5 + (lvl - 1) * 0.6;
        spawnInterval = Math.max(1400, 3000 - (lvl - 1) * 220);
        break;
      case 'media':
        baseSpeed = 5.5 + (lvl - 1) * 0.75;
        spawnInterval = Math.max(1200, 2600 - (lvl - 1) * 230);
        break;
      case 'dificil':
        baseSpeed = 6.8 + (lvl - 1) * 0.85;
        spawnInterval = Math.max(1000, 2200 - (lvl - 1) * 240);
        break;
      case 'speed_typer':
        baseSpeed = 8.5 + (lvl - 1) * 1.0;
        spawnInterval = Math.max(800, 1600 - (lvl - 1) * 200);
        break;
    }

    if (activeGameModeRef.current === 'TIME_ATTACK') {
      // No modo Contra o Tempo vai o triplo de palavras que o modo normal! (1/3 do intervalo normal)
      spawnInterval = Math.max(300, Math.round(spawnInterval / 3));
    }

    if (gameModeRef.current === 'BONUS') {
      baseSpeed *= 1.3;
      spawnInterval = 900;
    }

    return { baseSpeed, spawnInterval };
  }, [difficulty]);

  // Disparo de Tecla e Lógica de Bola de Canhão Teleguiada
  const handleKeyInput = useCallback((charTyped: string) => {
    if (charTyped === ' ') return;
    if (gameModeRef.current !== 'PLAYING' && gameModeRef.current !== 'BONUS') {
      return;
    }
    if (showReverseTutorialRef.current || showGreenTutorialRef.current) {
      return;
    }

    const currentWords = wordsRef.current;
    if (currentWords.length === 0) return;

    // Palavra verde tem PRIORIDADE AUTOMÁTICA! Se houver uma verde ativa (ainda não completada), o canhão foca nela imediatamente
    const greenWord = currentWords.find((w) => w.isGreen && w.typedLength < w.text.length);
    const targetWord = greenWord || currentWords.find((w) => w.typedLength < w.text.length);
    if (!targetWord) {
      // Todas as palavras ativas na tela já foram totalmente digitadas pelo jogador (aguardando impacto das bolas)
      return;
    }

    // Se a palavra for azul (invertida), espera a letra de trás para frente!
    const expectedChar = targetWord.isReverse
      ? targetWord.text[targetWord.text.length - 1 - targetWord.typedLength]
      : targetWord.text[targetWord.typedLength];
    if (!expectedChar) return;

    const normTyped = accentTolerant ? normalizeChar(charTyped) : charTyped.toLowerCase();
    const normExpected = accentTolerant ? normalizeChar(expectedChar) : expectedChar.toLowerCase();

    // Atualiza contagem total de teclas
    setStats((prev) => {
      const total = prev.totalKeystrokes + 1;
      const isMatch = normTyped === normExpected;
      const correct = isMatch ? prev.correctKeystrokes + 1 : prev.correctKeystrokes;
      const errors = isMatch ? prev.errors : prev.errors + 1;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;

      const elapsedMinutes = (performance.now() - prev.startTime) / 60000;
      const wpm = elapsedMinutes > 0.05 ? Math.round((prev.wordsTyped) / elapsedMinutes) : 0;

      return {
        ...prev,
        totalKeystrokes: total,
        correctKeystrokes: correct,
        errors,
        accuracy,
        wpm,
      };
    });

    if (normTyped === normExpected) {
      // ACERTO!
      const newTypedLength = targetWord.typedLength + 1;
      const isFinalLetter = newTypedLength >= targetWord.text.length;

      // Velocidade do tiro reduzida (~1.85 = ~540ms em vôo para visualização clara do projétil)
      const shotSpeed = 1.85;

      // Dispara uma bola de canhão teleguiada em direção à palavra alvo
      const ballId = `ball-${Date.now()}-${Math.random()}`;
      const newBall: CannonBall = {
        id: ballId,
        startX: 50,
        startY: 96, // Emerge diretamente da boca do canhão posicionado no chão
        x: 50,
        y: 96,
        targetWordId: targetWord.id,
        targetX: targetWord.x,
        targetY: targetWord.y,
        char: expectedChar,
        charIndex: targetWord.typedLength,
        isFinalLetter,
        progress: 0,
        speed: shotSpeed,
        createdAt: performance.now(),
      };

      setCannonBalls((prev) => [...prev, newBall]);

      // Animação de disparo e recuo do canhão
      setIsFiring(true);
      setTimeout(() => setIsFiring(false), 90);

      // Som potente de disparo de canhão
      soundManager.playCannonFire();

      // Som musical dinâmico de digitação (escala sobe com o combo) se ativado nas configurações
      if (melodicTyping) {
        soundManager.playKeyStroke(statsRef.current.combo + 1);
      }

      // Atualiza o progresso de digitação na palavra alvo
      setWords((prev) => {
        const targetIdx = prev.findIndex((w) => w.id === targetWord.id);
        if (targetIdx === -1) return prev;
        const updated = [...prev];
        updated[targetIdx] = {
          ...updated[targetIdx],
          typedLength: newTypedLength,
        };
        wordsRef.current = updated;
        return updated;
      });
    } else {
      // ERRO DE DIGITAÇÃO!
      soundManager.playTypo();
      triggerScreenShake('sm');
      // As palavras verdes não tiram o combo!
      if (!targetWord?.isGreen) {
        setStats((prev) => {
          if (prev.combo >= 2) {
            setComboBreakFlash(true);
            setTimeout(() => setComboBreakFlash(false), 380);
            soundManager.playComboBreakDiscouraged();
            addFloatingText('COMBO QUEBRADO!', 50, 45, '#ef4444');
          }
          return {
            ...prev,
            combo: 0,
          };
        });
      }
    }
  }, [accentTolerant, melodicTyping, triggerScreenShake]);

  // Trocador de palavra compartilhado (tecla Espaço no PC ou botão de toque no celular)
  const handleSwitchTarget = useCallback(() => {
    // Não funciona enquanto houver uma palavra verde ativa (ainda não completada)
    if (wordsRef.current.some((w) => w.isGreen && w.typedLength < w.text.length)) {
      soundManager.playTypo();
      return;
    }
    const uncompleted = wordsRef.current.filter((w) => w.typedLength < w.text.length);
    if (uncompleted.length >= 2) {
      setWords((prev) => {
        const activeIdxs: number[] = [];
        prev.forEach((w, i) => {
          if (w.typedLength < w.text.length) activeIdxs.push(i);
        });
        if (activeIdxs.length < 2) return prev;
        const copy = [...prev];
        const firstIdx = activeIdxs[0];
        const secondIdx = activeIdxs[1];
        const temp = copy[firstIdx];
        copy[firstIdx] = copy[secondIdx];
        copy[secondIdx] = temp;
        wordsRef.current = copy;
        return copy;
      });
      soundManager.playButtonClick();
      addFloatingText(TRANSLATIONS[languageRef.current]?.targetSwapped || '⇄ ALVO TROCADO', 50, 78, '#38bdf8');
    }
  }, [addFloatingText]);

  // Listener global de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCustomize) {
          setShowCustomize(false);
          return;
        }
        if (showModes) {
          setShowModes(false);
          return;
        }
        if (showSettings) {
          setShowSettings(false);
          return;
        }
        if (showRules) {
          setShowRules(false);
          return;
        }
        if (gameMode === 'PLAYING' || gameMode === 'BONUS') {
          setGameMode('PAUSED');
        } else if (gameMode === 'PAUSED') {
          setGameMode('PLAYING');
        }
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Tab') {
        e.preventDefault();
        return;
      }
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (gameMode !== 'PLAYING' && gameMode !== 'BONUS') {
          return;
        }
        if (showCustomize || showModes || showSettings || showRules || showReverseTutorial || showGreenTutorial) {
          return;
        }
        handleSwitchTarget();
        return;
      }

      if (e.key === 'Dead') {
        return;
      }

      if (e.key.length === 1 && !e.repeat && !showCustomize && !showModes && !showSettings && !showRules && !showReverseTutorial && !showGreenTutorial) {
        handleKeyInput(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, handleKeyInput, handleSwitchTarget, showCustomize, showModes, showSettings, showRules, showReverseTutorial, showGreenTutorial]);

  // Timer para contagem regressiva da Rodada Bônus
  useEffect(() => {
    if (gameMode !== 'BONUS') return;

    const interval = setInterval(() => {
      setBonusTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishBonusRound();
          return 0;
        }
        if (prev <= 6 && prev > 1) {
          soundManager.playCountdownTick(prev === 2);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameMode, finishBonusRound]);

  // Timer para contagem regressiva do Modo Contra o Tempo (60 segundos)
  useEffect(() => {
    if (activeGameMode !== 'TIME_ATTACK' || gameMode !== 'PLAYING') return;

    const interval = setInterval(() => {
      setTimeAttackLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishTimeAttack();
          return 0;
        }
        if (prev <= 11 && prev > 1) {
          soundManager.playCountdownTick(prev <= 4);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeGameMode, gameMode, finishTimeAttack]);

  // Loop de Animação Principal (60fps requestAnimationFrame)
  useEffect(() => {
    const gameLoop = (currentTime: number) => {
      const deltaSec = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = currentTime;

      const currentMode = gameModeRef.current;

      // Se qualquer modal de tutorial estiver aberto, pausa temporariamente a simulação do jogo
      if (showReverseTutorialRef.current || showGreenTutorialRef.current) {
        lastTimeRef.current = currentTime;
        lastSpawnTimeRef.current = currentTime;
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      if (currentMode === 'PLAYING' || currentMode === 'BONUS') {
        const { baseSpeed, spawnInterval } = getSpeedAndInterval();

        // 1. Spawning de Novas Palavras baseado na categoria e dificuldade escolhida
        const isTimeAttack = activeGameModeRef.current === 'TIME_ATTACK';
        const maxWordsOnScreen = isTimeAttack ? 15 : 5;

        if (currentTime - lastSpawnTimeRef.current > spawnInterval) {
          lastSpawnTimeRef.current = currentTime;

          if (wordsRef.current.length < maxWordsOnScreen) {
            const isBonusWord = currentMode === 'BONUS';
            const rates = spawnRatesRef.current;
            const allowNormal = rates.normal > 0;
            const allowBlue = rates.blue > 0;
            const allowGreen = rates.green > 0;

            const hasActiveGreen = wordsRef.current.some((w) => w.isGreen && w.typedLength < w.text.length);
            const hasWordNearDanger = wordsRef.current.some((w) => w.y > 60 && w.typedLength < w.text.length);
            const isMath = activeGameModeRef.current === 'MATH';

            // No modo matemática não há palavras azuis (inversas), apenas verdes e problemas normais
            const canBeGreen = allowGreen && !isTimeAttack && !isBonusWord && difficulty !== 'bebe' && difficulty !== 'facil' && !hasActiveGreen && !hasWordNearDanger;
            const canBeBlue = !isMath && allowBlue && !isTimeAttack && !isBonusWord && difficulty !== 'bebe' && difficulty !== 'facil';

            let isReverseWord = false;
            let isGreenWord = false;

            // Roleta proporcional às porcentagens definidas pelo usuário (0%, 25%, 50%, 75%, 100%)
            const normalWeight = allowNormal ? rates.normal : 0;
            const blueWeight = canBeBlue ? (rates.blue * 0.45) : 0;
            const greenWeight = canBeGreen ? (rates.green * 0.45) : 0;
            const totalWeight = Math.max(1, normalWeight + blueWeight + greenWeight);

            const roll = Math.random() * totalWeight;
            if (roll < greenWeight) {
              isGreenWord = true;
            } else if (roll < greenWeight + blueWeight) {
              isReverseWord = true;
            }

            // Geração de conteúdo: Operação Matemática no Modo Math ou Palavra nos demais modos
            let wordText = '';
            let mathExpr: string | undefined = undefined;

            if (isMath) {
              const problem = getRandomMathProblem(difficulty);
              wordText = problem.answer;
              mathExpr = problem.expression;
            } else {
              wordText = getRandomWord(statsRef.current.level, category, difficulty, isBonusWord, isReverseWord, languageRef.current);
            }

            // Se for a primeira vez que uma palavra azul surge nesta partida, exibe a explicação e pausa o jogo
            if (isReverseWord && !hasSeenReverseTutorialRef.current) {
              hasSeenReverseTutorialRef.current = true;
              setHasSeenReverseTutorial(true);
              showReverseTutorialRef.current = true;
              setShowReverseTutorial(true);
            }

            // Se for a primeira vez que uma palavra verde surge nesta partida, exibe o tutorial e pausa o jogo
            if (isGreenWord && !hasSeenGreenTutorialRef.current) {
              hasSeenGreenTutorialRef.current = true;
              setHasSeenGreenTutorial(true);
              showGreenTutorialRef.current = true;
              setShowGreenTutorial(true);
            }

            // Efeitos sonoros ao spawnar palavras com mecânicas especiais ou normais
            if (isGreenWord) {
              soundManager.playGreenWordSpawn();
            } else if (isReverseWord) {
              soundManager.playReverseWordSpawn();
            } else {
              soundManager.playWordSpawn();
            }

            let newX = 14 + Math.random() * 70;
            const recentWords = wordsRef.current.slice(-3);
            if (recentWords.some((rw) => Math.abs(rw.x - newX) < 14)) {
              newX = (newX + 33) % 70 + 14;
            }

            // Velocidades:
            // - No Modo Contra o Tempo: todas as palavras caem na MESMA velocidade exata constante
            // - No Modo Clássico:
            //   * Palavras verdes caem mais rápido (~1.45x)
            //   * Palavras azuis têm velocidade um pouco menor (~0.85x)
            //   * Variação sutil aleatória
            const normalSpeed = baseSpeed + (Math.random() * 0.8 - 0.4);
            const wordSpeed = isTimeAttack
              ? baseSpeed
              : isGreenWord
              ? normalSpeed * 1.45
              : isReverseWord
              ? normalSpeed * 0.85
              : normalSpeed;

            // Parâmetros de balanço horizontal (vento / drift)
            const driftPhase = Math.random() * Math.PI * 2;
            const driftSpeed = 0.9 + Math.random() * 1.1; // frequência do vento
            const driftAmplitude = 1.8 + Math.random() * 2.4; // balanço suave entre 1.8% e 4.2% da tela
            const baseX = Math.round(newX);

            const newWord: FallingWord = {
              id: `w-${Date.now()}-${Math.random()}`,
              text: wordText,
              normalizedText: wordText.toLowerCase(),
              x: baseX,
              y: 8,
              speed: wordSpeed,
              typedLength: 0,
              lettersRemoved: 0,
              isBonus: isBonusWord,
              isReverse: isReverseWord,
              isGreen: isGreenWord,
              mathExpression: mathExpr,
              spawnTime: currentTime,
              driftPhase,
              driftSpeed,
              driftAmplitude,
              baseX,
              tilt: 0,
              points: Math.round(
                (wordText.length * 20 + 50) * (isReverseWord ? 1.5 : isGreenWord ? 1.75 : 1)
              ),
            };

            setWords((prev) => [...prev, newWord]);
          }
        }

        // 2. Queda das Palavras, Balanço do Vento (Drift) e Detecção de Colisão com o Chão
        setWords((prevWords) => {
          let hasGroundImpact = false;
          let groundHitBonus = false;
          let hasNonGreenGroundImpact = false;

          const updatedWords: FallingWord[] = [];

          for (const word of prevWords) {
            const nextY = word.y + word.speed * deltaSec;

            // Área de colisão exatamente no chão (96% da altura do céu)
            if (nextY >= 96) {
              const isWordCompleted = word.typedLength >= word.text.length;
              if (isWordCompleted) {
                // Palavra já totalmente digitada pelo jogador: NÃO perde vida nem sofre dano mesmo se encostar no chão!
                // Permanece no chão em segurança aguardando a chegada e impacto das bolas de canhão teleguiadas
                const driftPhase = word.driftPhase ?? 0;
                const driftSpeed = word.driftSpeed ?? 1.1;
                const driftAmplitude = word.driftAmplitude ?? 2.2;
                const baseX = word.baseX ?? word.x;
                const age = (currentTime - word.spawnTime) / 1000;
                const driftOffset = Math.sin(age * driftSpeed + driftPhase) * driftAmplitude;
                const nextX = Math.max(10, Math.min(90, baseX + driftOffset));
                const tilt = Math.cos(age * driftSpeed + driftPhase) * 3.0;

                updatedWords.push({
                  ...word,
                  x: nextX,
                  y: 95.5,
                  tilt,
                });
              } else {
                hasGroundImpact = true;
                groundHitBonus = Boolean(word.isBonus);
                if (!word.isGreen) {
                  hasNonGreenGroundImpact = true;
                }
                triggerGroundImpact(word.x);
              }
            } else {
              // Efeito de leve balanço horizontal (drift) simulando o efeito do vento
              const driftPhase = word.driftPhase ?? 0;
              const driftSpeed = word.driftSpeed ?? 1.1;
              const driftAmplitude = word.driftAmplitude ?? 2.2;
              const baseX = word.baseX ?? word.x;
              const age = (currentTime - word.spawnTime) / 1000;

              // Balanço horizontal oscilante seguro dentro das bordas
              const driftOffset = Math.sin(age * driftSpeed + driftPhase) * driftAmplitude;
              const nextX = Math.max(10, Math.min(90, baseX + driftOffset));

              // Leve inclinação aerodinâmica das palavras conforme o vento (-3° a +3°)
              const tilt = Math.cos(age * driftSpeed + driftPhase) * 3.0;

              updatedWords.push({
                ...word,
                x: nextX,
                y: nextY,
                tilt,
              });
            }
          }

          if (hasGroundImpact) {
            triggerScreenShake('heavy');
            if (currentMode === 'PLAYING') {
              if (activeGameModeRef.current === 'TIME_ATTACK') {
                // No Modo Contra o Tempo: palavras verdes não tiram o combo!
                soundManager.playTypo();
                if (hasNonGreenGroundImpact) {
                  setStats((prev) => ({ ...prev, combo: 0 }));
                }
              } else {
                soundManager.playDangerAlert();
                setGroundDangerFlash(true);
                setTimeout(() => setGroundDangerFlash(false), 550);

                // Vibração intensa e distorção visual ao perder vida no modo clássico/normal
                triggerScreenShake('heavy');
                setLifeLossDistortion(true);
                setTimeout(() => setLifeLossDistortion(false), 450);

                // Palavras verdes não tiram o combo. Se palavra normal cair e combo for >= 2, quebra de combo!
                if (hasNonGreenGroundImpact) {
                  setStats((prev) => {
                    if (prev.combo >= 2) {
                      setComboBreakFlash(true);
                      setTimeout(() => setComboBreakFlash(false), 380);
                      soundManager.playComboBreakDiscouraged();
                      addFloatingText('COMBO QUEBRADO!', 50, 45, '#ef4444');
                    }
                    return { ...prev, combo: 0 };
                  });
                }

                const newLives = livesRef.current - 1;
                setLives(newLives);

                if (newLives <= 0) {
                  soundManager.playGameOver();
                  setGameMode('GAME_OVER');
                  updateHighScoreIfNeeded(statsRef.current.score);
                }
              }
            } else {
              soundManager.playTypo();
            }
          }

          return updatedWords;
        });

        // 3. FÍSICA DAS BOLAS DE CANHÃO TELEGUIADAS & REMOÇÃO DE LETRAS
        setCannonBalls((prevBalls) => {
          const remainingBalls: CannonBall[] = [];
          const currentWordsMap = new Map(wordsRef.current.map((w) => [w.id, w]));

          for (const ball of prevBalls) {
            const currentTarget = currentWordsMap.get(ball.targetWordId);

            // Teleguiada: rastreia a posição em tempo real da palavra alvo enquanto ela cai
            const curTargetX = currentTarget ? currentTarget.x : ball.targetX;
            const curTargetY = currentTarget ? currentTarget.y : ball.targetY;

            const nextProgress = ball.progress + ball.speed * deltaSec;

            if (nextProgress >= 1) {
              // IMPACTO! A BOLA DE CANHÃO ACERTA A PALAVRA!
              soundManager.playCannonImpact(ball.isFinalLetter);

              // Explosão de faíscas/fumaça no local do impacto
              triggerExplosion(curTargetX, curTargetY, false, Boolean(currentTarget?.isGreen));

              // A letra digitada se solta fisicamente e voa pelo ar com rotação!
              const newFlyingLetter: FlyingLetter = {
                id: `fl-${Date.now()}-${Math.random()}`,
                char: ball.char,
                x: curTargetX,
                y: curTargetY,
                vx: (Math.random() - 0.5) * 14,
                vy: -9 - Math.random() * 6,
                rotation: 0,
                vRot: (Math.random() - 0.5) * 500,
                alpha: 1,
                createdAt: currentTime,
              };
              setFlyingLetters((prevFL) => [...prevFL, newFlyingLetter]);

              // Tira a letra da palavra atingida
              setWords((prevWords) => {
                const wordIdx = prevWords.findIndex((w) => w.id === ball.targetWordId);
                if (wordIdx === -1) return prevWords;

                const target = prevWords[wordIdx];
                const newLettersRemoved = (target.lettersRemoved || 0) + 1;
                const isWordFullyDestroyed = newLettersRemoved >= target.text.length;

                if (isWordFullyDestroyed) {
                  // A palavra foi totalmente desmantelada pelas bolas de canhão!
                  const isBonus = Boolean(target.isBonus);
                  const isRev = Boolean(target.isReverse);
                  const isGrn = Boolean(target.isGreen);
                  const comboMultiplier = Math.min(5, 1 + Math.floor(statsRef.current.combo / 4));
                  const bonusStageMultiplier = gameModeRef.current === 'BONUS' ? 2 : 1;
                  const reverseMultiplier = isRev ? 1.5 : 1;
                  const greenMultiplier = isGrn ? 1.75 : 1;
                  const wordPoints = Math.round(
                    (target.text.length * 20 + 50) * comboMultiplier * bonusStageMultiplier * reverseMultiplier * greenMultiplier
                  );

                  if (isGrn) {
                    soundManager.playGreenWordDestroyed();
                    triggerExplosion(target.x, target.y, false, true);
                    triggerShockwave(target.x, target.y, '#10b981');
                    triggerScreenShake('sm');
                  } else {
                    soundManager.playWordDestroyed(isBonus || isRev);
                    triggerExplosion(target.x, target.y, isBonus || isRev, false);
                    triggerShockwave(target.x, target.y, isBonus ? '#f59e0b' : isRev ? '#38bdf8' : '#60a5fa');
                    if (isBonus || comboMultiplier >= 3) {
                      triggerScreenShake('sm');
                    }
                  }

                  addFloatingText(
                    isGrn
                      ? `+${wordPoints} (PRIORIDADE!)`
                      : isRev
                      ? `+${wordPoints} (INVERSA!)`
                      : comboMultiplier > 1
                      ? `+${wordPoints} (${comboMultiplier}x)`
                      : `+${wordPoints}`,
                    target.x,
                    target.y - 3,
                    isGrn ? '#10b981' : isRev ? '#38bdf8' : isBonus ? '#facc15' : '#38bdf8'
                  );

                  setStats((prevStats) => {
                    const newScore = prevStats.score + wordPoints;
                    const newWordsTyped = prevStats.wordsTyped + 1;
                    const newBonusWords = isBonus ? prevStats.bonusWordsTyped + 1 : prevStats.bonusWordsTyped;
                    const newCombo = prevStats.combo + 1;
                    const maxCombo = Math.max(prevStats.maxCombo, newCombo);

                    // Efeito sonoro e impacto a cada 5 combos atingidos
                    if (newCombo > 0 && newCombo % 5 === 0) {
                      soundManager.playComboMilestone(newCombo);
                      triggerScreenShake('sm');
                    }

                    let nextLevel = prevStats.level;
                    if (newWordsTyped % 7 === 0 && gameModeRef.current === 'PLAYING') {
                      nextLevel = prevStats.level + 1;
                      if (nextLevel % 4 === 0) {
                        setTimeout(() => {
                          startBonusRound();
                        }, 400);
                      } else {
                        soundManager.playLevelUp();
                        setLevelUpTransition({ level: nextLevel, show: true });
                        setTimeout(() => {
                          setLevelUpTransition((p) => ({ ...p, show: false }));
                        }, 2200);
                        addFloatingText(`NÍVEL ${nextLevel}!`, 50, 30, '#38bdf8');
                      }
                    }

                    updateHighScoreIfNeeded(newScore);
                    updateMissionsAndAchievements(isGrn, newCombo, newWordsTyped, newScore);

                    return {
                      ...prevStats,
                      score: newScore,
                      wordsTyped: newWordsTyped,
                      bonusWordsTyped: newBonusWords,
                      combo: newCombo,
                      maxCombo,
                      level: nextLevel,
                    };
                  });

                  if (gameModeRef.current === 'BONUS') {
                    setBonusWordsCount((p) => p + 1);
                    setBonusScoreEarned((p) => p + wordPoints);
                  }

                  // Remove a palavra concluída da fila
                  return prevWords.filter((w) => w.id !== target.id);
                } else {
                  // Retira a letra atingida da palavra
                  const updated = [...prevWords];
                  updated[wordIdx] = {
                    ...target,
                    lettersRemoved: newLettersRemoved,
                  };
                  return updated;
                }
              });
            } else {
              // Bola de canhão continua em vôo teleguiado
              remainingBalls.push({
                ...ball,
                targetX: curTargetX,
                targetY: curTargetY,
                progress: nextProgress,
                x: ball.startX + (curTargetX - ball.startX) * nextProgress,
                y: ball.startY + (curTargetY - ball.startY) * nextProgress,
              });
            }
          }

          return remainingBalls;
        });

        // 4. Animação das letras arrancadas voando pelo ar
        setFlyingLetters((prev) =>
          prev
            .map((fl) => ({
              ...fl,
              x: fl.x + fl.vx * deltaSec * 8,
              y: fl.y + fl.vy * deltaSec * 8,
              vy: fl.vy + 26 * deltaSec, // gravidade
              rotation: fl.rotation + fl.vRot * deltaSec,
              alpha: Math.max(0, fl.alpha - deltaSec * 1.6),
            }))
            .filter((fl) => fl.alpha > 0.05)
        );

        // 5. Atualização das partículas de explosão
        setParticles((prev) =>
          prev
            .map((p) => ({
              ...p,
              x: p.x + p.vx * deltaSec * 8,
              y: p.y + p.vy * deltaSec * 8,
              alpha: Math.max(0, p.alpha - deltaSec * 1.8),
              life: p.life + deltaSec,
            }))
            .filter((p) => p.alpha > 0.05)
        );

        // 6. Atualização dos textos flutuantes
        setFloatingTexts((prev) =>
          prev
            .map((ft) => ({
              ...ft,
              y: ft.y - deltaSec * 7,
            }))
            .filter((ft) => currentTime - ft.createdAt < 1200)
        );

        // 7. Atualização das ondas de choque expansivas
        setShockwaves((prev) =>
          prev.filter((sw) => currentTime - sw.createdAt < 550)
        );
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [getSpeedAndInterval, triggerExplosion, triggerShockwave, triggerScreenShake, triggerGroundImpact, updateHighScoreIfNeeded, updateMissionsAndAchievements, startBonusRound, addFloatingText, category, difficulty]);

  // Alvo atual do canhão: prioriza palavras verdes ativas (ainda não completadas), depois a próxima palavra não completada
  const targetWord =
    words.find((w) => w.isGreen && w.typedLength < w.text.length) ||
    words.find((w) => w.typedLength < w.text.length);

  // Toggle Som
  const handleToggleSound = () => {
    const isNowMuted = soundManager.toggleMute();
    setIsMuted(isNowMuted);
    if (!isNowMuted) {
      soundManager.playButtonClick();
    }
  };

  // Zerar recordes salvos
  const handleResetHighScores = useCallback(() => {
    localStorage.removeItem('chuva_palavras_highscore');
    localStorage.removeItem('chuva_palavras_timeattack_highscore');
    localStorage.removeItem('chuva_palavras_reflexo_highscore');
    setHighScore(0);
    setTimeAttackHighScore(0);
    setReflexHighScore(0);
  }, []);

  // Toggle Pausa
  const handleTogglePause = () => {
    soundManager.playButtonClick();
    if (gameMode === 'PLAYING' || gameMode === 'BONUS') {
      setGameMode('PAUSED');
    } else if (gameMode === 'PAUSED') {
      setGameMode('PLAYING');
    }
  };

  return (
    <div className="relative w-screen h-screen h-[100dvh] overflow-hidden font-sans select-none flex flex-col justify-between">
      {/* HUD Superior (Conforme Top Bar Contract) */}
      <HUD
        stats={stats}
        lives={lives}
        maxLives={maxLives}
        gameMode={gameMode}
        activeGameMode={activeGameMode}
        bonusTimeLeft={bonusTimeLeft}
        isTimeAttack={activeGameMode === 'TIME_ATTACK'}
        timeAttackLeft={timeAttackLeft}
        isMuted={isMuted}
        language={language}
        onChangeLanguage={handleSetLanguage}
        onToggleSound={handleToggleSound}
        onTogglePause={handleTogglePause}
        onOpenRules={() => {
          soundManager.playButtonClick();
          setShowRules(true);
        }}
        onOpenFeedback={() => {
          soundManager.playButtonClick();
          setShowFeedback(true);
        }}
      />

      {/* ÁREA DO CÉU E JOGO (Com suporte a temas, mira de mouse/toque 180° e tremor) */}
      <div
        ref={gameAreaRef}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchAim}
        onTouchMove={handleTouchAim}
        className={`relative flex-1 w-full transition-colors duration-700 overflow-hidden ${
          screenShake === 'heavy'
            ? 'animate-shake-heavy'
            : screenShake === 'lg'
            ? 'animate-shake-lg'
            : screenShake === 'sm'
            ? 'animate-shake-sm'
            : ''
        } ${
          gameMode === 'BONUS'
            ? 'bg-gradient-to-b from-amber-500 via-orange-400 to-sky-300'
            : skyTheme === 'sunset'
            ? 'bg-gradient-to-b from-[#3b0764] via-[#be185d] to-[#fb923c]'
            : skyTheme === 'night'
            ? 'bg-gradient-to-b from-[#020617] via-[#0b1329] to-[#1e293b]'
            : 'bg-gradient-to-b from-[#60b5ff] via-[#92d0ff] to-[#d6efff]'
        }`}
        style={{
          filter: comboBreakFlash
            ? 'grayscale(90%) contrast(130%) brightness(0.92)'
            : lifeLossDistortion
            ? 'hue-rotate(-25deg) saturate(2.4) contrast(1.2)'
            : undefined,
          transition: comboBreakFlash ? 'filter 0.08s ease-in' : 'filter 0.25s ease-out',
        }}
      >
        {/* Flash de Vinheta Vermelha nas Bordas da Tela quando palavras caem no chão */}
        {groundDangerFlash && (
          <div className="absolute inset-0 pointer-events-none z-45 animate-ground-damage-flash" />
        )}

        {/* Flash de Quebra de Combo com Desaturação e Alerta Negativo */}
        {comboBreakFlash && (
          <div className="absolute inset-0 z-45 bg-slate-950/40 pointer-events-none flex items-center justify-center animate-in fade-in duration-100">
            <div className="px-5 py-2.5 rounded-2xl bg-rose-950/90 border-2 border-rose-500 text-rose-300 font-mono font-black text-lg sm:text-xl uppercase tracking-widest shadow-2xl flex items-center gap-2 animate-bounce">
              <AlertTriangle className="text-rose-400" size={22} />
              <span>COMBO QUEBRADO!</span>
            </div>
          </div>
        )}

        {/* Efeito de Vibração e Distorção Visual Intensa ao Perder Vida */}
        {lifeLossDistortion && (
          <div className="absolute inset-0 z-45 pointer-events-none border-4 border-red-600 bg-red-600/25 shadow-[inset_0_0_50px_rgba(239,68,68,0.85)] animate-pulse" />
        )}

        {/* Indicador do Modo Cegueira */}
        {activeGameMode === 'BLINDNESS' && gameMode === 'PLAYING' && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-400/50 text-violet-300 text-[11px] font-bold flex items-center gap-1.5 shadow-lg select-none backdrop-blur-xs">
            <EyeOff size={13} className="text-violet-400" />
            <span>MODO CEGUEIRA: Memorize as palavras antes que sumam!</span>
          </div>
        )}

        {/* Estrelas cintilantes para o céu noturno */}
        {skyTheme === 'night' && gameMode !== 'BONUS' && (
          <div className="absolute inset-0 pointer-events-none opacity-70 overflow-hidden">
            <div className="absolute top-[8%] left-[12%] w-1 h-1 bg-white rounded-full animate-ping" />
            <div className="absolute top-[15%] left-[45%] w-1.5 h-1.5 bg-sky-200 rounded-full animate-pulse" />
            <div className="absolute top-[28%] left-[78%] w-1 h-1 bg-amber-200 rounded-full animate-pulse" />
            <div className="absolute top-[35%] left-[25%] w-1.5 h-1.5 bg-white rounded-full opacity-80" />
            <div className="absolute top-[48%] left-[88%] w-1 h-1 bg-cyan-200 rounded-full animate-ping" />
            <div className="absolute top-[62%] left-[18%] w-1 h-1 bg-white rounded-full opacity-70" />
            <div className="absolute top-[68%] left-[65%] w-1.5 h-1.5 bg-yellow-100 rounded-full animate-pulse" />
          </div>
        )}

        {/* Nuvens decorativas de fundo remasterizadas com movimento fluido */}
        <div className={`absolute inset-0 pointer-events-none overflow-hidden ${
          skyTheme === 'night' ? 'opacity-15' : skyTheme === 'sunset' ? 'opacity-40' : 'opacity-30'
        }`}>
          <div className={`absolute top-[12%] left-[6%] w-52 h-14 rounded-full blur-md animate-cloud-slow ${
            skyTheme === 'sunset' ? 'bg-orange-200' : 'bg-white'
          }`} />
          <div className={`absolute top-[26%] right-[10%] w-68 h-18 rounded-full blur-md animate-cloud-med ${
            skyTheme === 'sunset' ? 'bg-amber-200' : 'bg-white'
          }`} />
          <div className={`absolute top-[48%] left-[22%] w-60 h-16 rounded-full blur-md animate-cloud-slow ${
            skyTheme === 'sunset' ? 'bg-orange-100' : 'bg-white'
          }`} />
          {activeGameMode === 'TIME_ATTACK' && (
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:28px_28px] animate-pulse" />
          )}
        </div>

        {/* Efeito de partículas de fundo de Neve e Estrelas Cadentes no Céu */}
        <SkyParticles enabled={showSkyParticles} />

        {/* Efeito de brilho em modo Bônus */}
        {gameMode === 'BONUS' && (
          <div className="absolute inset-0 pointer-events-none bg-radial-at-c from-amber-300/20 to-transparent animate-pulse" />
        )}

        {/* Indicador Flutuante de Combo de Fogo Animado (posicionado visivelmente abaixo do HUD) */}
        {stats.combo >= 4 && (
          <div className="absolute top-16 right-3 sm:right-6 z-40 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white rounded-full font-black text-xs sm:text-sm shadow-2xl shadow-orange-500/60 animate-combo-flame border-2 border-amber-200 backdrop-blur-xs select-none">
            <span className="text-sm sm:text-base animate-bounce">🔥</span>
            <span className="tracking-wide font-black">{stats.combo}x COMBO!</span>
            <span className="text-[10px] bg-slate-950/40 px-2 py-0.5 rounded-full text-amber-200 font-bold uppercase tracking-wider hidden xs:inline">
              {stats.combo >= 25 ? 'LENDÁRIO!' : stats.combo >= 15 ? 'INSANO!' : stats.combo >= 10 ? 'EM CHAMAS!' : 'TURBO!'}
            </span>
          </div>
        )}

        {/* Ondas de choque dinâmicas (Shockwaves) de impacto e explosões */}
        {shockwaves.map((sw) => (
          <div
            key={sw.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full border-2 animate-shockwave"
            style={{
              left: `${sw.x}%`,
              top: `${sw.y}%`,
              borderColor: sw.color,
              boxShadow: `0 0 16px ${sw.color}`,
              width: '45px',
              height: '45px',
            }}
          />
        ))}

        {/* Palavras caindo na tela (Alvo é a palavra de prioridade máxima ou a mais antiga ainda não completada) */}
        {words.map((word) => {
          const uncompletedList = words.filter((w) => w.typedLength < w.text.length);
          const orderIndex = uncompletedList.findIndex((w) => w.id === word.id);
          return (
            <WordBadge
              key={word.id}
              word={word}
              isTarget={word.id === targetWord?.id}
              orderNumber={orderIndex >= 0 ? orderIndex + 1 : 0}
              fontSize={wordFontSize}
              isBlindnessMode={activeGameMode === 'BLINDNESS'}
            />
          );
        })}

        {/* Canhão de Defesa no Chão disparando bolas teleguiadas com rotação automática para o alvo e Skin selecionada */}
        <Turret
          targetX={targetWord ? targetWord.x : 50}
          targetY={targetWord ? targetWord.y : 20}
          isFiring={isFiring}
          cannonBalls={cannonBalls}
          equippedSkinId={equippedSkinId}
        />

        {/* Letras arrancadas voando pelo ar */}
        {flyingLetters.map((fl) => (
          <div
            key={fl.id}
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 font-mono font-black text-xl sm:text-2xl text-orange-500 select-none drop-shadow-md z-35"
            style={{
              left: `${fl.x}%`,
              top: `${fl.y}%`,
              transform: `translate(-50%, -50%) rotate(${fl.rotation}deg)`,
              opacity: fl.alpha,
            }}
          >
            {fl.char}
          </div>
        ))}

        {/* Partículas visuais de explosão (círculos e estrelas cintilantes) se ativadas */}
        {showParticles &&
          particles.map((p) =>
            p.isStar ? (
              <div
                key={p.id}
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 font-black select-none z-30"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  color: p.color,
                  opacity: p.alpha,
                  fontSize: `${p.size}px`,
                  textShadow: `0 0 8px ${p.color}`,
                }}
              >
                ★
              </div>
            ) : (
              <div
                key={p.id}
                className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-30"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  opacity: p.alpha,
                  boxShadow: `0 0 10px ${p.color}`,
                }}
              />
            )
          )}

        {/* Textos flutuantes de pontuação (+100, +250 2x) */}
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none font-black text-sm sm:text-base font-mono drop-shadow-md animate-in fade-in zoom-in-75 duration-100 z-40"
            style={{
              left: `${ft.x}%`,
              top: `${ft.y}%`,
              color: ft.color,
            }}
          >
            {ft.text}
          </div>
        ))}
      </div>

      {/* LINHA DE PERIGO (Animada com faixas de advertência) */}
      <div className="relative w-full z-25">
        <div
          className={`w-full transition-all duration-150 ${
            groundDangerFlash
              ? 'bg-red-500/60 shadow-xl shadow-red-500/90 h-1.5'
              : words.some((w) => w.y > 80 && w.typedLength < w.text.length)
              ? 'hazard-stripes-animated shadow-md shadow-red-500/60 h-1'
              : 'border-t-2 border-dashed border-red-500/90 h-0.5'
          }`}
        />
      </div>

      {/* CHÃO AZUL ESCURO / BASE (Como no screenshot de referência, coordenado ao tema) */}
      <div
        className={`relative w-full z-20 flex items-center justify-center transition-colors duration-300 ${
          skyTheme === 'night'
            ? 'bg-[#030914] border-t border-slate-700/60'
            : skyTheme === 'sunset'
            ? 'bg-[#2a0836] border-t border-orange-900/60'
            : 'bg-[#004282]'
        }`}
        style={{ height: '7.5vh', minHeight: '44px' }}
      >
        <div className="text-[11px] sm:text-xs text-sky-200/80 font-medium tracking-wide flex items-center gap-3">
          <span className="hidden sm:inline">{t.groundHint1}</span>
          <span className="text-sky-300 hidden sm:inline" aria-hidden="true">·</span>
          <span>{t.groundHint2}</span>
          {gameMode === 'PLAYING' && (
            <>
              <span className="text-sky-300 hidden sm:inline" aria-hidden="true">·</span>
              <span className="text-amber-300 font-semibold hidden md:inline">
                {t.groundHintSpace}
              </span>
              <span className="text-sky-300 hidden sm:inline" aria-hidden="true">·</span>
              <span className="text-emerald-300 font-semibold hidden md:inline">
                {t.groundHintGreen}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Assistente de digitação para celulares/tablets com teclado virtual ou nativo */}
      {(gameMode === 'PLAYING' || gameMode === 'BONUS') && (
        <MobileInputHelper
          onKeyPress={handleKeyInput}
          onSwitchTarget={handleSwitchTarget}
          canSwitchTarget={words.filter((w) => w.typedLength < w.text.length).length >= 2}
          hasActiveGreen={words.some((w) => w.isGreen && w.typedLength < w.text.length)}
          targetWordText={targetWord?.text}
          typedLength={targetWord?.typedLength}
          isReverse={targetWord?.isReverse}
          isGreen={targetWord?.isGreen}
          isMath={activeGameMode === 'MATH' || Boolean(targetWord?.mathExpression)}
          language={language}
        />
      )}

      {/* Overlay de Rodada Bônus */}
      {gameMode === 'BONUS' && (
        <BonusRoundOverlay
          showIntro={showBonusIntro}
          timeLeft={bonusTimeLeft}
          bonusScoreEarned={bonusScoreEarned}
          bonusWordsCount={bonusWordsCount}
        />
      )}

      {/* Menu Inicial */}
      {gameMode === 'MENU' && (
        <StartMenu
          difficulty={difficulty}
          category={category}
          activeGameMode={activeGameMode}
          highScore={highScore}
          timeAttackHighScore={timeAttackHighScore}
          reflexHighScore={reflexHighScore}
          language={language}
          dailyStreak={dailyStreak}
          userProfile={userProfile}
          hasClaimedDailyBonusToday={hasClaimedDailyBonusToday}
          onOpenCustomize={() => {
            soundManager.playButtonClick();
            setShowCustomize(true);
          }}
          onOpenModes={() => {
            soundManager.playButtonClick();
            setShowModes(true);
          }}
          onOpenSettings={() => {
            soundManager.playButtonClick();
            setShowSettings(true);
          }}
          onOpenRankings={() => {
            soundManager.playButtonClick();
            setShowRankings(true);
          }}
          onOpenMissions={() => {
            soundManager.playButtonClick();
            setShowMissions(true);
          }}
          onOpenAchievements={() => {
            soundManager.playButtonClick();
            setShowAchievements(true);
          }}
          onOpenInventory={() => {
            soundManager.playButtonClick();
            setShowInventory(true);
          }}
          onOpenDailyBonus={() => {
            soundManager.playButtonClick();
            setShowDailyBonus(true);
          }}
          onOpenFeedback={() => {
            soundManager.playButtonClick();
            setShowFeedback(true);
          }}
          onOpenAuth={() => {
            soundManager.playButtonClick();
            setShowAuth(true);
          }}
          onStartGame={startGame}
        />
      )}

      {/* Modal de Pausa */}
      {gameMode === 'PAUSED' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center text-white shadow-2xl">
            <h3 className="text-2xl font-black mb-2">{t.paused}</h3>
            <p className="text-xs text-slate-400 mb-6">
              {t.pausedDesc}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  setGameMode('PLAYING');
                }}
                className="w-full py-3 rounded-xl font-bold bg-orange-600 hover:bg-orange-500 text-white transition-colors cursor-pointer"
              >
                {t.resumeGame}
              </button>

              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  setGameMode('MENU');
                }}
                className="w-full py-2.5 rounded-xl font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-sm cursor-pointer"
              >
                {t.mainMenu}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Fim de Jogo */}
      {gameMode === 'GAME_OVER' && (
        <GameOverModal
          stats={stats}
          isNewRecord={
            stats.score > 0 &&
            stats.score >= (activeGameMode === 'TIME_ATTACK' ? timeAttackHighScore : highScore)
          }
          isTimeAttack={activeGameMode === 'TIME_ATTACK'}
          onRestart={startGame}
          onHome={() => {
            soundManager.playButtonClick();
            setGameMode('MENU');
          }}
        />
      )}

      {/* Modal de Customização */}
      {showCustomize && (
        <CustomizeModal
          category={category}
          onChangeCategory={setCategory}
          difficulty={difficulty}
          onChangeDifficulty={(diff) => {
            setDifficulty(diff);
            setLives(getMaxLivesByDifficulty(diff));
          }}
          spawnRates={spawnRates}
          onChangeSpawnRate={handleChangeSpawnRate}
          accentTolerant={accentTolerant}
          onToggleAccentTolerant={() => setAccentTolerant((p) => !p)}
          language={language}
          onChangeLanguage={handleSetLanguage}
          onClose={() => {
            soundManager.playButtonClick();
            setShowCustomize(false);
          }}
        />
      )}

      {/* Modal de Modos de Jogo */}
      {showModes && (
        <GameModesModal
          currentMode={activeGameMode}
          onSelectMode={(mode) => {
            setActiveGameMode(mode);
            activeGameModeRef.current = mode;
            setShowModes(false);
            if (mode === 'TUTORIAL') {
              soundManager.playButtonClick();
              setGameMode('TUTORIAL');
            } else if (mode === 'REFLEX') {
              soundManager.playButtonClick();
              setGameMode('REFLEX');
            } else if (mode === 'DUEL') {
              soundManager.playButtonClick();
              setGameMode('DUEL');
            } else {
              startGame();
            }
          }}
          onClose={() => {
            soundManager.playButtonClick();
            setShowModes(false);
          }}
        />
      )}

      {/* Modal de Configurações */}
      {showSettings && (
        <SettingsModal
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
          volume={volume}
          onChangeVolume={(v) => {
            setVolume(v);
            soundManager.setVolume(v);
          }}
          musicVolume={musicVolume}
          onChangeMusicVolume={handleChangeMusicVolume}
          melodicTyping={melodicTyping}
          onToggleMelodicTyping={() => {
            setMelodicTyping((prev) => {
              const next = !prev;
              localStorage.setItem('chuva_palavras_melodic', String(next));
              return next;
            });
          }}
          screenShakeSetting={screenShakeSetting}
          onChangeScreenShakeSetting={(setting) => {
            setScreenShakeSetting(setting);
            localStorage.setItem('chuva_palavras_screenshake', setting);
          }}
          skyTheme={skyTheme}
          onChangeSkyTheme={(theme) => {
            setSkyTheme(theme);
            localStorage.setItem('chuva_palavras_skytheme', theme);
          }}
          wordFontSize={wordFontSize}
          onChangeWordFontSize={(size) => {
            setWordFontSize(size);
            localStorage.setItem('chuva_palavras_wordfontsize', size);
          }}
          showParticles={showParticles}
          onToggleParticles={() => {
            setShowParticles((prev) => {
              const next = !prev;
              localStorage.setItem('chuva_palavras_particles', String(next));
              return next;
            });
          }}
          showSkyParticles={showSkyParticles}
          onToggleSkyParticles={handleToggleSkyParticles}
          language={language}
          highScore={highScore}
          timeAttackHighScore={timeAttackHighScore}
          reflexHighScore={reflexHighScore}
          onResetHighScores={handleResetHighScores}
          onResetTutorials={() => {
            setHasSeenReverseTutorial(false);
            setHasSeenGreenTutorial(false);
            localStorage.removeItem('chuva_palavras_seen_reverse_tut');
            localStorage.removeItem('chuva_palavras_seen_green_tut');
            localStorage.removeItem('chuva_palavras_first_tutorial_done');
          }}
          onOpenRules={() => {
            setShowSettings(false);
            setShowRules(true);
          }}
          onClose={() => {
            soundManager.playButtonClick();
            setShowSettings(false);
          }}
        />
      )}

      {/* Modo Duelo (Local & Online) */}
      {gameMode === 'DUEL' && (
        <DuelGameOverlay
          language={language}
          difficulty={difficulty}
          currentUsername={userProfile?.username || null}
          onExit={() => {
            soundManager.playButtonClick();
            setGameMode('MENU');
          }}
        />
      )}

      {/* Modo Reflexo (3 a 7 letras com surpresa e pontuação somada) */}
      {gameMode === 'REFLEX' && (
        <ReflexGameOverlay
          accentTolerant={accentTolerant}
          onRestart={() => {
            soundManager.playButtonClick();
            setGameMode('REFLEX');
          }}
          onExit={() => {
            soundManager.playButtonClick();
            setGameMode('MENU');
          }}
        />
      )}

      {/* Nível Tutorial Jogável (Modo de Treinamento com Canhão e Customizar) */}
      {gameMode === 'TUTORIAL' && (
        <TutorialLevelOverlay
          language={language}
          equippedSkinId={equippedSkinId}
          onCompleteTutorial={handleCompleteInteractiveTutorial}
          onExit={() => {
            soundManager.playButtonClick();
            setGameMode('MENU');
          }}
        />
      )}

      {/* Modal de Ranking Global */}
      {showRankings && (
        <GlobalRankingsModal
          currentUsername={userProfile?.username || null}
          onOpenLogin={() => {
            setShowRankings(false);
            setShowAuth(true);
          }}
          onClose={() => {
            soundManager.playButtonClick();
            setShowRankings(false);
          }}
        />
      )}

      {/* Modal de Missões Diárias */}
      {showMissions && (
        <DailyMissionsModal
          missions={dailyMissions}
          onClose={() => {
            soundManager.playButtonClick();
            setShowMissions(false);
          }}
        />
      )}

      {/* Modal de Conquistas */}
      {showAchievements && (
        <AchievementsModal
          achievements={achievements}
          onClose={() => {
            soundManager.playButtonClick();
            setShowAchievements(false);
          }}
        />
      )}

      {/* Modal de Arsenal / Inventário de Canhões */}
      {showInventory && (
        <InventoryModal
          highScore={highScore}
          maxCombo={stats.maxCombo}
          equippedSkinId={equippedSkinId}
          unlockedSkins={unlockedSkins}
          coins={coins}
          onEquipSkin={handleEquipSkin}
          onClose={() => {
            soundManager.playButtonClick();
            setShowInventory(false);
          }}
        />
      )}

      {/* Modal de Bônus Diário com Celebração e Recompensas */}
      {showDailyBonus && (
        <DailyBonusModal
          currentDay={dailyBonusDay}
          hasClaimedToday={hasClaimedDailyBonusToday}
          onClaim={handleClaimDailyBonus}
          onClose={() => {
            soundManager.playButtonClick();
            setShowDailyBonus(false);
          }}
        />
      )}

      {/* Modal de Envio de Feedback do Jogador */}
      {showFeedback && (
        <FeedbackModal
          currentUserUid={currentUser?.uid}
          currentUsername={userProfile?.username}
          onClose={() => {
            soundManager.playButtonClick();
            setShowFeedback(false);
          }}
        />
      )}

      {/* Modal de Login / Perfil Firebase com Nome de Usuário Único */}
      {showAuth && (
        <AuthModal
          currentUser={currentUser}
          userProfile={userProfile}
          onProfileUpdated={(updated) => setUserProfile(updated)}
          onClose={() => {
            soundManager.playButtonClick();
            setShowAuth(false);
          }}
        />
      )}

      {/* Pop-up de Conquista Desbloqueada */}
      {currentAchievementPopup && (
        <AchievementPopup
          achievement={currentAchievementPopup}
          onClose={() => setCurrentAchievementPopup(null)}
        />
      )}

      {/* Modal de Regras */}
      {showRules && (
        <RulesModal
          onClose={() => {
            soundManager.playButtonClick();
            setShowRules(false);
          }}
        />
      )}

      {/* Modal de Tutorial de Palavra Azul (Invertida) */}
      {showReverseTutorial && (
        <ReverseWordTutorialModal
          onClose={() => {
            soundManager.playButtonClick();
            showReverseTutorialRef.current = false;
            setShowReverseTutorial(false);
            lastTimeRef.current = performance.now();
            lastSpawnTimeRef.current = performance.now();
          }}
        />
      )}

      {/* Modal de Tutorial de Palavra Verde (Prioridade Máxima) */}
      {showGreenTutorial && (
        <GreenWordTutorialModal
          onClose={() => {
            soundManager.playButtonClick();
            showGreenTutorialRef.current = false;
            setShowGreenTutorial(false);
            lastTimeRef.current = performance.now();
            lastSpawnTimeRef.current = performance.now();
          }}
        />
      )}


      {/* Animação de Transição de Nível com Partículas de Luz e Efeito de Conquista */}
      {levelUpTransition.show && (
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs animate-in fade-in zoom-in duration-200 select-none">
          <div className="absolute w-96 h-96 rounded-full bg-amber-400/20 blur-3xl animate-spin duration-1000" />

          {/* Partículas de luz estelares cobrindo a tela */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 32 }).map((_, i) => {
              const left = (i * 3.1) % 100;
              const top = (i * 7.3) % 100;
              const size = 3 + (i % 4) * 3;
              const delay = (i * 0.04).toFixed(2);
              return (
                <span
                  key={i}
                  className="absolute rounded-full bg-yellow-300 shadow-[0_0_12px_#facc15] animate-ping"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animationDuration: `${0.7 + (i % 3) * 0.3}s`,
                    animationDelay: `${delay}s`,
                  }}
                />
              );
            })}
          </div>

          {/* Banner de conquista */}
          <div className="relative z-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#002b5e] to-[#001736] border-4 border-yellow-400 shadow-2xl shadow-yellow-500/50 text-center flex flex-col items-center gap-2.5 animate-in zoom-in-75 duration-250">
            <div className="p-3.5 rounded-full bg-yellow-400/20 border-2 border-yellow-300 text-yellow-300 animate-bounce">
              <Trophy size={42} />
            </div>
            <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40">
              ⭐ NOVO NÍVEL ALCANÇADO! ⭐
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white font-mono drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">
              NÍVEL {levelUpTransition.level}
            </h2>
            <p className="text-xs text-sky-200">
              Velocidade e pontuação aumentadas! Continue assim!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
