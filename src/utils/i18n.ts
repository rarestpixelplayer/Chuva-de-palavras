import { GameLanguage, Difficulty, WordCategory, ActiveGameMode } from '../types/game';

export interface LanguageInfo {
  code: GameLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'pt', name: 'Português', nativeName: 'Português (BR)', flag: '🇧🇷' },
  { code: 'en', name: 'English', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
];

export interface Translations {
  // App branding
  appNameLine1: string;
  appNameLine2: string;
  appSubtitle: string;

  // Buttons
  play: string;
  modes: string;
  customize: string;
  settings: string;
  rules: string;
  close: string;
  saveAndApply: string;
  playAgain: string;
  mainMenu: string;
  resumeGame: string;
  paused: string;
  pausedDesc: string;

  // HUD
  score: string;
  level: string;
  time: string;
  combo: string;
  wpm: string;
  lives: string;
  noLives: string;
  bonus: string;

  // Ground banner
  groundHint1: string;
  groundHint2: string;
  groundHintSpace: string;
  groundHintGreen: string;

  // Mobile controls
  openKeyboard: string;
  closeKeyboard: string;
  virtualKeyboard: string;
  nativeKeyboard: string;
  switchTargetMobile: string;
  nextLetter: string;
  hideKeyboard: string;

  // Customize modal
  customizeTitle: string;
  customizeSubtitle: string;
  wordTypesTitle: string;
  wordTypesSubtitle: string;
  normalWords: string;
  normalWordsDesc: string;
  blueWords: string;
  blueWordsDesc: string;
  greenWords: string;
  greenWordsDesc: string;
  activeStatus: string;
  removedStatus: string;
  categoriesTitle: string;
  difficultiesTitle: string;
  languageSelectTitle: string;

  // Categories
  catAll: string;
  catAllDesc: string;
  catNature: string;
  catNatureDesc: string;
  catTech: string;
  catTechDesc: string;
  catFood: string;
  catFoodDesc: string;
  catSpace: string;
  catSpaceDesc: string;

  // Difficulties
  diffBaby: string;
  diffBabyDesc: string;
  diffEasy: string;
  diffEasyDesc: string;
  diffNormal: string;
  diffNormalDesc: string;
  diffMedium: string;
  diffMediumDesc: string;
  diffHard: string;
  diffHardDesc: string;
  diffSpeedTyper: string;
  diffSpeedTyperDesc: string;
  livesSuffix: string;

  // Settings modal
  settingsTitle: string;
  settingsSubtitle: string;
  tabAudio: string;
  tabCannon: string;
  tabVisuals: string;
  tabData: string;
  tabLanguage: string;
  volumeLabel: string;
  melodicTypingLabel: string;
  melodicTypingDesc: string;
  accentTolerantLabel: string;
  accentTolerantDesc: string;
  cannonAimModeLabel: string;
  aimAuto: string;
  aimAutoDesc: string;
  aimMouse: string;
  aimMouseDesc: string;
  screenShakeLabel: string;
  shakeHigh: string;
  shakeLow: string;
  shakeOff: string;
  skyThemeLabel: string;
  themeDay: string;
  themeSunset: string;
  themeNight: string;
  fontSizeLabel: string;
  fontNormal: string;
  fontLarge: string;
  particlesLabel: string;
  particlesDesc: string;
  resetScores: string;
  resetScoresDesc: string;
  resetTutorials: string;
  resetTutorialsDesc: string;

  // Feedback notifications
  targetSwapped: string;
  newRecord: string;
  newTimeAttackRecord: string;
  gameOver: string;
  gameOverTitle: string;
  gameOverSubtitle: string;
  wordsTyped: string;
  accuracy: string;
  maxCombo: string;

  // Tutorials
  blueTutorialTitle: string;
  blueTutorialSubtitle: string;
  blueTutorialRule1: string;
  blueTutorialRule2: string;
  blueTutorialGotIt: string;

  greenTutorialTitle: string;
  greenTutorialSubtitle: string;
  greenTutorialRule1: string;
  greenTutorialRule2: string;
  greenTutorialGotIt: string;
}

