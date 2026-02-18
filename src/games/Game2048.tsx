import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { saveGameScore } from '../services/scoreService'

const SIZE = 4

function initBoard() {
  const board: number[][] = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0))
  addRandom(board)
  addRandom(board)
  return board
}

function addRandom(board: number[][]) {
  const empty: [number, number][] = []
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (board[r][c] === 0) empty.push([r, c])
  if (empty.length) {
    const [r, c] = empty[Math.floor(Math.random() * empty.length)]
    board[r][c] = Math.random() < 0.9 ? 2 : 4
  }
}

function mergeLine(line: number[]) {
  const f = line.filter((x) => x > 0)
  const out: number[] = []
  let score = 0
  for (let i = 0; i < f.length; i++) {
    if (i < f.length - 1 && f[i] === f[i + 1]) {
      out.push(f[i] * 2)
      score += f[i] * 2
      i++
    } else out.push(f[i])
  }
  while (out.length < SIZE) out.push(0)
  return [out, score] as const
}

function moveDir(board: number[][], dir: string): [number[][], number] {
  const next = board.map((r) => [...r])
  let total = 0
  if (dir === 'left') {
    for (let r = 0; r < SIZE; r++) {
      const [line, s] = mergeLine(next[r])
      next[r] = line
      total += s
    }
  } else if (dir === 'right') {
    for (let r = 0; r < SIZE; r++) {
      const [line, s] = mergeLine([...next[r]].reverse())
      next[r] = line.reverse()
      total += s
    }
  } else if (dir === 'up') {
    for (let c = 0; c < SIZE; c++) {
      const col = next.map((r) => r[c])
      const [line, s] = mergeLine(col)
      for (let r = 0; r < SIZE; r++) next[r][c] = line[r]
      total += s
    }
  } else {
    for (let c = 0; c < SIZE; c++) {
      const col = next.map((r) => r[c]).reverse()
      const [line, s] = mergeLine(col)
      for (let r = 0; r < SIZE; r++) next[r][c] = line[SIZE - 1 - r]
      total += s
    }
  }
  return [next, total]
}

export default function Game2048() {
  const { user, profile, refreshProfile } = useAuth()
  const [board, setBoard] = useState(initBoard)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const reset = useCallback(() => {
    setBoard(initBoard())
    setScore(0)
    setGameOver(false)
  }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (gameOver) return
      const d: Record<string, string> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }
      const dir = d[e.key]
      if (!dir) return
      e.preventDefault()
      setBoard((b) => {
        const [next, gained] = moveDir(b, dir)
        if (gained > 0) setScore((s) => s + gained)
        if (JSON.stringify(b) !== JSON.stringify(next)) addRandom(next)
        return next
      })
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [gameOver])

  useEffect(() => {
    if (gameOver) return
    let ok = false
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === 0) ok = true
        if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) ok = true
        if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) ok = true
      }
    if (!ok) {
      setGameOver(true)
      if (user && profile) saveGameScore(user.uid, '2048', score, profile.displayName).then(refreshProfile)
    }
  }, [board, gameOver, score, user, profile])

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>2048</h1>
        <span className="game-score">Score: {score}</span>
      </div>
      <div className="game-board game-2048-board">
        <div className="grid-2048">
          {board.flat().map((v, i) => (
            <div key={i} className={'tile-2048 tile-' + (v || 'empty')}>{v || ''}</div>
          ))}
        </div>
        {gameOver && (
          <div className="game-over-overlay">
            <h2>Game Over</h2>
            <p>Score: {score}</p>
            <button className="btn btn-primary" onClick={reset}>Play Again</button>
          </div>
        )}
      </div>
    </div>
  )
}
