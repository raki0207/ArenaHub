import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { saveGameScore } from "../services/scoreService"

const COLORS = ["red", "green", "blue", "yellow"]

export default function SimonSays() {
  const { user, profile, refreshProfile } = useAuth()
  const [sequence, setSequence] = useState<number[]>([])
  const [playerInput, setPlayerInput] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const flashRef = useRef<number | null>(null)

  const start = () => {
    setSequence([Math.floor(Math.random() * 4)])
    setPlayerInput([])
    setScore(0)
    setPlaying(false)
    setGameOver(false)
  }

  const playSequence = (seq: number[], i: number) => {
    if (i >= seq.length) {
      setPlaying(true)
      return
    }
    const btn = document.querySelector("[data-simon=\"" + seq[i] + "\"]") as HTMLElement
    if (btn) {
      btn.classList.add("flash")
      flashRef.current = window.setTimeout(() => {
        btn.classList.remove("flash")
        if (flashRef.current) clearTimeout(flashRef.current)
        playSequence(seq, i + 1)
      }, 400)
    }
  }

  useEffect(() => {
    if (sequence.length > 0 && !playing && !gameOver) {
      const t = setTimeout(() => playSequence(sequence, 0), 500)
      return () => clearTimeout(t)
    }
  }, [sequence, gameOver])

  const tap = (i: number) => {
    if (!playing || gameOver) return
    const next = [...playerInput, i]
    setPlayerInput(next)
    if (next[next.length - 1] !== sequence[next.length - 1]) {
      setGameOver(true)
      if (user && profile) saveGameScore(user.uid, "simon", score * 10, profile.displayName).then(refreshProfile)
      return
    }
    if (next.length === sequence.length) {
      setScore((s) => s + 1)
      setSequence((s) => [...s, Math.floor(Math.random() * 4)])
      setPlayerInput([])
      setPlaying(false)
    }
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Simon Says</h1>
        <span className="game-score">Level: {score}</span>
      </div>
      <div className="game-board simon-board">
        {sequence.length === 0 ? (
          <div className="game-start" onClick={start}>Click to Start</div>
        ) : (
          <>
            <div className="simon-grid">
              {COLORS.map((c, i) => (
                <button key={c} data-simon={i} className={"simon-btn simon-" + c} onClick={() => tap(i)} disabled={!playing} />
              ))}
            </div>
            {gameOver && (
              <div className="game-over-overlay">
                <h2>Game Over</h2>
                <p>Level: {score}</p>
                <button className="btn btn-primary" onClick={start}>Play Again</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
