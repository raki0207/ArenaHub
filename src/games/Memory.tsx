import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { saveGameScore } from '../services/scoreService'

const EMOJIS = ['dog', 'cat', 'mouse', 'hamster', 'rabbit', 'fox', 'bear', 'panda']
const PAIRS = 8

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const ICONS: Record<string, string> = { dog: '🐶', cat: '🐱', mouse: '🐭', hamster: '🐹', rabbit: '🐰', fox: '🦊', bear: '🐻', panda: '🐼' }

export default function GameMemory() {
  const { user, profile, refreshProfile } = useAuth()
  const [cards, setCards] = useState<string[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const init = () => {
    const keys = EMOJIS.slice(0, PAIRS).flatMap((e) => [e, e])
    setCards(shuffle(keys))
    setFlipped([])
    setMatched([])
    setMoves(0)
    setGameOver(false)
  }

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    if (matched.length === PAIRS * 2 && cards.length) {
      setGameOver(true)
      const pts = Math.max(100 - moves * 2, 10)
      if (user && profile) {
        saveGameScore(user.uid, 'memory', pts, profile.displayName).then(refreshProfile)
      }
    }
  }, [matched, cards.length, moves, user, profile])

  const handleClick = (i: number) => {
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(i)) return
    const next = [...flipped, i]
    setFlipped(next)
    setMoves((m) => m + 1)
    if (next.length === 2) {
      if (cards[next[0]] === cards[next[1]]) {
        setMatched((m) => [...m, next[0], next[1]])
        setFlipped([])
      } else {
        setTimeout(() => setFlipped([]), 600)
      }
    }
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Memory Game</h1>
        <span className="game-score">Moves: {moves}</span>
      </div>
      <div className="game-board memory-board">
        {gameOver && (
          <div className="game-over-overlay">
            <h2>You Win!</h2>
            <p>Moves: {moves}</p>
            <button className="btn btn-primary" onClick={init}>Play Again</button>
          </div>
        )}
        <div className="memory-grid">
          {cards.map((c, i) => (
            <button
              key={i}
              className={'memory-card ' + (flipped.includes(i) || matched.includes(i) ? 'flipped' : '')}
              onClick={() => handleClick(i)}
              disabled={gameOver}
            >
              <span className="front">?</span>
              <span className="back">{ICONS[c] || c}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
