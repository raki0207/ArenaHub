import { useEffect, useState } from 'react'
import { getLeaderboard } from '../services/scoreService'
import { LeaderboardEntry } from '../types'

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeaderboard()
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-screen">Loading leaderboard...</div>

  return (
    <div className="leaderboard-page">
      <h1 className="page-title">Leaderboard</h1>
      <p className="page-subtitle">Top players by total points</p>
      <div className="leaderboard-table">
        <div className="leaderboard-header">
          <span>Rank</span>
          <span>Player</span>
          <span>Points</span>
        </div>
        {entries.length === 0 ? (
          <p className="empty-message">No scores yet. Be the first to play!</p>
        ) : (
          entries.map((e) => (
            <div key={e.uid} className="leaderboard-row">
              <span className={`rank rank-${e.rank}`}>{e.rank}</span>
              <span>{e.displayName}</span>
              <span className="points">{e.totalPoints}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
