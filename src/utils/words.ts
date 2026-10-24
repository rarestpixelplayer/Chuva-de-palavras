// Dicionários ricos em múltiplos idiomas (Português, English, Español, Français)
import { Difficulty, WordCategory, GameLanguage } from '../types/game';

interface CategoryDictionary {
  easy: string[];
  medium: string[];
  hard: string[];
}

interface LanguageVocabulary {
  categories: Record<Exclude<WordCategory, 'todas'>, CategoryDictionary>;
  allEasy: string[];
  allMedium: string[];
  allHard: string[];
  bonusWords: string[];
  reflexWords: Record<number, string[]>;
}

export const VOCABULARIES: Record<GameLanguage, LanguageVocabulary> = {
  pt: {
    categories: {
      natureza: {
        easy: [
          'sol', 'lua', 'mar', 'rio', 'céu', 'flor', 'lago', 'mata', 'erva', 'leão',
          'pato', 'gato', 'urso', 'lobo', 'sapo', 'peixe', 'neve', 'vento', 'fogo', 'raiz',
          'folha', 'grilo', 'fauna', 'flora', 'pomba', 'terra', 'onda', 'pedra', 'areia'
        ],
        medium: [
          'árvore', 'floresta', 'montanha', 'relâmpago', 'oceano', 'pássaro', 'cascata',
          'bosque', 'semente', 'vulcão', 'trovão', 'planície', 'deserto', 'nascente',
          'riacho', 'orvalho', 'tempestade', 'pantanal', 'savana', 'tartaruga', 'girassol'
        ],
        hard: [
          'fotossíntese', 'biodiversidade', 'ecossistema', 'cordilheira', 'vegetação',
          'borboleta', 'constelação', 'meteorologia', 'cristalino', 'cachoeira', 'preservação',
          'sustentabilidade', 'fenômeno', 'herbívoro', 'microclima', 'reflorestamento'
        ]
      },
      tecnologia: {
        easy: [
          'app', 'web', 'chip', 'byte', 'tela', 'mouse', 'rede', 'robô', 'dado', 'cabo',
          'site', 'link', 'jogo', 'foto', 'plug', 'base', 'fio', 'slot', 'ram'
        ],
        medium: [
          'teclado', 'código', 'pixel', 'conexão', 'memória', 'bateria', 'servidor',
          'celular', 'arquivo', 'sistema', 'software', 'hardware', 'satélite', 'antena',
          'circuito', 'sensor', 'comando', 'gráfico', 'painel', 'terminal', 'usuário'
        ],
        hard: [
          'computador', 'algoritmo', 'inteligente', 'programação', 'arquitetura',
          'eletricidade', 'segurança', 'criptografia', 'desenvolvimento', 'processador',
          'plataforma', 'conectividade', 'ciberespaço', 'autonomia', 'nanotecnologia'
        ]
      },
      alimentos: {
        easy: [
          'pão', 'suco', 'café', 'sal', 'mel', 'figo', 'uva', 'maçã', 'bolo', 'sopa',
          'doce', 'arroz', 'pera', 'lima', 'chá', 'coco', 'alho', 'milho', 'ovo', 'queijo'
        ],
        medium: [
          'batata', 'salada', 'laranja', 'abacaxi', 'banana', 'tomate', 'morango',
          'azeite', 'farinha', 'cenoura', 'tempero', 'pêssego', 'goiaba', 'amendoim',
          'pimenta', 'torrada', 'lasanha', 'panqueca', 'sorvete', 'castanha', 'pastel'
        ],
        hard: [
          'chocolate', 'restaurante', 'gastronomia', 'macarronada', 'melancia',
          'especiarias', 'banquete', 'confeitaria', 'refeição', 'nutricionista',
          'degustação', 'maracujá', 'framboesa', 'parmegiana', 'alimentação'
        ]
      },
      espaco: {
        easy: [
          'sol', 'lua', 'céu', 'raio', 'nave', 'polo', 'luz', 'base', 'alvo', 'onda',
          'vetor', 'domo', 'cone', 'ponto', 'gás', 'anel', 'eixo', 'foco', 'sinal'
        ],
        medium: [
          'planeta', 'estrela', 'meteoro', 'galáxia', 'cometa', 'foguete', 'cosmos',
          'satélite', 'eclipse', 'vácuo', 'aurora', 'órbita', 'gravidade', 'cratera',
          'pulsar', 'módulo', 'buraco', 'espacial', 'sonda', 'propulsor', 'centauro'
        ],
        hard: [
          'constelação', 'astronauta', 'telescópio', 'universo', 'supernova',
          'asteroide', 'interestelar', 'heliocêntrico', 'astrofísica', 'radiação',
          'propulsão', 'cosmonauta', 'atmosfera', 'estratosfera', 'gravitacional'
        ]
      }
    },
    allEasy: [
      'sol', 'lua', 'mar', 'rio', 'dia', 'céu', 'pão', 'rei', 'luz', 'som',
      'casa', 'mesa', 'bola', 'vida', 'pato', 'gato', 'ouro', 'doce', 'fogo', 'vento',
      'água', 'árvore', 'livro', 'flor', 'azul', 'café', 'trem', 'urso', 'lobo', 'peixe',
      'sapo', 'neve', 'roda', 'porta', 'copo', 'mala', 'sopa', 'dado', 'ilha', 'selo',
      'pipa', 'foto', 'mapa', 'fita', 'vela', 'navio', 'bico', 'leão', 'raiz', 'faixa',
      'app', 'web', 'chip', 'byte', 'tela', 'rede', 'chá', 'uva', 'maçã', 'alho'
    ],
    allMedium: [
      'amigo', 'tempo', 'nuvem', 'chuva', 'campo', 'música', 'caneta', 'escola',
      'janela', 'jardim', 'viagem', 'pedra', 'floresta', 'castelo', 'planeta',
      'cidade', 'estrela', 'horizonte', 'energia', 'espelho', 'computador', 'teclado',
      'pintura', 'tesouro', 'universo', 'foguete', 'diamante', 'segredo', 'galáxia',
      'guitarra', 'silêncio', 'harmonia', 'aventura', 'montanha', 'relâmpago', 'alegria',
      'coração', 'pássaro', 'oceano', 'memória', 'sussurro', 'infinito', 'coragem',
      'destaque', 'bateria', 'palavra', 'mistura', 'talento', 'desenho', 'triunfo',
      'arquivo', 'sistema', 'banana', 'morango', 'salada', 'cometa', 'satélite'
    ],
    allHard: [
      'velocidade', 'agilidade', 'inteligente', 'transformar', 'iluminação',
      'maravilha', 'desenvolvimento', 'eletricidade', 'constelação', 'imaginação',
      'temperatura', 'produtividade', 'arquitetura', 'entusiasmo', 'extraordinário',
      'conhecimento', 'brilhantismo', 'magnífico', 'persistente', 'pensamento',
      'verdadeiro', 'profundidade', 'espetacular', 'comunicação', 'sensacional',
      'metamorfose', 'equinócio', 'ressonância', 'trajetória', 'revolucionário',
      'fotossíntese', 'biodiversidade', 'gastronomia', 'chocolate', 'astronauta'
    ],
    bonusWords: [
      'BÔNUS', 'TURBO', 'DIAMANTE', 'OURO', 'ESTRELA', 'COMBO',
      'SUPER', 'EXTRA', 'FOGUETE', 'MEGA', 'COROA', 'PRÊMIO',
      'EXPLOSÃO', 'VITÓRIA', 'PODER', 'VELOZ', 'CHAMA', 'MAGIA'
    ],
    reflexWords: {
      3: ['sol', 'lua', 'mar', 'rio', 'céu', 'pão', 'som', 'chá', 'uva', 'luz', 'rei', 'asa', 'voz', 'dia', 'mel', 'ovo', 'sal', 'paz', 'gol', 'elo', 'dom', 'fim', 'boa', 'aço', 'eco', 'ímã', 'olá', 'sim', 'não', 'tio'],
      4: ['casa', 'mesa', 'bola', 'vida', 'pato', 'gato', 'ouro', 'doce', 'fogo', 'azul', 'café', 'trem', 'urso', 'lobo', 'neve', 'roda', 'copo', 'mala', 'sopa', 'dado', 'ilha', 'pipa', 'foto', 'mapa', 'fita', 'vela', 'bico', 'leão', 'raiz', 'onda'],
      5: ['amigo', 'tempo', 'nuvem', 'chuva', 'campo', 'pedra', 'livro', 'peixe', 'porta', 'termo', 'navio', 'fonte', 'leite', 'vento', 'arroz', 'prata', 'farol', 'folha', 'praia', 'sonho', 'tinta', 'calor', 'verde', 'plano', 'clube', 'ponto', 'força', 'ritmo', 'grade', 'prato'],
      6: ['música', 'caneta', 'escola', 'janela', 'jardim', 'viagem', 'cidade', 'quadro', 'brilho', 'bosque', 'origem', 'castor', 'espada', 'escudo', 'troféu', 'estrela', 'galáxia', 'foguete', 'alegria', 'pássaro', 'oceano', 'memória', 'talento', 'desenho', 'coruja', 'girafa', 'coelho', 'macaco'],
      7: ['floresta', 'castelo', 'energia', 'espelho', 'teclado', 'pintura', 'tesouro', 'segredo', 'cometa', 'silêncio', 'harmonia', 'coragem', 'palavra', 'mistura', 'triunfo', 'arquivo', 'sistema', 'satélite', 'bateria', 'desafio', 'impacto', 'bússola', 'planeta', 'vencedor']
    }
  },
  en: {
    categories: {
      natureza: {
        easy: [
          'sun', 'moon', 'sea', 'tree', 'rain', 'wind', 'star', 'fire', 'leaf', 'lake',
          'bird', 'fish', 'bear', 'wolf', 'frog', 'duck', 'rock', 'sand', 'wave', 'wood',
          'root', 'soil', 'moss', 'pine', 'fern', 'bush', 'hill', 'peak', 'snow', 'rose'
        ],
        medium: [
          'forest', 'jungle', 'river', 'desert', 'island', 'flower', 'meadow', 'canyon',
          'valley', 'breeze', 'stream', 'autumn', 'spring', 'winter', 'summer', 'thunder',
          'glacier', 'volcano', 'meadow', 'sunrise', 'sunset', 'rainbow', 'wildlife'
        ],
        hard: [
          'ecosystem', 'biodiversity', 'waterfall', 'mountains', 'rainforest', 'wilderness',
          'atmosphere', 'environment', 'hurricane', 'phenomenon', 'photosynthesis',
          'conservation', 'landscape', 'temperature', 'constellation'
        ]
      },
      tecnologia: {
        easy: [
          'app', 'web', 'chip', 'byte', 'code', 'data', 'link', 'site', 'wire', 'slot',
          'disk', 'port', 'icon', 'node', 'file', 'user', 'page', 'test', 'host', 'wifi'
        ],
        medium: [
          'system', 'server', 'screen', 'laptop', 'device', 'mobile', 'router', 'sensor',
          'script', 'engine', 'socket', 'hacker', 'memory', 'camera', 'signal', 'matrix',
          'online', 'client', 'cursor', 'backup', 'portal', 'search'
        ],
        hard: [
          'computer', 'software', 'hardware', 'keyboard', 'algorithm', 'developer',
          'processor', 'database', 'cyberpunk', 'encryption', 'artificial',
          'intelligence', 'architecture', 'blockchain', 'connectivity'
        ]
      },
      alimentos: {
        easy: [
          'egg', 'tea', 'pie', 'ham', 'rice', 'soup', 'cake', 'meat', 'fish', 'milk',
          'bread', 'salt', 'corn', 'pear', 'lime', 'plum', 'bean', 'taco', 'mint', 'kiwi'
        ],
        medium: [
          'apple', 'orange', 'banana', 'cheese', 'cookie', 'butter', 'pepper', 'carrot',
          'potato', 'tomato', 'coffee', 'dinner', 'snack', 'pasta', 'waffle', 'cherry',
          'grapes', 'garlic', 'onion', 'burger', 'pizza', 'salad', 'noodle'
        ],
        hard: [
          'chocolate', 'strawberry', 'restaurant', 'gastronomy', 'nutrition', 'breakfast',
          'delicious', 'watermelon', 'sandwich', 'ice cream', 'spaghetti', 'cheesecake',
          'ingredients', 'refreshing', 'delicacy'
        ]
      },
      espaco: {
        easy: [
          'sun', 'moon', 'star', 'mars', 'orbit', 'beam', 'void', 'glow', 'ring', 'axis',
          'core', 'nova', 'ship', 'dust', 'lens', 'dome', 'ray', 'sky', 'deep', 'apex'
        ],
        medium: [
          'planet', 'rocket', 'comet', 'galaxy', 'meteor', 'nebula', 'cosmos', 'crater',
          'pulsar', 'sensor', 'lander', 'vacuum', 'gravity', 'aurora', 'shuttle', 'station',
          'saturn', 'jupiter', 'mercury', 'uranus', 'solstice'
        ],
        hard: [
          'astronaut', 'telescope', 'supernova', 'blackhole', 'spaceship', 'satellite',
          'constellation', 'interstellar', 'astrophysics', 'universe', 'cosmology',
          'gravitational', 'stratosphere', 'observatory'
        ]
      }
    },
    allEasy: [
      'sun', 'moon', 'sea', 'tree', 'rain', 'star', 'fire', 'bird', 'fish', 'bear',
      'wind', 'wood', 'rock', 'sand', 'wave', 'leaf', 'lake', 'frog', 'duck', 'wolf',
      'code', 'data', 'byte', 'chip', 'wire', 'link', 'disk', 'user', 'page', 'site',
      'egg', 'tea', 'pie', 'rice', 'soup', 'cake', 'milk', 'bread', 'salt', 'corn',
      'star', 'mars', 'ring', 'core', 'nova', 'ship', 'beam', 'axis', 'void', 'glow'
    ],
    allMedium: [
      'forest', 'river', 'desert', 'island', 'flower', 'valley', 'autumn', 'spring',
      'system', 'server', 'screen', 'device', 'mobile', 'router', 'sensor', 'memory',
      'apple', 'orange', 'banana', 'cheese', 'cookie', 'coffee', 'pasta', 'tomato',
      'planet', 'rocket', 'comet', 'galaxy', 'meteor', 'cosmos', 'gravity', 'shuttle',
      'silver', 'golden', 'shadow', 'breeze', 'energy', 'future', 'wonder', 'dragon'
    ],
    allHard: [
      'ecosystem', 'biodiversity', 'waterfall', 'mountains', 'rainforest', 'wilderness',
      'computer', 'software', 'hardware', 'keyboard', 'algorithm', 'developer', 'database',
      'chocolate', 'strawberry', 'restaurant', 'gastronomy', 'nutrition', 'delicious',
      'astronaut', 'telescope', 'supernova', 'spaceship', 'satellite', 'constellation',
      'adventure', 'lightning', 'discovery', 'legendary', 'magnificent', 'triumph'
    ],
    bonusWords: [
      'BONUS', 'TURBO', 'DIAMOND', 'GOLD', 'STAR', 'COMBO',
      'SUPER', 'EXTRA', 'ROCKET', 'MEGA', 'CROWN', 'PRIZE',
      'EXPLOSION', 'VICTORY', 'POWER', 'SWIFT', 'FLAME', 'MAGIC'
    ],
    reflexWords: {
      3: ['sun', 'sea', 'sky', 'air', 'red', 'ice', 'fox', 'cat', 'dog', 'run', 'joy', 'box', 'cup', 'car', 'fly', 'one', 'two', 'top', 'win', 'gem', 'key', 'map', 'ray', 'tag', 'tip', 'zap'],
      4: ['moon', 'star', 'fire', 'wind', 'rain', 'snow', 'gold', 'iron', 'code', 'data', 'game', 'play', 'hero', 'jump', 'fast', 'cool', 'blue', 'pink', 'wave', 'lion', 'bear', 'bird', 'tree', 'leaf'],
      5: ['earth', 'space', 'light', 'water', 'storm', 'cloud', 'flame', 'spark', 'sword', 'shield', 'tiger', 'eagle', 'shark', 'plant', 'sound', 'music', 'power', 'speed', 'brave', 'smart', 'magic', 'dream'],
      6: ['planet', 'rocket', 'galaxy', 'meteor', 'forest', 'island', 'canyon', 'silver', 'shadow', 'dragon', 'knight', 'castle', 'wizard', 'energy', 'flight', 'frozen', 'future', 'golden', 'stream', 'wonder'],
      7: ['diamond', 'thunder', 'rainbow', 'crystal', 'volcano', 'warrior', 'phoenix', 'monarch', 'victory', 'destiny', 'gravity', 'element', 'starlight', 'blossom', 'champion', 'horizon', 'miracle', 'quantum']
    }
  },
  es: {
    categories: {
      natureza: {
        easy: [
          'sol', 'luna', 'mar', 'río', 'cielo', 'flor', 'lago', 'mata', 'león', 'pato',
          'gato', 'oso', 'lobo', 'rana', 'pez', 'nieve', 'viento', 'fuego', 'raíz', 'hoja',
          'tierra', 'onda', 'piedra', 'arena', 'fauna', 'flora', 'pino', 'roca', 'selva'
        ],
        medium: [
          'árbol', 'bosque', 'montaña', 'trueno', 'océano', 'pájaro', 'cascada', 'desierto',
          'valle', 'orvalho', 'pantano', 'sabana', 'tortuga', 'girasol', 'aurora', 'volcán',
          'relámpago', 'tormenta', 'planicie', 'primavera', 'invierno', 'otoño'
        ],
        hard: [
          'fotosíntesis', 'biodiversidad', 'ecosistema', 'cordillera', 'vegetación',
          'mariposa', 'meteorología', 'constelación', 'sostenibilidad', 'fenómeno',
          'herbívoro', 'reforestación', 'cristalino', 'naturaleza', 'preservación'
        ]
      },
      tecnologia: {
        easy: [
          'app', 'web', 'chip', 'byte', 'tela', 'ratón', 'red', 'robot', 'dato', 'cable',
          'sitio', 'link', 'juego', 'foto', 'plug', 'base', 'fio', 'slot', 'ram'
        ],
        medium: [
          'teclado', 'código', 'píxel', 'conexión', 'memoria', 'batería', 'servidor',
          'móvil', 'archivo', 'sistema', 'antena', 'circuito', 'sensor', 'comando',
          'gráfico', 'panel', 'terminal', 'usuario', 'pantalla', 'cámara'
        ],
        hard: [
          'computadora', 'ordenador', 'algoritmo', 'inteligente', 'programación',
          'arquitectura', 'electricidad', 'seguridad', 'criptografía', 'desarrollo',
          'procesador', 'plataforma', 'conectividad', 'ciberespacio', 'nanotecnología'
        ]
      },
      alimentos: {
        easy: [
          'pan', 'jugo', 'café', 'sal', 'miel', 'higo', 'uva', 'manzana', 'torta', 'sopa',
          'dulce', 'arroz', 'pera', 'lima', 'té', 'coco', 'ajo', 'maíz', 'queso', 'huevo'
        ],
        medium: [
          'patata', 'ensalada', 'naranja', 'plátano', 'tomate', 'fresa', 'aceite',
          'harina', 'zanahoria', 'pimienta', 'tostada', 'lasaña', 'helado', 'postre',
          'sandía', 'cereza', 'galleta', 'lenteja', 'garbanzo', 'aceituna'
        ],
        hard: [
          'chocolate', 'restaurante', 'gastronomía', 'macarrones', 'especias',
          'banquete', 'repostería', 'alimentación', 'maracuyá', 'frambuesa',
          'nutricionista', 'degustación', 'delicioso', 'chocolatería'
        ]
      },
      espaco: {
        easy: [
          'sol', 'luna', 'cielo', 'rayo', 'nave', 'polo', 'luz', 'base', 'onda',
          'cono', 'punto', 'gas', 'anillo', 'eje', 'foco', 'domo', 'arco', 'alvo'
        ],
        medium: [
          'planeta', 'estrella', 'meteoro', 'galaxia', 'cometa', 'cohete', 'cosmos',
          'satélite', 'eclipse', 'vacío', 'aurora', 'órbita', 'gravedad', 'cráter',
          'pulsar', 'módulo', 'espacial', 'sonda', 'propulsor', 'agujero'
        ],
        hard: [
          'constelación', 'astronauta', 'telescopio', 'universo', 'supernova',
          'asteroide', 'interestelar', 'heliocéntrico', 'astrofísica', 'radiación',
          'propulsión', 'cosmonauta', 'atmósfera', 'estratosfera', 'gravitacional'
        ]
      }
    },
    allEasy: [
      'sol', 'luna', 'mar', 'río', 'día', 'cielo', 'pan', 'rey', 'luz', 'son',
      'casa', 'mesa', 'bola', 'vida', 'pato', 'gato', 'oro', 'dulce', 'fuego', 'viento',
      'agua', 'árbol', 'libro', 'flor', 'azul', 'café', 'tren', 'oso', 'lobo', 'pez',
      'rana', 'nieve', 'rueda', 'puerta', 'copa', 'sopa', 'dado', 'isla', 'foto', 'mapa',
      'app', 'web', 'chip', 'byte', 'tela', 'red', 'té', 'uva', 'manzana', 'ajo'
    ],
    allMedium: [
      'amigo', 'tiempo', 'nube', 'lluvia', 'campo', 'música', 'escuela', 'ventana',
      'jardín', 'viaje', 'piedra', 'bosque', 'castillo', 'planeta', 'ciudad', 'estrella',
      'energía', 'espejo', 'computador', 'teclado', 'pintura', 'tesoro', 'universo', 'cohete',
      'diamante', 'secreto', 'galaxia', 'guitarra', 'silencio', 'armonía', 'aventura', 'montaña',
      'alegría', 'corazón', 'pájaro', 'océano', 'memoria', 'infinito', 'coraje', 'talento'
    ],
    allHard: [
      'velocidad', 'agilidad', 'inteligente', 'transformar', 'iluminación', 'maravilla',
      'desarrollo', 'electricidad', 'constelación', 'imaginación', 'temperatura', 'productividad',
      'arquitectura', 'entusiasmo', 'extraordinario', 'conocimiento', 'magnífico', 'pensamiento',
      'verdadero', 'profundidad', 'espectacular', 'comunicación', 'sensacional', 'fotosíntesis'
    ],
    bonusWords: [
      'BÔNUS', 'TURBO', 'DIAMANTE', 'ORO', 'ESTRELLA', 'COMBO',
      'SÚPER', 'EXTRA', 'COHETE', 'MEGA', 'CORONA', 'PREMIO',
      'EXPLOSIÓN', 'VICTORIA', 'PODER', 'VELOZ', 'LLAMA', 'MAGIA'
    ],
    reflexWords: {
      3: ['sol', 'luz', 'mar', 'día', 'pan', 'rey', 'paz', 'ola', 'red', 'gas', 'pie', 'voz', 'ojo', 'oro', 'uva', 'uña', 'dos', 'tres', 'fin', 'gol', 'río', 'oso', 'pez', 'sur', 'ley'],
      4: ['luna', 'cielo', 'vida', 'amor', 'agua', 'fuego', 'aire', 'flor', 'roca', 'azul', 'gato', 'pato', 'lobo', 'tren', 'casa', 'mesa', 'hoja', 'vino', 'café', 'león', 'nieve', 'rayo'],
      5: ['amigo', 'playa', 'campo', 'nieve', 'noche', 'árbol', 'tierra', 'verde', 'libro', 'carta', 'fuerza', 'ritmo', 'punto', 'viaje', 'piano', 'claro', 'sueño', 'salto', 'bravo', 'nube'],
      6: ['bosque', 'ciudad', 'música', 'puerta', 'camino', 'estrella', 'galaxia', 'cohete', 'alegría', 'pájaro', 'océano', 'memoria', 'dibujo', 'talento', 'blanco', 'dorado', 'viento', 'sombra'],
      7: ['castillo', 'diamante', 'energía', 'espejo', 'teclado', 'tesoro', 'silencio', 'armonía', 'coraje', 'palabra', 'archivo', 'sistema', 'desafío', 'planeta', 'triunfo', 'victoria', 'montaña']
    }
  },
  fr: {
    categories: {
      natureza: {
        easy: [
          'soleil', 'lune', 'mer', 'vent', 'ciel', 'fleur', 'lac', 'lion', 'chat', 'ours',
          'loup', 'bois', 'neige', 'feu', 'racine', 'terre', 'onde', 'sable', 'pin', 'rose',
          'eau', 'aigle', 'canard', 'pomme', 'rive', 'brise', 'brume', 'nuit', 'parc'
        ],
        medium: [
          'arbre', 'forêt', 'montagne', 'orage', 'océan', 'oiseau', 'cascade', 'graine',
          'volcan', 'rivière', 'désert', 'tortue', 'tournesol', 'savane', 'clairière',
          'vallée', 'tempête', 'printemps', 'automne', 'hiver', 'feuillage'
        ],
        hard: [
          'photosynthèse', 'biodiversité', 'écosystème', 'cordillère', 'végétation',
          'papillon', 'météorologie', 'préservation', 'durabilité', 'phénomène',
          'herbivore', 'environnement', 'cristallin', 'reboisement'
        ]
      },
      tecnologia: {
        easy: [
          'app', 'web', 'puce', 'byte', 'souris', 'pixel', 'robot', 'câble', 'site',
          'lien', 'jeu', 'photo', 'base', 'fil', 'slot', 'page', 'code', 'wifi'
        ],
        medium: [
          'clavier', 'connexion', 'mémoire', 'batterie', 'serveur', 'mobile', 'fichier',
          'système', 'antenne', 'circuit', 'capteur', 'terminal', 'écran', 'caméra',
          'données', 'signal', 'machine', 'programme', 'curseur', 'moteur'
        ],
        hard: [
          'ordinateur', 'algorithme', 'intelligent', 'programmation', 'architecture',
          'électricité', 'sécurité', 'cryptographie', 'processeur', 'plateforme',
          'connectivité', 'cyberspace', 'nanotechnologie', 'développement'
        ]
      },
      alimentos: {
        easy: [
          'pain', 'jus', 'café', 'sel', 'miel', 'figue', 'raisin', 'pomme', 'soupe',
          'sucre', 'riz', 'poire', 'thé', 'coco', 'ail', 'maïs', 'œuf', 'lait', 'tarte'
        ],
        medium: [
          'salade', 'orange', 'ananas', 'banane', 'tomate', 'fraise', 'huile', 'farine',
          'carotte', 'piment', 'tartine', 'glace', 'fromage', 'brioche', 'gâteau',
          'cerise', 'biscuit', 'croissant', 'chocolat', 'bonbon', 'yaourt'
        ],
        hard: [
          'chocolat', 'restaurant', 'gastronomie', 'confiture', 'repas', 'dégustation',
          'framboise', 'alimentation', 'pâtisserie', 'banquet', 'nutritionniste',
          'délicieux', 'gourmandise', 'assaisonnement'
        ]
      },
      espaco: {
        easy: [
          'soleil', 'lune', 'ciel', 'rayon', 'point', 'gaz', 'anneau', 'onde',
          'base', 'foyer', 'dôme', 'pôle', 'flèche', 'cône', 'nuit'
        ],
        medium: [
          'planète', 'étoile', 'météore', 'galaxie', 'comète', 'fusée', 'cosmos',
          'satellite', 'éclipse', 'orbite', 'gravité', 'cratère', 'navette',
          'pulsar', 'module', 'vaisseau', 'aurore', 'vide', 'sonde'
        ],
        hard: [
          'constellation', 'astronaute', 'télescope', 'univers', 'supernova',
          'astéroïde', 'interstellaire', 'astrophysique', 'rayonnement', 'atmosphère',
          'stratosphère', 'gravitationnel', 'cosmonaute', 'observatoire'
        ]
      }
    },
    allEasy: [
      'soleil', 'lune', 'mer', 'vent', 'jour', 'ciel', 'pain', 'roi', 'voie', 'eau',
      'nuit', 'bois', 'rose', 'chat', 'ours', 'loup', 'feu', 'fleur', 'bleu', 'café',
      'neige', 'porte', 'verre', 'pomme', 'sel', 'doux', 'rive', 'base', 'page', 'site',
      'app', 'web', 'puce', 'code', 'lien', 'film', 'thé', 'poire', 'riz', 'ail'
    ],
    allMedium: [
      'ami', 'temps', 'nuage', 'pluie', 'champ', 'musique', 'école', 'fenêtre',
      'jardin', 'voyage', 'pierre', 'forêt', 'château', 'planète', 'ville', 'étoile',
      'énergie', 'miroir', 'ordinateur', 'clavier', 'peinture', 'trésor', 'univers', 'fusée',
      'diamant', 'secret', 'galaxie', 'guitare', 'silence', 'harmonie', 'aventure', 'montagne',
      'joie', 'cœur', 'oiseau', 'océan', 'mémoire', 'courage', 'dessin', 'succès'
    ],
    allHard: [
      'vitesse', 'agilité', 'intelligent', 'transformer', 'illumination', 'merveille',
      'développement', 'électricité', 'constellation', 'imagination', 'température', 'productivité',
      'architecture', 'enthousiasme', 'extraordinaire', 'connaissance', 'magnifique', 'pensée',
      'véritable', 'profondeur', 'spectaculaire', 'communication', 'sensationnel', 'photosynthèse'
    ],
    bonusWords: [
      'BONUS', 'TURBO', 'DIAMANT', 'OR', 'ÉTOILE', 'COMBO',
      'SUPER', 'EXTRA', 'FUSÉE', 'MÉGA', 'COURONNE', 'PRIX',
      'EXPLOSION', 'VICTOIRE', 'POUVOIR', 'RAPIDE', 'FLAMME', 'MAGIE'
    ],
    reflexWords: {
      3: ['mer', 'ciel', 'feu', 'air', 'eau', 'vie', 'roi', 'ami', 'jour', 'nuit', 'sel', 'mot', 'jeu', 'sac', 'bal', 'arc', 'lac', 'mur', 'par', 'sol', 'vue', 'voix', 'don', 'pas'],
      4: ['lune', 'vent', 'bois', 'rose', 'bleu', 'vert', 'noir', 'chat', 'ours', 'loup', 'lion', 'doux', 'beau', 'pain', 'café', 'livre', 'port', 'pont', 'gare', 'main', 'pied', 'yeux'],
      5: ['arbre', 'plage', 'fleur', 'monde', 'terre', 'soleil', 'amour', 'coeur', 'table', 'porte', 'verre', 'route', 'train', 'avion', 'navire', 'forêt', 'champ', 'pluie', 'neige', 'bruit'],
      6: ['étoile', 'fusée', 'comète', 'nature', 'fleuve', 'océan', 'oiseau', 'silence', 'secret', 'beauté', 'vitesse', 'courage', 'château', 'voyage', 'musique', 'soleil', 'pierre', 'flamme'],
      7: ['planète', 'galaxie', 'univers', 'diamant', 'victoire', 'lumière', 'tempête', 'cascade', 'bonheur', 'harmonie', 'mystère', 'courage', 'énergie', 'miracle', 'histoire', 'destin']
    }
  }
};

