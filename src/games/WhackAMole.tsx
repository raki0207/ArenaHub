import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { saveGameScore } from '../services/scoreService'

export default function WhackAMole() {
  const { user, profile, refreshProfile } = useAuth()
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [active, setActive] = useState(-1)
  const [running, setRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const timerRef = useRef<number | null>(null)
  const moleRef = useRef<number | null>(null)
  const activeRef = useRef(-1)
  const scoreRef = useRef(0)

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  const start = () => {
    scoreRef.current = 0
    setScore(0)
    setTimeLeft(30)
    setActive(-1)
    setRunning(true)
    setGameOver(false)
  }

  useEffect(() => {
    if (!running || gameOver) return
    const tick = () => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameOver(true)
          if (user && profile) saveGameScore(user.uid, 'whack', scoreRef.current, profile.displayName).then(refreshProfile)
          return 0
        }
        return t - 1
      })
    }
    timerRef.current = window.setInterval(tick, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [running, gameOver])

  useEffect(() => {
    if (!running || gameOver) return
    const showMole = () => {
      setActive(Math.floor(Math.random() * 9))
      moleRef.current = window.setTimeout(() => {
        setActive(-1)
        activeRef.current = -1
        moleRef.current = window.setTimeout(showMole, 400 + Math.random() * 600)
      }, 800 + Math.random() * 600)
    }
    moleRef.current = window.setTimeout(showMole, 500)
    return () => { if (moleRef.current) clearTimeout(moleRef.current) }
  }, [running, gameOver])

  const whack = (i: number) => {
    if (i === activeRef.current && activeRef.current >= 0) {
      setScore((s) => s + 10)
      setActive(-1)
      activeRef.current = -1
    }
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Whack-a-Mole</h1>
        <span className="game-score">Score: {score} | Time: {timeLeft}s</span>
      </div>
      <div className="game-board whack-board">
        {!running ? (
          <div className="game-start" onClick={start}>Click to Start</div>
        ) : (
          <>
            <div className="whack-grid">
              {Array(9).fill(0).map((_, i) => (
                <button key={i} className={'whack-hole' + (i === active ? ' mole' : '')} onClick={() => whack(i)} />
              ))}
            </div>
            {gameOver && (
              <div className="game-over-overlay">
                <h2>Time Up!</h2>
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
