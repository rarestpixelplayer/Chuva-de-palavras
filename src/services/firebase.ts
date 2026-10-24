import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Suporte a variáveis de ambiente (Vercel) com fallback automático para firebase-applet-config.json
const resolvedConfig = {
  projectId: (import.meta.env?.VITE_FIREBASE_PROJECT_ID as string) || firebaseConfig.projectId,
  appId: (import.meta.env?.VITE_FIREBASE_APP_ID as string) || firebaseConfig.appId,
  apiKey: (import.meta.env?.VITE_FIREBASE_API_KEY as string) || firebaseConfig.apiKey,
  authDomain: (import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN as string) || firebaseConfig.authDomain,
  firestoreDatabaseId: (import.meta.env?.VITE_FIREBASE_DATABASE_ID as string) || firebaseConfig.firestoreDatabaseId,
  storageBucket: (import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET as string) || firebaseConfig.storageBucket,
  messagingSenderId: (import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || firebaseConfig.messagingSenderId,
};

const app = !getApps().length ? initializeApp(resolvedConfig) : getApp();
export const auth = getAuth(app);
export const db = resolvedConfig.firestoreDatabaseId
  ? getFirestore(app, resolvedConfig.firestoreDatabaseId)
  : getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export interface UserProfileData {
  uid: string;
  username: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
}

export interface RankingEntry {
  id?: string;
  uid: string;
  username: string;
  score: number;
  gameMode: string;
  difficulty: string;
  wordsTyped: number;
  maxCombo: number;
  accuracy: number;
  timestamp: number;
}

/**
 * Realiza login com Google popup
 */
export async function loginWithGoogle(): Promise<{ user: User | null; error?: string; cancelled?: boolean }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user };
  } catch (err: unknown) {
    const firebaseErr = err as { code?: string; message?: string };
    const code = firebaseErr?.code || '';

    // O usuário fechou a janela ou cancelou intencionalmente a autenticação
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return { user: null, cancelled: true };
    }

    if (code === 'auth/popup-blocked') {
      return {
        user: null,
        error: 'O pop-up de login foi bloqueado pelo seu navegador. Por favor, permita pop-ups nesta página para entrar com o Google.',
      };
    }

    if (code === 'auth/network-request-failed') {
      return {
        user: null,
        error: 'Falha de conexão com os servidores de autenticação. Verifique sua conexão com a internet.',
      };
    }

    console.warn('Aviso no login com Google:', err);
    const message = err instanceof Error ? err.message : 'Falha ao autenticar com Google';
    return { user: null, error: message };
  }
}

/**
 * Desconectar conta
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Helper com timeout para evitar que chamadas fiquem travadas offline
async function withTimeout<T>(promise: Promise<T>, ms: number = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout de conexão com o banco de dados')), ms)
    ),
  ]);
}

/**
 * Busca perfil do usuário pelo UID
 */
export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  // 1. Tenta carregar do cache local primeiro para agilidade instantânea
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('chuva_palavras_user_profile');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.uid === uid && parsed?.username) return parsed;
      } catch {}
    }
  }

  // 2. Tenta Firestore com timeout resiliente
  try {
    const userDoc = await withTimeout(getDoc(doc(db, 'users', uid)), 2500);
    if (userDoc.exists()) {
      const data = userDoc.data() as UserProfileData;
      if (typeof window !== 'undefined') {
        localStorage.setItem('chuva_palavras_user_profile', JSON.stringify(data));
      }
      return data;
    }
  } catch (err) {
    console.warn('Firestore offline ou inacessível, utilizando perfil local:', err);
  }

  return null;
}

/**
 * Define ou atualiza nome de usuário único
 * Exemplo de erro se já existir: "Mateus já foi escolhido, digite outro nome de usuário"
 */
