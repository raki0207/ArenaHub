import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { saveGameScore } from "../services/scoreService"

const GRAVITY = 0.5
const FLAP = -8
const PIPE_W = 60
const PIPE_GAP = 120
const PIPE_SPEED = 3

export default function Flappy() {
  const { user, profile, refreshProfile } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [running, setRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const stateRef = useRef({ birdY: 200, birdVy: 0, pipes: [] as { x: number; top: number }[], scored: new Set<number>() })
  const scoreRef = useRef(0)

  const start = () => {
    stateRef.current = { birdY: 200, birdVy: 0, pipes: [{ x: 400, top: 100 + Math.random() * 150 }], scored: new Set() }
    scoreRef.current = 0
    setScore(0)
    setRunning(true)
    setGameOver(false)
  }

  useEffect(() => { scoreRef.current = score }, [score])

  useEffect(() => {
    if (!running || gameOver || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")!
    let anim: number

    const loop = () => {
      const s = stateRef.current
      s.birdVy += GRAVITY
      s.birdY += s.birdVy

      if (s.birdY > 400 || s.birdY < 0) {
        setGameOver(true)
        if (user && profile) saveGameScore(user.uid, "flappy", scoreRef.current, profile.displayName).then(refreshProfile)
        return
      }

      for (const p of s.pipes) {
        p.x -= PIPE_SPEED
        const bx = 80
        const by = s.birdY
        if (bx + 20 > p.x && bx - 20 < p.x + PIPE_W) {
          if (by - 15 < p.top || by + 15 > p.top + PIPE_GAP) {
            setGameOver(true)
            if (user && profile) saveGameScore(user.uid, "flappy", scoreRef.current, profile.displayName).then(refreshProfile)
            return
          }
        }
        if (p.x + PIPE_W < bx && !s.scored.has(p.x)) {
          s.scored.add(p.x)
          setScore((sc) => { scoreRef.current = sc + 10; return sc + 10 })
        }
      }
      s.pipes = s.pipes.filter((p) => p.x > -PIPE_W)
      if (s.pipes.length === 0 || s.pipes[s.pipes.length - 1].x < 250) {
        s.pipes.push({ x: 400, top: 80 + Math.random() * 180 })
      }

      ctx.fillStyle = "#87CEEB"
      ctx.fillRect(0, 0, 400, 400)
      ctx.fillStyle = "#2ecc71"
      ctx.fillRect(0, 350, 400, 50)
      ctx.fillStyle = "#f1c40f"
      ctx.beginPath()
      ctx.arc(80, s.birdY, 15, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = "#27ae60"
      for (const p of s.pipes) {
        ctx.fillRect(p.x, 0, PIPE_W, p.top)
        ctx.fillRect(p.x, p.top + PIPE_GAP, PIPE_W, 400 - p.top - PIPE_GAP)
      }
      anim = requestAnimationFrame(loop)
    }
    anim = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(anim)
  }, [running, gameOver, user, profile])

  const flap = () => {
    if (running && !gameOver) stateRef.current.birdVy = FLAP
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Flappy</h1>
        <span className="game-score">Score: {score}</span>
      </div>
      <div className="game-board flappy-board">
        {!running ? (
          <div className="game-start" onClick={start}>Tap to Start</div>
        ) : (
          <>
            <canvas ref={canvasRef} width={400} height={400} onClick={flap} onTouchStart={(e) => { e.preventDefault(); flap(); }} style={{ touchAction: "manipulation" }} />
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
