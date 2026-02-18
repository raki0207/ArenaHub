import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { checkAndAwardAchievements } from './achievements'

const DAILY_BONUS_POINTS = 50

export async function saveGameScore(
  userId: string,
  gameId: string,
  score: number,
  displayName: string
) {
  const userRef = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) return

  await updateDoc(userRef, {
    totalPoints: increment(score),
    gamesPlayed: increment(1),
  })

  await addDoc(collection(db, 'scores'), {
    userId,
    gameId,
    score,
    displayName,
    timestamp: new Date().toISOString(),
  })

  const updatedSnap = await getDoc(userRef)
  const data = updatedSnap.data()
  if (data) {
    await checkAndAwardAchievements(userId, data.totalPoints || 0, data.gamesPlayed || 0)
  }
}

export async function claimDailyBonus(userId: string): Promise<number> {
  const userRef = doc(db, 'users', userId)
  const snap = await getDoc(userRef)
  if (!snap.exists()) return 0

  const data = snap.data()
  const lastLogin = data.lastLoginDate || ''
  const today = new Date().toISOString().split('T')[0]

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (lastLogin === yesterdayStr) {
    return DAILY_BONUS_POINTS
  }
  if (lastLogin !== today) {
    return DAILY_BONUS_POINTS
  }
  return 0
}

export async function getLeaderboard(limitCount = 100) {
  const usersRef = collection(db, 'users')
  const q = query(
    usersRef,
    orderBy('totalPoints', 'desc'),
    limit(limitCount)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d, i) => ({
    uid: d.id,
    displayName: d.data().displayName || 'Anonymous',
    totalPoints: d.data().totalPoints || 0,
    rank: i + 1,
  }))
}