export async function claimUsername(
  uid: string,
  rawUsername: string,
  displayName: string,
  photoURL?: string
): Promise<{ success: boolean; error?: string; username?: string }> {
  const cleanUsername = rawUsername.trim();
  if (cleanUsername.length < 3) {
    return { success: false, error: 'O nome de usuário deve ter no mínimo 3 caracteres.' };
  }
  if (cleanUsername.length > 18) {
    return { success: false, error: 'O nome de usuário deve ter no máximo 18 caracteres.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    return { success: false, error: 'Use apenas letras, números e sublinhado (_).' };
  }

  const usernameLower = cleanUsername.toLowerCase();

  // Verifica cache local de nomes já registrados para proteção offline
  if (typeof window !== 'undefined') {
    try {
      const localClaims = JSON.parse(localStorage.getItem('chuva_palavras_claimed_usernames') || '{}');
      if (localClaims[usernameLower] && localClaims[usernameLower] !== uid) {
        return {
          success: false,
          error: `"${cleanUsername}" já foi escolhido, digite outro nome de usuário.`,
        };
      }
    } catch {}
  }

  const profile: UserProfileData = {
    uid,
    username: cleanUsername,
    displayName: displayName || cleanUsername,
    photoURL: photoURL || '',
    createdAt: Date.now(),
  };

  // Salva imediatamente no cache local para nunca travar a experiência do usuário
  if (typeof window !== 'undefined') {
    localStorage.setItem('chuva_palavras_user_profile', JSON.stringify(profile));
    try {
      const localClaims = JSON.parse(localStorage.getItem('chuva_palavras_claimed_usernames') || '{}');
      localClaims[usernameLower] = uid;
      localStorage.setItem('chuva_palavras_claimed_usernames', JSON.stringify(localClaims));
    } catch {}
  }

  // Tenta sincronizar com o Firestore em background com timeout
  try {
    const claimRef = doc(db, 'usernames', usernameLower);
    const claimSnap = await withTimeout(getDoc(claimRef), 2000);

    if (claimSnap.exists()) {
      const data = claimSnap.data();
      if (data?.uid !== uid) {
        return {
          success: false,
          error: `"${cleanUsername}" já foi escolhido, digite outro nome de usuário.`,
        };
      }
    }

    // Salva na coleção de nomes únicos e no perfil do usuário
    await withTimeout(
      Promise.all([
        setDoc(claimRef, { uid, username: cleanUsername, claimedAt: Date.now() }),
        setDoc(doc(db, 'users', uid), profile, { merge: true }),
      ]),
      2500
    );

    return { success: true, username: cleanUsername };
  } catch (err: unknown) {
    console.warn('Aviso ao sincronizar nome com Firestore (modo offline ativo):', err);
    // Salvo localmente com sucesso total
    return { success: true, username: cleanUsername };
  }
}

export interface FeedbackData {
  uid?: string;
  username?: string;
  rating: number;
  category: string;
  comment: string;
}

export async function submitFeedback(feedback: FeedbackData): Promise<{ success: boolean; message?: string }> {
  // Salva no cache local de feedbacks
  if (typeof window !== 'undefined') {
    try {
      const localFeedbacks = JSON.parse(localStorage.getItem('chuva_palavras_feedback_queue') || '[]');
      localFeedbacks.push({ ...feedback, timestamp: Date.now() });
      localStorage.setItem('chuva_palavras_feedback_queue', JSON.stringify(localFeedbacks));
    } catch {}
  }

  try {
    const feedbackColl = collection(db, 'feedback');
    const docRef = doc(feedbackColl);
    await withTimeout(
      setDoc(docRef, {
        ...feedback,
        timestamp: Date.now(),
      }),
      2500
    );
    return { success: true, message: 'Obrigado! Seu feedback foi enviado com sucesso.' };
  } catch (err) {
    console.warn('Feedback gravado no dispositivo localmente:', err);
    return { success: true, message: 'Obrigado! Seu feedback foi registrado com sucesso.' };
  }
}

/**
 * Salva pontuação automaticamente no ranking para a combinação de modo e dificuldade
 */
export async function autoSubmitScore(
  uid: string,
  username: string,
  score: number,
  gameMode: string,
  difficulty: string,
  wordsTyped: number,
  maxCombo: number,
  accuracy: number
): Promise<void> {
  if (!uid || !username || score <= 0) return;

  const payload: RankingEntry = {
    uid,
    username,
    score,
    gameMode,
    difficulty,
    wordsTyped,
    maxCombo,
    accuracy,
    timestamp: Date.now(),
  };

  // Salva no ranking local em cache
  if (typeof window !== 'undefined') {
    try {
      const localLeaderboard: RankingEntry[] = JSON.parse(
        localStorage.getItem('chuva_palavras_local_leaderboard') || '[]'
      );
      const existingIdx = localLeaderboard.findIndex(
        (r) => r.uid === uid && r.gameMode === gameMode && r.difficulty === difficulty
      );
      if (existingIdx !== -1) {
        if (score > localLeaderboard[existingIdx].score) {
          localLeaderboard[existingIdx] = payload;
        }
      } else {
        localLeaderboard.push(payload);
      }
      localStorage.setItem(
        'chuva_palavras_local_leaderboard',
        JSON.stringify(localLeaderboard)
      );
    } catch {}
  }

  // Tenta sincronizar com Firestore
  try {
    const rankingId = `${uid}_${gameMode}_${difficulty}`;
    const rankingRef = doc(db, 'rankings', rankingId);

    const existingSnap = await withTimeout(getDoc(rankingRef), 2000);
    if (existingSnap.exists()) {
      const existing = existingSnap.data();
      if (existing.score >= score) {
        return;
      }
    }

    await withTimeout(setDoc(rankingRef, payload), 2500);
  } catch (err) {
    console.warn('Aviso ao sincronizar score com Firestore (armazenado localmente):', err);
  }
}

/**
 * Busca o ranking filtrado por modo e dificuldade
 */
export async function fetchLeaderboard(
  gameMode: string,
  difficulty: string = 'todas'
): Promise<RankingEntry[]> {
  const localList: RankingEntry[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored: RankingEntry[] = JSON.parse(
        localStorage.getItem('chuva_palavras_local_leaderboard') || '[]'
      );
      stored
        .filter((r) => r.gameMode === gameMode && (difficulty === 'todas' || r.difficulty === difficulty))
        .forEach((r) => localList.push(r));
    } catch {}
  }

  try {
    const rankingsColl = collection(db, 'rankings');
    let q = query(rankingsColl, where('gameMode', '==', gameMode), limit(40));

    if (difficulty !== 'todas') {
      q = query(
        rankingsColl,
        where('gameMode', '==', gameMode),
        where('difficulty', '==', difficulty),
        limit(30)
      );
    }

    const snapshot = await withTimeout(getDocs(q), 2500);
    const remoteList: RankingEntry[] = [];
    snapshot.forEach((d) => {
      remoteList.push({ id: d.id, ...(d.data() as RankingEntry) });
    });

    // Mescla local e remoto evitando duplicatas de mesmo UID
    const mergedMap = new Map<string, RankingEntry>();
    remoteList.forEach((item) => mergedMap.set(`${item.uid}_${item.gameMode}_${item.difficulty}`, item));
    localList.forEach((item) => {
      const key = `${item.uid}_${item.gameMode}_${item.difficulty}`;
      if (!mergedMap.has(key) || item.score > mergedMap.get(key)!.score) {
        mergedMap.set(key, item);
      }
    });

    const result = Array.from(mergedMap.values());
    result.sort((a, b) => b.score - a.score);
    return result;
  } catch (err) {
    console.warn('Aviso ao carregar ranking do Firestore, exibindo ranking local:', err);
    localList.sort((a, b) => b.score - a.score);
    return localList;
  }
}

