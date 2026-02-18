import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, limit, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'

interface ScoreRecord {
  gameId: string
  score: number
  timestamp: string
}

const GAME_NAMES: Record<string, string> = {
  snake: 'Snake',
  tictactoe: 'Tic Tac Toe',
  memory: 'Memory',
  puzzle: 'Puzzle',
  '2048': '2048',
  rps: 'Rock Paper Scissors',
  hangman: 'Hangman',
  breakout: 'Breakout',
  simon: 'Simon Says',
  whack: 'Whack-a-Mole',
  reaction: 'Reaction Test',
  numberguess: 'Number Guess',
  dice: 'Dice Roll',
  colormatch: 'Color Match',
  trivia: 'Trivia',
  flappy: 'Flappy',
  connect4: 'Connect Four',
  mastermind: 'Mastermind',
  wordscramble: 'Word Scramble',
  nim: 'Nim',
  minesweeper: 'Minesweeper',
  mathchallenge: 'Math Challenge',
}

export default function Profile() {
  const { user, profile } = useAuth()
  const [history, setHistory] = useState<ScoreRecord[]>([])
  const uid = user?.uid || profile?.uid

  useEffect(() => {
    if (!uid) return
    const q = query(
      collection(db, 'scores'),
      where('userId', '==', uid),
      limit(50)
    )
    getDocs(q)
      .then((snap) => {
        const records: ScoreRecord[] = snap.docs.map((d) => {
          const data = d.data()
          return { gameId: data.gameId, score: data.score, timestamp: data.timestamp }
        })
        records.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
        setHistory(records.slice(0, 20))
      })
      .catch((err) => {
        console.error('Failed to load match history:', err)
        setHistory([])
      })
  }, [uid])

  const achievements = profile?.achievements || []

  return (
    <div className="profile-page">
      <h1 className="page-title">Profile</h1>
      <div className="profile-grid">
        <div className="profile-card stats">
          <h2>Stats</h2>
          <div className="stat-row">
            <span>Total Points</span>
            <span className="stat-value">{profile?.totalPoints ?? 0}</span>
          </div>
          <div className="stat-row">
            <span>Games Played</span>
            <span className="stat-value">{profile?.gamesPlayed ?? 0}</span>
          </div>
        </div>
        <div className="profile-card achievements">
          <h2>Achievements</h2>
          {achievements.length === 0 ? (
            <p>Play games to unlock achievements!</p>
          ) : (
            <div className="achievement-list">
              {achievements.map((a) => (
                <span key={a} className="badge">{a}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="match-history">
        <h2>Match History</h2>
        {history.length === 0 ? (
          <p>No games played yet. <Link to="/games">Start playing!</Link></p>
        ) : (
          <div className="history-list">
            {history.map((h, i) => (
              <div key={i} className="history-item">
                <span>{GAME_NAMES[h.gameId] || h.gameId}</span>
                <span>+{h.score} pts</span>
                <span>{new Date(h.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
