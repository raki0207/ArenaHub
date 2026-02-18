import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../config/firebase'

export const ACHIEVEMENTS = [
  { id: 'first_game', name: 'First Steps', description: 'Complete your first game', icon: '🎮' },
  { id: 'ten_games', name: 'Dedicated', description: 'Play 10 games', icon: '🏆' },
  { id: 'hundred_points', name: 'Century', description: 'Earn 100 total points', icon: '💯' },
  { id: 'five_hundred', name: 'Champion', description: 'Earn 500 total points', icon: '👑' },
  { id: 'thousand', name: 'Legend', description: 'Earn 1000 total points', icon: '⭐' },
]

export async function checkAndAwardAchievements(
  userId: string,
  totalPoints: number,
  gamesPlayed: number
): Promise<string[]> {
  const userRef = doc(db, 'users', userId)
  const snap = await getDoc(userRef)
  if (!snap.exists()) return []

  const current = snap.data().achievements || []
  const earned: string[] = []

  if (!current.includes('First Steps') && gamesPlayed >= 1) {
    earned.push('First Steps')
  }
  if (!current.includes('Dedicated') && gamesPlayed >= 10) {
    earned.push('Dedicated')
  }
  if (!current.includes('Century') && totalPoints >= 100) {
    earned.push('Century')
  }
  if (!current.includes('Champion') && totalPoints >= 500) {
    earned.push('Champion')
  }
  if (!current.includes('Legend') && totalPoints >= 1000) {
    earned.push('Legend')
  }

  if (earned.length) {
    await updateDoc(userRef, { achievements: arrayUnion(...earned) })
  }
  return earned
}
