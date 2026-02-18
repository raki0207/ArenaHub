import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { saveGameScore } from '../services/scoreService'

const GRID_SIZE = 20
const CELL_SIZE = 20

type Dir = 'up' | 'down' | 'left' | 'right'

export default function GameSnake() {
  const { user, profile, refreshProfile } = useAuth()
  const [snake, setSnake] = useState<[number, number][]>([[10, 10]])
  const [food, setFood] = useState<[number, number]>([15, 15])
  const [dir, setDir] = useState<Dir>('right')
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [running, setRunning] = useState(false)

  const genFood = useCallback(() => {
    let x = Math.floor(Math.random() * GRID_SIZE)
    let y = Math.floor(Math.random() * GRID_SIZE)
    return [x, y] as [number, number]
  }, [])

  const reset = useCallback(() => {
    setSnake([[10, 10]])
    setDir('right')
    setFood(genFood())
    setScore(0)
    setGameOver(false)
    setRunning(true)
  }, [genFood])

  useEffect(() => {
    if (!running || gameOver) return
    const interval = setInterval(() => {
      setSnake((s) => {
        const head = s[0]
        let nx = head[0]
        let ny = head[1]
        if (dir === 'up') ny--
        if (dir === 'down') ny++
        if (dir === 'left') nx--
        if (dir === 'right') nx++

        if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) {
          setGameOver(true)
          const finalScore = (s.length - 1) * 10
          if (user && profile) {
            saveGameScore(user.uid, 'snake', finalScore, profile.displayName).then(refreshProfile)
          }
          return s
        }
        if (s.some(([x, y]) => x === nx && y === ny)) {
          setGameOver(true)
          const finalScore = (s.length - 1) * 10
          if (user && profile) {
            saveGameScore(user.uid, 'snake', finalScore, profile.displayName).then(refreshProfile)
          }
          return s
        }

        const newSnake = [[nx, ny], ...s]
        if (nx === food[0] && ny === food[1]) {
          setScore((sc) => sc + 10)
          setFood(genFood())
          return newSnake
        }
        return newSnake.slice(0, -1)
      })
    }, 150)
    return () => clearInterval(interval)
  }, [dir, food, genFood, running, gameOver, user, profile])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && dir !== 'down') setDir('up')
      if (e.key === 'ArrowDown' && dir !== 'up') setDir('down')
      if (e.key === 'ArrowLeft' && dir !== 'right') setDir('left')
      if (e.key === 'ArrowRight' && dir !== 'left') setDir('right')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [dir])

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">← Back</Link>
        <h1>Snake</h1>
        <span className="game-score">Score: {score}</span>
      </div>
      <div className="game-board snake-board">
        {!running ? (
          <div className="game-start" onClick={reset}>
            Click to Start
          </div>
        ) : gameOver ? (
          <div className="game-over">
            <h2>Game Over</h2>
            <p>Score: {score}</p>
            <button className="btn btn-primary" onClick={reset}>Play Again</button>
          </div>
        ) : (
          <div
            className="snake-grid"
            style={{
              width: GRID_SIZE * CELL_SIZE,
              height: GRID_SIZE * CELL_SIZE,
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
              border: '2px solid var(--accent-cyan)',
              backgroundColor: 'var(--bg-dark)',
            }}
          >
            {snake.map(([x, y], i) => (
              <div key={i} className="snake-cell head" style={{ gridColumn: x + 1, gridRow: y + 1 }} />
            ))}
            <div className="food-cell" style={{ gridColumn: food[0] + 1, gridRow: food[1] + 1 }} />
          </div>
        )}
      </div>
    </div>
  )
}