/**
 * Normaliza caracteres para facilitar digitação ágil (suporta PT, EN, ES, FR)
 */
export function normalizeChar(char: string): string {
  return char
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function normalizeWord(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Retorna uma palavra aleatória dependendo da categoria, nível, dificuldade e idioma escolhido
 */
export function getRandomWord(
  level: number,
  category: WordCategory = 'todas',
  difficulty: Difficulty = 'normal',
  isBonus: boolean = false,
  isReverse: boolean = false,
  language: GameLanguage = 'pt'
): string {
  const vocab = VOCABULARIES[language] || VOCABULARIES.pt;

  if (isBonus) {
    const list = vocab.bonusWords;
    return list[Math.floor(Math.random() * list.length)];
  }

  let easyList: string[];
  let mediumList: string[];
  let hardList: string[];

  if (category !== 'todas' && vocab.categories[category]) {
    easyList = vocab.categories[category].easy;
    mediumList = vocab.categories[category].medium;
    hardList = vocab.categories[category].hard;
  } else {
    easyList = vocab.allEasy;
    mediumList = vocab.allMedium;
    hardList = vocab.allHard;
  }

  // Palavras azuis (invertidas): vocabulário acessível, mantendo quantidade equilibrada de letras
  if (isReverse) {
    const pool = level <= 3 ? easyList : (Math.random() < 0.65 ? easyList : mediumList);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Dificuldade 'bebe': sempre palavras curtas e simples (2 a 4 letras)
  if (difficulty === 'bebe') {
    const pool = easyList.filter((w) => w.length <= 4);
    const chosenPool = pool.length > 0 ? pool : easyList;
    return chosenPool[Math.floor(Math.random() * chosenPool.length)];
  }

  // Dificuldade 'facil': fáceis e algumas médias no nível 3+
  if (difficulty === 'facil') {
    const pool = level <= 2 ? easyList : (Math.random() < 0.75 ? easyList : mediumList);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Dificuldade 'normal': progressão equilibrada
  if (difficulty === 'normal') {
    let pool: string[];
    if (level <= 2) {
      pool = easyList;
    } else if (level <= 5) {
      pool = Math.random() < 0.4 ? easyList : mediumList;
    } else {
      pool = Math.random() < 0.3 ? mediumList : hardList;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Dificuldade 'media': começa com médias, avança para difíceis
  if (difficulty === 'media') {
    let pool: string[];
    if (level <= 2) {
      pool = Math.random() < 0.3 ? easyList : mediumList;
    } else if (level <= 4) {
      pool = mediumList;
    } else {
      pool = Math.random() < 0.4 ? mediumList : hardList;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Dificuldade 'dificil': palavras médias e longas
  if (difficulty === 'dificil') {
    const pool = level <= 2 ? mediumList : (Math.random() < 0.3 ? mediumList : hardList);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Dificuldade 'speed_typer': teste de velocidade com vocabulário rico
  const speedPool = Math.random() < 0.25 ? easyList : (Math.random() < 0.5 ? mediumList : hardList);
  return speedPool[Math.floor(Math.random() * speedPool.length)];
}

export function getReflexWord(length: number, language: GameLanguage = 'pt'): string {
  const vocab = VOCABULARIES[language] || VOCABULARIES.pt;
  const list = vocab.reflexWords[length] || vocab.reflexWords[3];
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Retorna uma conta matemática aleatória e seu resultado como texto
 * No modo matemática, caem contas e você digita a resposta delas!
 */
export function getRandomMathProblem(difficulty: Difficulty = 'normal'): { expression: string; answer: string } {
  let a: number;
  let b: number;
  let op: '+' | '-' | '*' | '/';

  if (difficulty === 'bebe' || difficulty === 'facil') {
    // Apenas soma e subtração com números pequenos (respostas de 1 a 15)
    op = Math.random() < 0.6 ? '+' : '-';
    if (op === '+') {
      a = Math.floor(Math.random() * 8) + 1;
      b = Math.floor(Math.random() * 8) + 1;
      return { expression: `${a} + ${b}`, answer: String(a + b) };
    } else {
      a = Math.floor(Math.random() * 9) + 4;
      b = Math.floor(Math.random() * (a - 1)) + 1;
      return { expression: `${a} - ${b}`, answer: String(a - b) };
    }
  }

  if (difficulty === 'normal' || difficulty === 'media') {
    // Soma, subtração e multiplicação simples (tabuada)
    const roll = Math.random();
    if (roll < 0.4) {
      a = Math.floor(Math.random() * 20) + 5;
      b = Math.floor(Math.random() * 15) + 3;
      return { expression: `${a} + ${b}`, answer: String(a + b) };
    } else if (roll < 0.7) {
      a = Math.floor(Math.random() * 25) + 8;
      b = Math.floor(Math.random() * (a - 3)) + 2;
      return { expression: `${a} - ${b}`, answer: String(a - b) };
    } else {
      a = Math.floor(Math.random() * 8) + 2;
      b = Math.floor(Math.random() * 7) + 2;
      return { expression: `${a} × ${b}`, answer: String(a * b) };
    }
  }

  // Difícil e Speed Typer
  const roll = Math.random();
  if (roll < 0.3) {
    a = Math.floor(Math.random() * 45) + 15;
    b = Math.floor(Math.random() * 45) + 15;
    return { expression: `${a} + ${b}`, answer: String(a + b) };
  } else if (roll < 0.55) {
    a = Math.floor(Math.random() * 60) + 25;
    b = Math.floor(Math.random() * (a - 10)) + 5;
    return { expression: `${a} - ${b}`, answer: String(a - b) };
  } else if (roll < 0.8) {
    a = Math.floor(Math.random() * 11) + 3;
    b = Math.floor(Math.random() * 9) + 3;
    return { expression: `${a} × ${b}`, answer: String(a * b) };
  } else {
    // Divisão exata
    b = Math.floor(Math.random() * 8) + 2;
    const quotient = Math.floor(Math.random() * 9) + 2;
    a = b * quotient;
    return { expression: `${a} ÷ ${b}`, answer: String(quotient) };
  }
}

/**
 * Retorna palavras com o tamanho exato especificado (para o Modo Duelo equilibrado)
 */
export function getRandomWordByLength(length: number, language: GameLanguage = 'pt'): string {
  const vocab = VOCABULARIES[language] || VOCABULARIES.pt;
  if (vocab.reflexWords && vocab.reflexWords[length] && vocab.reflexWords[length].length > 0) {
    const list = vocab.reflexWords[length];
    return list[Math.floor(Math.random() * list.length)];
  }

  // Fallback para todas as palavras com esse tamanho
  const all = [...vocab.allEasy, ...vocab.allMedium, ...vocab.allHard];
  const matching = all.filter((w) => w.length === length);
  if (matching.length > 0) {
    return matching[Math.floor(Math.random() * matching.length)];
  }

  return getReflexWord(Math.min(7, Math.max(3, length)), language);
}
