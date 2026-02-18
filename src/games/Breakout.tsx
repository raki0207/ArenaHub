import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { saveGameScore } from '../services/scoreService'

const COLS = 8
const ROWS = 5
const PADDLE_W = 80
const BALL_R = 6
const BRICK_W = 60
const BRICK_H = 20

export default function Breakout() {
  const { user, profile, refreshProfile } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [running, setRunning] = useState(false)
  const gameRef = useRef<{ ball: { x: number; y: number; dx: number; dy: number }; paddle: number; bricks: boolean[][] } | null>(null)
  const scoreRef = useRef(0)

  const init = useCallback(() => {
    const bricks = Array(ROWS).fill(null).map(() => Array(COLS).fill(true))
    return {
      ball: { x: 300, y: 350, dx: 4, dy: -4 },
      paddle: 260,
      bricks,
    }
  }, [])

  const start = () => {
    gameRef.current = init()
    scoreRef.current = 0
    setScore(0)
    setLives(3)
    setGameOver(false)
    setRunning(true)
  }

  useEffect(() => {
    if (!running || gameOver || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    let anim: number

    const loop = () => {
      const g = gameRef.current!
      const { ball, paddle, bricks } = g

      ball.x += ball.dx
      ball.y += ball.dy

      if (ball.x - BALL_R <= 0 || ball.x + BALL_R >= 600) ball.dx *= -1
      if (ball.y - BALL_R <= 0) ball.dy *= -1

      if (ball.y + BALL_R >= 400 - 10 && ball.x >= paddle && ball.x <= paddle + PADDLE_W) {
        ball.dy *= -1
        setScore((s) => { scoreRef.current = s + 10; return s + 10 })
      }
      if (ball.y > 400) {
        setLives((l) => {
          if (l <= 1) {
            setGameOver(true)
            if (user && profile) saveGameScore(user.uid, 'breakout', scoreRef.current, profile.displayName).then(refreshProfile)
            return 0
          }
          ball.x = 300
          ball.y = 350
          ball.dy = 4
          return l - 1
        })
      }

      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++) {
          if (!bricks[r][c]) continue
          const bx = c * (BRICK_W + 4) + 20
          const by = r * (BRICK_H + 4) + 20
          if (ball.x + BALL_R >= bx && ball.x - BALL_R <= bx + BRICK_W && ball.y + BALL_R >= by && ball.y - BALL_R <= by + BRICK_H) {
            bricks[r][c] = false
            ball.dy *= -1
            setScore((s) => { scoreRef.current = s + 20; return s + 20 })
            if (bricks.every((row) => row.every((b) => !b))) {
              setGameOver(true)
              if (user && profile) saveGameScore(user.uid, 'breakout', scoreRef.current + 200, profile.displayName).then(refreshProfile)
            }
          }
        }

      ctx.fillStyle = '#0f0e17'
      ctx.fillRect(0, 0, 600, 400)
      ctx.fillStyle = '#00d9ff'
      ctx.fillRect(paddle, 390, PADDLE_W, 10)
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
      ctx.fill()
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++) {
          if (bricks[r][c]) {
            ctx.fillStyle = '#ff2e97'
            ctx.fillRect(c * (BRICK_W + 4) + 20, r * (BRICK_H + 4) + 20, BRICK_W, BRICK_H)
          }
        }
      anim = requestAnimationFrame(loop)
    }
    anim = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(anim)
  }, [running, gameOver, init, user, profile])

  useEffect(() => {
    if (!canvasRef.current || !running) return
    const updatePaddle = (clientX: number) => {
      const rect = canvasRef.current!.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width) * 600
      if (gameRef.current) gameRef.current.paddle = Math.max(0, Math.min(520, x - PADDLE_W / 2))
    }
    const handleMove = (e: MouseEvent) => updatePaddle(e.clientX)
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length) {
        e.preventDefault()
        updatePaddle(e.touches[0].clientX)
      }
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleTouch, { passive: false })
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleTouch)
    }
  }, [running])

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Breakout</h1>
        <span className="game-score">Score: {score} | Lives: {lives}</span>
      </div>
      <div className="game-board breakout-board">
        {!running ? (
          <div className="game-start" onClick={start}>Click to Start</div>
        ) : (
          <>
            <canvas ref={canvasRef} width={600} height={400} />
            {gameOver && (
              <div className="game-over-overlay">
                <h2>Game Over</h2>
                <p>Score: {score}</p>
                <button className="btn btn-primary" onClick={start}>Play Again</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
