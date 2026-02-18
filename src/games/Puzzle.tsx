import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { saveGameScore } from '../services/scoreService'

const SIZE = 4
const TOTAL = SIZE * SIZE

function shuffle(arr: number[]): number[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function isSolvable(arr: number[]): boolean {
  let inv = 0
  for (let i = 0; i < TOTAL; i++) {
    for (let j = i + 1; j < TOTAL; j++) {
      if (arr[i] && arr[j] && arr[i] > arr[j]) inv++
    }
  }
  const emptyRow = Math.floor(arr.indexOf(0) / SIZE)
  return (inv + emptyRow) % 2 === 0
}

export default function GamePuzzle() {
  const { user, profile, refreshProfile } = useAuth()
  const [tiles, setTiles] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)

  const init = () => {
    let arr: number[]
    do {
      arr = shuffle(Array.from({ length: TOTAL }, (_, i) => i))
    } while (!isSolvable(arr))
    setTiles(arr)
    setMoves(0)
    setStartTime(Date.now())
  }

  useEffect(() => {
    init()
  }, [])

  const emptyIdx = tiles.indexOf(0)
  const solved = tiles.every((t, i) => t === (i + 1) % TOTAL)

  useEffect(() => {
    if (solved && tiles.length && startTime) {
      const pts = Math.max(150 - moves * 3 - Math.floor((Date.now() - startTime) / 1000), 20)
      if (user && profile) {
        saveGameScore(user.uid, 'puzzle', pts, profile.displayName).then(refreshProfile)
      }
    }
  }, [solved, tiles, moves, startTime, user, profile])

  const move = (i: number) => {
    const row = Math.floor(i / SIZE)
    const col = i % SIZE
    const emptyRow = Math.floor(emptyIdx / SIZE)
    const emptyCol = emptyIdx % SIZE
    if ((row === emptyRow && Math.abs(col - emptyCol) === 1) || (col === emptyCol && Math.abs(row - emptyRow) === 1)) {
      const next = [...tiles]
      next[emptyIdx] = next[i]
      next[i] = 0
      setTiles(next)
      setMoves((m) => m + 1)
    }
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">← Back</Link>
        <h1>Slide Puzzle</h1>
        <span className="game-score">Moves: {moves}</span>
      </div>
      <div className="game-board puzzle-board">
        {solved ? (
          <div className="game-over">
            <h2>Solved!</h2>
            <p>Moves: {moves}</p>
            <button className="btn btn-primary" onClick={init}>Play Again</button>
          </div>
        ) : (
          <div className="puzzle-grid">
            {tiles.map((t, i) => (
              <button
                key={i}
                className={`puzzle-tile ${t === 0 ? 'empty' : ''}`}
                onClick={() => move(i)}
                disabled={t === 0}
              >
                {t || ''}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
