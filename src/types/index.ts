export interface UserProfile {
  uid: string
  email: string
  displayName: string
  totalPoints: number
  gamesPlayed: number
  achievements: string[]
  lastLoginDate: string
  createdAt: string
}

export interface GameScore {
  gameId: string
  userId: string
  score: number
  timestamp: string
}

export interface LeaderboardEntry {
  uid: string
  displayName: string
  totalPoints: number
  rank: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
}
