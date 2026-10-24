export type GameMode = 'MENU' | 'PLAYING' | 'BONUS' | 'PAUSED' | 'GAME_OVER' | 'REFLEX' | 'REFLEX_RESULT' | 'DUEL' | 'TUTORIAL';

export type ActiveGameMode = 'CLASSIC' | 'TIME_ATTACK' | 'REFLEX' | 'MATH' | 'BLINDNESS' | 'DUEL' | 'TUTORIAL';

export type DuelSubMode = 'LOCAL' | 'ONLINE';

export interface CannonSkin {
  id: string;
  name: string;
  description: string;
  color: string;
  barrelColor: string;
  glowColor: string;
  bulletColor: string;
  requiredScore?: number;
  requiredCombo?: number;
  badge: string;
}

export interface WordSpawnRates {
  normal: number; // 0, 25, 50, 75, 100
  blue: number;   // 0, 25, 50, 75, 100
  green: number;  // 0, 25, 50, 75, 100
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  type: 'green_words' | 'blue_words' | 'combo' | 'total_words' | 'score';
  reward: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold';
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}

export type GameLanguage = 'pt' | 'en' | 'es' | 'fr';

export interface ReflexRoundResult {
  round: number; // 1 to 5
  length: number; // 3, 4, 5, 6, 7
  word: string;
  reactionTimeMs: number;
  errors: number;
  points: number;
}

export type Difficulty = 'bebe' | 'facil' | 'normal' | 'media' | 'dificil' | 'speed_typer';

export type WordCategory = 'todas' | 'natureza' | 'tecnologia' | 'alimentos' | 'espaco';

export interface FallingWord {
  id: string;
  text: string;
  normalizedText: string;
  x: number; // percentage 5% to 85%
  y: number; // percentage from top 0% to 92%
  speed: number; // % per second
  typedLength: number; // Letras digitadas pelo jogador (bolas em vôo ou já acertadas)
  lettersRemoved: number; // Letras que já foram atingidas pelas bolas e retiradas da palavra
  isBonus?: boolean;
  isReverse?: boolean; // Palavra azul: deve ser digitada de trás para frente!
  isGreen?: boolean; // Palavra verde: cai mais rápido e ganha prioridade imediata!
  mathExpression?: string; // Expressão matemática (ex: "7 + 5"), onde text é o resultado ("12")
  spawnTime: number;
  points: number;
  color?: string;
  driftPhase?: number; // Fase inicial da oscilação do vento
  driftSpeed?: number; // Frequência angular do vento
  driftAmplitude?: number; // Amplitude do balanço horizontal
  baseX?: number; // Posição X base do centro de flutuação
  tilt?: number; // Leve inclinação aerodinâmica causada pelo vento (graus)
}

export interface CannonBall {
  id: string;
  x: number; // porcentagem atual na tela (0-100)
  y: number; // porcentagem atual na tela (0-100)
  startX: number;
  startY: number;
  targetWordId: string;
  targetX: number;
  targetY: number;
  char: string;
  charIndex: number;
  isFinalLetter: boolean;
  progress: number; // 0 (canhão) a 1 (alvo)
  speed: number; // velocidade de avanço do progresso por segundo (ex: 3.5 = ~280ms de vôo)
  createdAt: number;
}

export interface FlyingLetter {
  id: string;
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  alpha: number;
  createdAt: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  createdAt: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  level: number;
  wordsTyped: number;
  bonusWordsTyped: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  errors: number;
  combo: number;
  maxCombo: number;
  startTime: number;
  wpm: number;
  accuracy: number;
}

export type ScreenShakeSetting = 'high' | 'low' | 'off';
export type SkyTheme = 'day' | 'sunset' | 'night';
export type WordFontSize = 'normal' | 'large';
export type CannonAimMode = 'auto' | 'mouse';

export interface DailyBonusReward {
  day: number;
  coins: number;
  cosmeticId?: string;
  cosmeticName?: string;
}
