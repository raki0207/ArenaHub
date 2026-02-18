import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { saveGameScore } from "../services/scoreService"

export default function ReactionTest() {
  const { user, profile, refreshProfile } = useAuth()
  const [phase, setPhase] = useState<"idle" | "wait" | "click">("idle")
  const [result, setResult] = useState<number | null>(null)
  const [attempts, setAttempts] = useState(0)
  const startRef = useRef<number>(0)
  const timeoutRef = useRef<number>(0)

  const start = () => {
    setResult(null)
    setPhase("wait")
    const delay = 1500 + Math.random() * 2500
    timeoutRef.current = window.setTimeout(() => {
      setPhase("click")
      startRef.current = performance.now()
    }, delay)
  }

  const handleClick = () => {
    if (phase === "click") {
      clearTimeout(timeoutRef.current)
      setPhase("idle")
      const ms = Math.round(performance.now() - startRef.current)
      setResult(ms)
      setAttempts((a) => a + 1)
      const pts = Math.max(150 - Math.floor(ms / 10), 20)
      if (user && profile) {
        saveGameScore(user.uid, "reaction", pts, profile.displayName).then(refreshProfile)
      }
    } else if (phase === "wait") {
      clearTimeout(timeoutRef.current)
      setPhase("idle")
    }
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Reaction Test</h1>
        <span className="game-score">{result != null ? result + " ms" : "—"}</span>
      </div>
      <div
        className={"game-board reaction-board " + phase}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === " " && handleClick()}
      >
        {phase === "wait" && <p>Wait for green...</p>}
        {phase === "click" && <p>Click now!</p>}
        {result != null && <p className="result">{result} ms</p>}
        {(phase === "idle" || result != null) && (
          <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); start(); }}>{result != null ? "Try Again" : "Start"}</button>
        )}
      </div>
    </div>
  )
}