export const TRANSLATIONS: Record<GameLanguage, Translations> = {
  pt: {
    appNameLine1: 'CHUVA DE',
    appNameLine2: 'PALAVRAS',
    appSubtitle: 'Jogo de Digitação e Defesa de Canhão',

    play: 'JOGAR',
    modes: 'Modos',
    customize: 'Customizar',
    settings: 'Configurações',
    rules: 'Regras',
    close: 'Fechar',
    saveAndApply: 'Salvar e Aplicar',
    playAgain: 'Jogar Novamente',
    mainMenu: 'Menu Principal',
    resumeGame: 'Continuar Jogando',
    paused: 'Jogo Pausado',
    pausedDesc: 'Respire fundo e prepare os dedos! Pressione ESC ou o botão abaixo para continuar.',

    score: 'Pontos',
    level: 'Fase',
    time: 'Tempo',
    combo: 'Combo',
    wpm: 'PPM',
    lives: 'Vidas',
    noLives: 'Sem Vidas',
    bonus: 'BÔNUS',

    groundHint1: 'Digite as palavras no teclado',
    groundHint2: 'Bolas de canhão teleguiadas arrancam as letras',
    groundHintSpace: '[Espaço] Trocar Alvo',
    groundHintGreen: 'Palavras Verdes = Prioridade',

    openKeyboard: 'Abrir Teclado',
    closeKeyboard: 'Fechar Teclado',
    virtualKeyboard: 'Teclado na Tela',
    nativeKeyboard: 'Teclado do Celular',
    switchTargetMobile: 'Trocar Alvo ⇄',
    nextLetter: 'Próxima letra:',
    hideKeyboard: 'Ocultar',

    customizeTitle: 'Customizar Partida',
    customizeSubtitle: 'Filtre tipos de palavras, idioma, categoria e dificuldade',
    wordTypesTitle: 'Tipos de Palavras na Partida',
    wordTypesSubtitle: 'Ative ou remova conforme desejar',
    normalWords: 'Palavras Normais',
    normalWordsDesc: 'Palavras clássicas que caem na velocidade padrão',
    blueWords: 'Palavras Azuis (Invertidas)',
    blueWordsDesc: 'Digitadas de trás para frente para treinar raciocínio',
    greenWords: 'Palavras Verdes (Alta Prioridade)',
    greenWordsDesc: 'Caem rápido e ganham prioridade absoluta do canhão',
    activeStatus: 'Ativadas',
    removedStatus: 'Removidas',
    categoriesTitle: 'Categoria das Palavras',
    difficultiesTitle: 'Nível de Dificuldade',
    languageSelectTitle: 'Idioma das Palavras & Jogo',

    catAll: 'Todas as palavras',
    catAllDesc: 'Mix geral equilibrado de todos os temas',
    catNature: 'Natureza',
    catNatureDesc: 'Animais, florestas, rios, plantas e clima',
    catTech: 'Tecnologia',
    catTechDesc: 'Computação, web, hardware e programação',
    catFood: 'Alimentos',
    catFoodDesc: 'Frutas, culinária, bebidas e sobremesas',
    catSpace: 'Espaço & Cosmos',
    catSpaceDesc: 'Planetas, estrelas, galáxias e astronomia',

    diffBaby: 'Bebê',
    diffBabyDesc: 'Queda bem lenta · Palavras curtas',
    diffEasy: 'Fácil',
    diffEasyDesc: 'Ritmo suave · Vocabulário simples',
    diffNormal: 'Normal',
    diffNormalDesc: 'Ritmo balanceado · Progressivo',
    diffMedium: 'Média',
    diffMediumDesc: 'Ritmo moderado · Palavras médias',
    diffHard: 'Difícil',
    diffHardDesc: 'Queda rápida · Palavras longas',
    diffSpeedTyper: 'Speed-Typer',
    diffSpeedTyperDesc: 'Velocidade extrema · Desafio frenético',
    livesSuffix: 'vidas',

    settingsTitle: 'Configurações',
    settingsSubtitle: 'Personalize áudio, mira 180°, idioma e jogabilidade',
    tabAudio: 'Áudio',
    tabCannon: 'Jogabilidade',
    tabVisuals: 'Visuais',
    tabData: 'Dados',
    tabLanguage: 'Idioma',
    volumeLabel: 'Volume Principal dos Efeitos',
    melodicTypingLabel: 'Digitação Melódica Dinâmica',
    melodicTypingDesc: 'Cada acerto reproduz uma nota musical que escala conforme o combo!',
    accentTolerantLabel: 'Digitação Ágil (Acentos Flexíveis)',
    accentTolerantDesc: "Permite teclar 'a' para 'á/ã' e 'c' para 'ç' sem errar. Desative para exigir o caractere exato.",
    cannonAimModeLabel: 'Modo de Mira do Canhão 180°',
    aimAuto: 'Rastreamento Automático',
    aimAutoDesc: 'O canhão rastreia a palavra-alvo ativa na tela em tempo real.',
    aimMouse: 'Seguir Cursor / Toque',
    aimMouseDesc: 'O canhão gira livremente num arco de 180° acompanhando mouse ou dedo no celular.',
    screenShakeLabel: 'Tremor de Tela (Impactos)',
    shakeHigh: 'Intenso',
    shakeLow: 'Suave',
    shakeOff: 'Desativado',
    skyThemeLabel: 'Tema do Céu',
    themeDay: 'Dia Solar',
    themeSunset: 'Pôr do Sol',
    themeNight: 'Noite Estrelada',
    fontSizeLabel: 'Tamanho das Palavras',
    fontNormal: 'Padrão',
    fontLarge: 'Grande (Acessível)',
    particlesLabel: 'Efeitos de Partículas & Estrelas',
    particlesDesc: 'Explosões e fagulhas visuais com física avançada',
    resetScores: 'Zerar Recordes Locais',
    resetScoresDesc: 'Limpa pontuações máximas salvas no seu navegador.',
    resetTutorials: 'Reativar Tutoriais',
    resetTutorialsDesc: 'Exibe novamente os guias de palavras azuis e verdes.',

    targetSwapped: '⇄ ALVO TROCADO',
    newRecord: '★ NOVO RECORDE! ★',
    newTimeAttackRecord: '★ RECORDE CONTRA O TEMPO! ★',
    gameOver: 'FIM DE JOGO',
    gameOverTitle: 'Fim de Jogo!',
    gameOverSubtitle: 'Bom trabalho! Veja seu desempenho nesta rodada:',
    wordsTyped: 'Palavras Digitadas',
    accuracy: 'Precisão',
    maxCombo: 'Maior Combo',

    blueTutorialTitle: 'NOVA MECÂNICA: PALAVRA AZUL!',
    blueTutorialSubtitle: 'Você encontrou uma palavra azul de digitação invertida!',
    blueTutorialRule1: 'Digite as letras de TRÁS PARA FRENTE!',
    blueTutorialRule2: 'O canhão arrancará as letras na ordem inversa com bônus de 1.5x pontos.',
    blueTutorialGotIt: 'ENTENDI, VAMOS LÁ!',

    greenTutorialTitle: 'ALERTA TÁTICO: PALAVRA VERDE!',
    greenTutorialSubtitle: 'Palavra de alta velocidade e prioridade máxima!',
    greenTutorialRule1: 'O canhão fixa a mira nela AUTOMATICAMENTE.',
    greenTutorialRule2: 'Ela cai mais rápido! Destrua-a antes que atinja o chão para ganhar 1.75x pontos.',
    greenTutorialGotIt: 'PREPARAR MIRA!',
  },
  en: {
    appNameLine1: 'WORD',
    appNameLine2: 'RAIN',
    appSubtitle: 'Typing & Cannon Defense Game',

    play: 'PLAY',
    modes: 'Modes',
    customize: 'Customize',
    settings: 'Settings',
    rules: 'Rules',
    close: 'Close',
    saveAndApply: 'Save & Apply',
    playAgain: 'Play Again',
    mainMenu: 'Main Menu',
    resumeGame: 'Resume Playing',
    paused: 'Game Paused',
    pausedDesc: 'Take a deep breath and get your fingers ready! Press ESC or the button below to continue.',

    score: 'Score',
    level: 'Stage',
    time: 'Time',
    combo: 'Combo',
    wpm: 'WPM',
    lives: 'Lives',
    noLives: 'No Lives',
    bonus: 'BONUS',

    groundHint1: 'Type the falling words on your keyboard',
    groundHint2: 'Homing cannonballs blast letters away',
    groundHintSpace: '[Space] Switch Target',
    groundHintGreen: 'Green Words = Priority',

    openKeyboard: 'Open Keyboard',
    closeKeyboard: 'Close Keyboard',
    virtualKeyboard: 'On-Screen Keys',
    nativeKeyboard: 'Phone Keyboard',
    switchTargetMobile: 'Switch Target ⇄',
    nextLetter: 'Next letter:',
    hideKeyboard: 'Hide',

    customizeTitle: 'Customize Match',
    customizeSubtitle: 'Filter word types, language, category and difficulty',
    wordTypesTitle: 'Word Types in Match',
    wordTypesSubtitle: 'Enable or remove word types as you wish',
    normalWords: 'Normal Words',
    normalWordsDesc: 'Classic words falling at standard pace',
    blueWords: 'Blue Words (Reverse)',
    blueWordsDesc: 'Typed backwards to build cognitive speed',
    greenWords: 'Green Words (High Priority)',
    greenWordsDesc: 'Fall fast and take immediate cannon priority',
    activeStatus: 'Active',
    removedStatus: 'Removed',
    categoriesTitle: 'Word Category',
    difficultiesTitle: 'Difficulty Level',
    languageSelectTitle: 'Game & Vocabulary Language',

    catAll: 'All Categories',
    catAllDesc: 'Balanced mix of all vocabulary themes',
    catNature: 'Nature',
    catNatureDesc: 'Animals, forests, rivers, weather and climate',
    catTech: 'Technology',
    catTechDesc: 'Computing, web, hardware and coding',
    catFood: 'Food & Cooking',
    catFoodDesc: 'Fruits, culinary dishes, drinks and treats',
    catSpace: 'Space & Cosmos',
    catSpaceDesc: 'Planets, stars, galaxies and astronomy',

    diffBaby: 'Baby',
    diffBabyDesc: 'Very slow fall · Short 2-4 letter words',
    diffEasy: 'Easy',
    diffEasyDesc: 'Gentle pace · Simple vocabulary',
    diffNormal: 'Normal',
    diffNormalDesc: 'Balanced pace · Progressive challenge',
    diffMedium: 'Medium',
    diffMediumDesc: 'Moderate speed · Medium-length words',
    diffHard: 'Hard',
    diffHardDesc: 'Fast fall · Longer complex words',
    diffSpeedTyper: 'Speed-Typer',
    diffSpeedTyperDesc: 'Extreme speed · Intense frenzy challenge',
    livesSuffix: 'lives',

    settingsTitle: 'Settings',
    settingsSubtitle: 'Customize audio, 180° cannon aim, language and visuals',
    tabAudio: 'Audio',
    tabCannon: 'Gameplay',
    tabVisuals: 'Visuals',
    tabData: 'Data',
    tabLanguage: 'Language',
    volumeLabel: 'Master Sound Effects Volume',
    melodicTypingLabel: 'Melodic Key Sounds',
    melodicTypingDesc: 'Each accurate keystroke plays a musical note scaling with your combo!',
    accentTolerantLabel: 'Fast Typing (Accent Tolerance)',
    accentTolerantDesc: 'Allows typing plain letters for accented characters. Turn off for strict typing.',
    cannonAimModeLabel: '180° Cannon Aiming Mode',
    aimAuto: 'Auto Target Tracker',
    aimAutoDesc: 'Cannon automatically tracks the active target word in real time.',
    aimMouse: 'Follow Cursor / Touch',
    aimMouseDesc: 'Cannon freely rotates in a 180° arc following your cursor or finger on mobile.',
    screenShakeLabel: 'Screen Shake (Impacts)',
    shakeHigh: 'Intense',
    shakeLow: 'Soft',
    shakeOff: 'Disabled',
    skyThemeLabel: 'Sky Theme',
    themeDay: 'Sunny Day',
    themeSunset: 'Sunset Glow',
    themeNight: 'Starry Night',
    fontSizeLabel: 'Word Font Size',
    fontNormal: 'Standard',
    fontLarge: 'Large (Accessible)',
    particlesLabel: 'Particle Effects & Stars',
    particlesDesc: 'Explosions and spark bursts with simulated physics',
    resetScores: 'Reset Local High Scores',
    resetScoresDesc: 'Clears saved high scores stored in your browser.',
    resetTutorials: 'Re-enable Word Tutorials',
    resetTutorialsDesc: 'Shows the blue and green word guides again.',

    targetSwapped: '⇄ TARGET SWITCHED',
    newRecord: '★ NEW HIGH SCORE! ★',
    newTimeAttackRecord: '★ TIME ATTACK RECORD! ★',
    gameOver: 'GAME OVER',
    gameOverTitle: 'Game Over!',
    gameOverSubtitle: 'Great effort! Here is your performance summary:',
    wordsTyped: 'Words Typed',
    accuracy: 'Accuracy',
    maxCombo: 'Max Combo',

    blueTutorialTitle: 'NEW MECHANIC: BLUE WORD!',
    blueTutorialSubtitle: 'You encountered a reverse-typing blue word!',
    blueTutorialRule1: 'Type the letters in REVERSE ORDER (back to front)!',
    blueTutorialRule2: 'The cannon will tear away letters backwards for 1.5x score bonus.',
    blueTutorialGotIt: 'GOT IT, LET’S GO!',

    greenTutorialTitle: 'TACTICAL ALERT: GREEN WORD!',
    greenTutorialSubtitle: 'High-speed word with absolute priority!',
    greenTutorialRule1: 'The cannon locks onto it AUTOMATICALLY.',
    greenTutorialRule2: 'It falls faster! Destroy it before it hits the ground for 1.75x score.',
    greenTutorialGotIt: 'AIM READY!',
  },
  es: {
    appNameLine1: 'LLUVIA DE',
    appNameLine2: 'PALABRAS',
    appSubtitle: 'Juego de Mecanografía y Defensa de Cañón',

    play: 'JUGAR',
    modes: 'Modos',
    customize: 'Personalizar',
    settings: 'Ajustes',
    rules: 'Reglas',
    close: 'Cerrar',
    saveAndApply: 'Guardar y Aplicar',
    playAgain: 'Jugar de Nuevo',
    mainMenu: 'Menú Principal',
    resumeGame: 'Continuar Jugando',
    paused: 'Juego en Pausa',
    pausedDesc: '¡Respira hondo y prepara tus dedos! Pulsa ESC o el botón para continuar.',

    score: 'Puntos',
    level: 'Nivel',
    time: 'Tiempo',
    combo: 'Combo',
    wpm: 'PPM',
    lives: 'Vidas',
    noLives: 'Sin Vidas',
    bonus: 'BÔNUS',

    groundHint1: 'Escribe las palabras con tu teclado',
    groundHint2: 'Las balas teledirigidas arrancan las letras',
    groundHintSpace: '[Espacio] Cambiar Objetivo',
    groundHintGreen: 'Palabras Verdes = Prioridad',

    openKeyboard: 'Abrir Teclado',
    closeKeyboard: 'Cerrar Teclado',
    virtualKeyboard: 'Teclado en Pantalla',
    nativeKeyboard: 'Teclado Móvil',
    switchTargetMobile: 'Cambiar Objetivo ⇄',
    nextLetter: 'Siguiente letra:',
    hideKeyboard: 'Ocultar',

    customizeTitle: 'Personalizar Partida',
    customizeSubtitle: 'Filtra tipos de palabras, idioma, categoría y dificultad',
    wordTypesTitle: 'Tipos de Palabras en Juego',
    wordTypesSubtitle: 'Activa o elimina según tu preferencia',
    normalWords: 'Palabras Normales',
    normalWordsDesc: 'Palabras clásicas que caen a ritmo estándar',
    blueWords: 'Palabras Azules (Invertidas)',
    blueWordsDesc: 'Se escriben de atrás hacia adelante para agilidad mental',
    greenWords: 'Palabras Verdes (Prioridad Alta)',
    greenWordsDesc: 'Caen rápido y toman prioridad absoluta en el cañón',
    activeStatus: 'Activadas',
    removedStatus: 'Eliminadas',
    categoriesTitle: 'Categoría de Palabras',
    difficultiesTitle: 'Nivel de Dificultad',
    languageSelectTitle: 'Idioma del Juego y Palabras',

    catAll: 'Todas las palabras',
    catAllDesc: 'Mezcla equilibrada de todos los temas',
    catNature: 'Naturaleza',
    catNatureDesc: 'Animales, bosques, ríos, clima y plantas',
    catTech: 'Tecnología',
    catTechDesc: 'Informática, web, hardware y programación',
    catFood: 'Alimentos',
    catFoodDesc: 'Frutas, cocina, bebidas y postres',
    catSpace: 'Espacio y Cosmos',
    catSpaceDesc: 'Planetas, estrellas, galaxias y astronomía',

    diffBaby: 'Bebé',
    diffBabyDesc: 'Caída muy lenta · Palabras cortas',
    diffEasy: 'Fácil',
    diffEasyDesc: 'Ritmo suave · Vocabulario sencillo',
    diffNormal: 'Normal',
    diffNormalDesc: 'Ritmo equilibrado · Progresivo',
    diffMedium: 'Media',
    diffMediumDesc: 'Velocidad moderada · Palabras medias',
    diffHard: 'Difícil',
    diffHardDesc: 'Caída rápida · Palabras largas',
    diffSpeedTyper: 'Speed-Typer',
    diffSpeedTyperDesc: 'Velocidad extrema · Desafío frenético',
    livesSuffix: 'vidas',

    settingsTitle: 'Ajustes',
    settingsSubtitle: 'Personaliza audio, mira de 180°, idioma y gráficos',
    tabAudio: 'Audio',
    tabCannon: 'Jugabilidad',
    tabVisuals: 'Gráficos',
    tabData: 'Datos',
    tabLanguage: 'Idioma',
    volumeLabel: 'Volumen Principal de Efectos',
    melodicTypingLabel: 'Escritura Melódica Dinámica',
    melodicTypingDesc: '¡Cada acierto reproduce notas que escalan con el combo!',
    accentTolerantLabel: 'Escritura Ágil (Acentos Flexibles)',
    accentTolerantDesc: "Permite teclear 'a' por 'á' y 'n' por 'ñ' sin fallar. Desactiva para requerir carácter exacto.",
    cannonAimModeLabel: 'Modo de Mira del Cañón 180°',
    aimAuto: 'Seguimiento Automático',
    aimAutoDesc: 'El cañón sigue automáticamente la palabra objetivo activa.',
    aimMouse: 'Seguir Cursor / Toque',
    aimMouseDesc: 'El cañón gira libremente 180° siguiendo ratón o dedo en el móvil.',
    screenShakeLabel: 'Temblor de Pantalla (Impactos)',
    shakeHigh: 'Intenso',
    shakeLow: 'Suave',
    shakeOff: 'Desactivado',
    skyThemeLabel: 'Tema del Cielo',
    themeDay: 'Día Soleado',
    themeSunset: 'Atardecer',
    themeNight: 'Noche Estrellada',
    fontSizeLabel: 'Tamaño de las Palabras',
    fontNormal: 'Estándar',
    fontLarge: 'Grande (Accesible)',
    particlesLabel: 'Efectos de Partículas y Estrellas',
    particlesDesc: 'Explosiones y chispas con física simulada',
    resetScores: 'Reiniciar Récords Locales',
    resetScoresDesc: 'Borra las puntuaciones guardadas en tu navegador.',
    resetTutorials: 'Reactivar Tutoriales',
    resetTutorialsDesc: 'Vuelve a mostrar las guías de palabras azules y verdes.',

    targetSwapped: '⇄ OBJETIVO CAMBIADO',
    newRecord: '★ ¡NUEVO RÉCORD! ★',
    newTimeAttackRecord: '★ ¡RÉCORD CONTRA EL RELOJ! ★',
    gameOver: 'FIN DEL JUEGO',
    gameOverTitle: '¡Fin de la Partida!',
    gameOverSubtitle: '¡Gran esfuerzo! Este es el resumen de tu ronda:',
    wordsTyped: 'Palabras Escritas',
    accuracy: 'Precisión',
    maxCombo: 'Combo Máximo',

    blueTutorialTitle: '¡NUEVA MECÁNICA: PALABRA AZUL!',
    blueTutorialSubtitle: '¡Encontraste una palabra azul de escritura invertida!',
    blueTutorialRule1: '¡Escribe las letras de ATRÁS HACIA ADELANTE!',
    blueTutorialRule2: 'El cañón arrancará las letras en orden inverso con bonificación 1.5x.',
    blueTutorialGotIt: '¡ENTENDIDO, VAMOS!',

    greenTutorialTitle: '¡ALERTA TÁCTICA: PALABRA VERDE!',
    greenTutorialSubtitle: '¡Palabra rápida con prioridad absoluta!',
    greenTutorialRule1: 'El cañón fija la mira en ella AUTOMÁTICAMENTE.',
    greenTutorialRule2: '¡Cae veloz! Destrúyela antes de tocar el suelo para ganar 1.75x puntos.',
    greenTutorialGotIt: '¡MIRA LISTA!',
  },
  fr: {
    appNameLine1: 'PLUIE DE',
    appNameLine2: 'MOTS',
    appSubtitle: 'Jeu de Dactylographie et Défense de Canon',

    play: 'JOUER',
    modes: 'Modes',
    customize: 'Personnaliser',
    settings: 'Paramètres',
    rules: 'Règles',
    close: 'Fermer',
    saveAndApply: 'Enregistrer & Appliquer',
    playAgain: 'Rejouer',
    mainMenu: 'Menu Principal',
    resumeGame: 'Reprendre la Partie',
    paused: 'Jeu en Pause',
    pausedDesc: 'Prenez une grande inspiration et préparez vos doigts ! Appuyez sur Échap ou le bouton ci-dessous.',

    score: 'Points',
    level: 'Niveau',
    time: 'Temps',
    combo: 'Combo',
    wpm: 'MPM',
    lives: 'Vies',
    noLives: 'Sans Vies',
    bonus: 'BONUS',

    groundHint1: 'Tapez les mots qui tombent sur votre clavier',
    groundHint2: 'Des boulets autoguidés détruisent les lettres',
    groundHintSpace: '[Espace] Changer de Cible',
    groundHintGreen: 'Mots Verts = Priorité',

    openKeyboard: 'Ouvrir Clavier',
    closeKeyboard: 'Fermer Clavier',
    virtualKeyboard: 'Clavier à l’Écran',
    nativeKeyboard: 'Clavier Mobile',
    switchTargetMobile: 'Changer Cible ⇄',
    nextLetter: 'Prochaine lettre :',
    hideKeyboard: 'Masquer',

    customizeTitle: 'Personnaliser la Partie',
    customizeSubtitle: 'Filtrez les types de mots, langue, catégorie et difficulté',
    wordTypesTitle: 'Types de Mots en Jeu',
    wordTypesSubtitle: 'Activez ou supprimez selon vos envies',
    normalWords: 'Mots Normaux',
    normalWordsDesc: 'Mots classiques tombant à vitesse standard',
    blueWords: 'Mots Bleus (Inversés)',
    blueWordsDesc: 'À taper de droite à gauche pour stimuler l’esprit',
    greenWords: 'Mots Verts (Haute Priorité)',
    greenWordsDesc: 'Tombent vite et prennent la priorité du canon',
    activeStatus: 'Activés',
    removedStatus: 'Retirés',
    categoriesTitle: 'Catégorie des Mots',
    difficultiesTitle: 'Niveau de Difficulté',
    languageSelectTitle: 'Langue du Jeu et Vocabulaire',

    catAll: 'Tous les mots',
    catAllDesc: 'Mélange équilibré de tous les thèmes',
    catNature: 'Nature',
    catNatureDesc: 'Animaux, forêts, rivières, météo et faune',
    catTech: 'Technologie',
    catTechDesc: 'Informatique, web, matériel et programmation',
    catFood: 'Nourriture',
    catFoodDesc: 'Fruits, plats, boissons et desserts',
    catSpace: 'Espace & Cosmos',
    catSpaceDesc: 'Planètes, étoiles, galaxies et astronomie',

    diffBaby: 'Bébé',
    diffBabyDesc: 'Chute très lente · Mots courts de 2-4 lettres',
    diffEasy: 'Facile',
    diffEasyDesc: 'Rythme doux · Vocabulaire simple',
    diffNormal: 'Normal',
    diffNormalDesc: 'Rythme équilibré · Défi progressif',
    diffMedium: 'Moyen',
    diffMediumDesc: 'Vitesse modérée · Mots de taille moyenne',
    diffHard: 'Difficile',
    diffHardDesc: 'Chute rapide · Mots longs et complexes',
    diffSpeedTyper: 'Speed-Typer',
    diffSpeedTyperDesc: 'Vitesse extrême · Défi frénétique',
    livesSuffix: 'vies',

    settingsTitle: 'Paramètres',
    settingsSubtitle: 'Personnalisez le son, la visée 180°, la langue et les graphismes',
    tabAudio: 'Audio',
    tabCannon: 'Jouabilité',
    tabVisuals: 'Visuels',
    tabData: 'Données',
    tabLanguage: 'Langue',
    volumeLabel: 'Volume Principal des Effets',
    melodicTypingLabel: 'Frappe Mélodique Dynamique',
    melodicTypingDesc: 'Chaque lettre correcte joue une note montant avec le combo !',
    accentTolerantLabel: 'Frappe Rapide (Tolérance aux Accents)',
    accentTolerantDesc: "Permet de taper 'e' pour 'é/è' et 'c' pour 'ç' sans faute. Désactivez pour exiger l'accent exact.",
    cannonAimModeLabel: 'Mode de Visée du Canon 180°',
    aimAuto: 'Suivi Automatique',
    aimAutoDesc: 'Le canon suit automatiquement la cible active en temps réel.',
    aimMouse: 'Suivre Curseur / Toucher',
    aimMouseDesc: 'Le canon tourne librement sur 180° suivant la souris ou le doigt sur mobile.',
    screenShakeLabel: 'Secousses d’Écran (Impacts)',
    shakeHigh: 'Intense',
    shakeLow: 'Doux',
    shakeOff: 'Désactivé',
    skyThemeLabel: 'Thème du Ciel',
    themeDay: 'Jour Ensoleillé',
    themeSunset: 'Coucher de Soleil',
    themeNight: 'Nuit Étoilée',
    fontSizeLabel: 'Taille des Mots',
    fontNormal: 'Standard',
    fontLarge: 'Grande (Accessible)',
    particlesLabel: 'Effets de Particules & Étoiles',
    particlesDesc: 'Explosions et étincelles avec physique avancée',
    resetScores: 'Réinitialiser les Meilleurs Scores',
    resetScoresDesc: 'Efface les scores enregistrés dans le navigateur.',
    resetTutorials: 'Réactiver les Didacticiels',
    resetTutorialsDesc: 'Affiche à nouveau les guides des mots bleus et verts.',

    targetSwapped: '⇄ CIBLE CHANGÉE',
    newRecord: '★ NOUVEAU RECORD ! ★',
    newTimeAttackRecord: '★ RECORD DU CONTRE-LA-MONTRE ! ★',
    gameOver: 'PARTIE TERMINÉE',
    gameOverTitle: 'Partie Terminée !',
    gameOverSubtitle: 'Beau travail ! Voici le résumé de votre session :',
    wordsTyped: 'Mots Tapés',
    accuracy: 'Précision',
    maxCombo: 'Combo Max',

    blueTutorialTitle: 'NOUVELLE MÉCANIQUE : MOT BLEU !',
    blueTutorialSubtitle: 'Vous avez rencontré un mot bleu à frappe inversée !',
    blueTutorialRule1: 'Tapez les lettres DE DROITE À GAUCHE (à l’envers) !',
    blueTutorialRule2: 'Le canon détruira les lettres en sens inverse avec bonus 1.5x.',
    blueTutorialGotIt: 'COMPRIS, C’EST PARTI !',

    greenTutorialTitle: 'ALERTE TACTIQUE : MOT VERT !',
    greenTutorialSubtitle: 'Mot très rapide avec priorité absolue !',
    greenTutorialRule1: 'Le canon se verrouille dessus AUTOMATIQUEMENT.',
    greenTutorialRule2: 'Il tombe vite ! Détruisez-le avant le sol pour gagner 1.75x de score.',
    greenTutorialGotIt: 'VISÉE PRÊTE !',
  },
};