export interface DuelRoomData {
  id: string;
  code: string;
  hostUid: string;
  hostName: string;
  guestUid?: string;
  guestName?: string;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  isPublic: boolean;
  words: string[];
  hostScore: number;
  hostWordsDestroyed: number;
  hostCurrentWordIdx: number;
  hostTypedLength: number;
  guestScore: number;
  guestWordsDestroyed: number;
  guestCurrentWordIdx: number;
  guestTypedLength: number;
  winnerName?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Cria sala online com código de 6 dígitos
 */
export async function createDuelRoom(
  hostName: string,
  isPublic: boolean,
  words: string[]
): Promise<{ success: boolean; room?: DuelRoomData; error?: string }> {
  // Código de 6 dígitos numéricos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hostUid = auth.currentUser?.uid || 'host_' + Math.random().toString(36).substring(2, 9);

  const roomData: DuelRoomData = {
    id: code,
    code,
    hostUid,
    hostName: hostName || 'Jogador 1',
    status: 'WAITING',
    isPublic,
    words,
    hostScore: 0,
    hostWordsDestroyed: 0,
    hostCurrentWordIdx: 0,
    hostTypedLength: 0,
    guestScore: 0,
    guestWordsDestroyed: 0,
    guestCurrentWordIdx: 0,
    guestTypedLength: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  try {
    const roomRef = doc(db, 'duels', code);
    await withTimeout(setDoc(roomRef, roomData), 3500);
    return { success: true, room: roomData };
  } catch (err: unknown) {
    console.warn('Erro ao criar sala no Firestore (usando fallback local):', err);
    if (typeof window !== 'undefined') {
      const localDuels = JSON.parse(localStorage.getItem('chuva_palavras_local_duels') || '{}');
      localDuels[code] = roomData;
      localStorage.setItem('chuva_palavras_local_duels', JSON.stringify(localDuels));
    }
    return { success: true, room: roomData };
  }
}

/**
 * Entra em uma sala online via código de 6 dígitos
 */
export async function joinDuelRoom(
  rawCode: string,
  guestName: string
): Promise<{ success: boolean; error?: string; room?: DuelRoomData }> {
  const cleanCode = rawCode.trim().replace(/\D/g, '').slice(0, 6);
  if (cleanCode.length !== 6) {
    return { success: false, error: 'O código da sala deve ter exatamente 6 dígitos numéricos.' };
  }

  const guestUid = auth.currentUser?.uid || 'guest_' + Math.random().toString(36).substring(2, 9);

  try {
    const roomRef = doc(db, 'duels', cleanCode);
    const snap = await withTimeout(getDoc(roomRef), 3000);

    if (!snap.exists()) {
      if (typeof window !== 'undefined') {
        const localDuels = JSON.parse(localStorage.getItem('chuva_palavras_local_duels') || '{}');
        if (localDuels[cleanCode]) {
          const room = localDuels[cleanCode] as DuelRoomData;
          room.guestUid = guestUid;
          room.guestName = guestName;
          room.status = 'PLAYING';
          room.updatedAt = Date.now();
          localDuels[cleanCode] = room;
          localStorage.setItem('chuva_palavras_local_duels', JSON.stringify(localDuels));
          return { success: true, room };
        }
      }
      return { success: false, error: `Sala #${cleanCode} não encontrada. Verifique os 6 dígitos digitados.` };
    }

    const room = snap.data() as DuelRoomData;
    if (room.status === 'PLAYING') {
      return { success: false, error: 'Esta sala já está em andamento com dois jogadores!' };
    }
    if (room.status === 'FINISHED') {
      return { success: false, error: 'Esta partida já foi encerrada.' };
    }

    const updates = {
      guestUid,
      guestName: guestName || 'Jogador 2',
      status: 'PLAYING' as const,
      updatedAt: Date.now(),
    };

    await withTimeout(updateDoc(roomRef, updates), 3000);

    return {
      success: true,
      room: {
        ...room,
        ...updates,
      },
    };
  } catch (err: unknown) {
    console.warn('Erro ao conectar à sala Firestore:', err);
    return { success: false, error: 'Não foi possível conectar à sala. Verifique sua conexão e tente novamente.' };
  }
}

/**
 * Busca salas públicas aguardando oponente
 */
export async function fetchPublicDuelRooms(): Promise<DuelRoomData[]> {
  try {
    const duelsColl = collection(db, 'duels');
    const q = query(
      duelsColl,
      where('status', '==', 'WAITING'),
      where('isPublic', '==', true),
      limit(20)
    );
    const snap = await withTimeout(getDocs(q), 3000);
    const rooms: DuelRoomData[] = [];
    snap.forEach((d) => {
      rooms.push({ ...(d.data() as DuelRoomData), id: d.id });
    });
    rooms.sort((a, b) => b.createdAt - a.createdAt);
    return rooms;
  } catch (err) {
    console.warn('Aviso ao buscar salas públicas:', err);
    if (typeof window !== 'undefined') {
      try {
        const localDuels = JSON.parse(localStorage.getItem('chuva_palavras_local_duels') || '{}');
        return Object.values(localDuels).filter(
          (r: any) => r.status === 'WAITING' && r.isPublic
        ) as DuelRoomData[];
      } catch {}
    }
    return [];
  }
}

/**
 * Atualiza o progresso do jogador em tempo real
 */
export async function updateDuelProgress(
  roomId: string,
  updates: Partial<DuelRoomData>
): Promise<void> {
  try {
    const roomRef = doc(db, 'duels', roomId);
    await updateDoc(roomRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.warn('Erro ao atualizar progresso do duelo:', err);
  }
}

/**
 * Escuta atualizações da sala em tempo real
 */
export function subscribeDuelRoom(
  roomId: string,
  callback: (data: DuelRoomData | null) => void
): () => void {
  try {
    const roomRef = doc(db, 'duels', roomId);
    return onSnapshot(
      roomRef,
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as DuelRoomData);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.warn('Erro no listener da sala de duelo:', error);
      }
    );
  } catch (err) {
    console.warn('Erro ao iniciar listener da sala:', err);
    return () => {};
  }
}
