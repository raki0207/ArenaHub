import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { saveGameScore } from "../services/scoreService"

const COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f"]
const NAMES = ["Red", "Blue", "Green", "Yellow"]

export default function ColorMatch() {
  const { user, profile, refreshProfile } = useAuth()
  const [targetColor, setTargetColor] = useState("")
  const [targetName, setTargetName] = useState("")
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const nextRound = () => {
    const c = COLORS[Math.floor(Math.random() * 4)]
    const n = NAMES[Math.floor(Math.random() * 4)]
    setTargetColor(c)
    setTargetName(n)
  }

  const start = () => {
    setScore(0)
    setRound(0)
    setGameOver(false)
    nextRound()
  }

  const pick = (color: string) => {
    if (gameOver) return
    const correct = color === targetColor
    const add = correct ? 20 : 0
    setScore((s) => s + add)
    setRound((r) => {
      if (r >= 9) {
        setGameOver(true)
        if (user && profile) saveGameScore(user.uid, "colormatch", score + add, profile.displayName).then(refreshProfile)
      } else nextRound()
      return r + 1
    })
  }

  useEffect(() => { if (round === 0 && !targetColor) { nextRound(); } }, [])

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Color Match</h1>
        <span className="game-score">Score: {score}</span>
      </div>
      <div className="game-board colormatch-board">
        {targetColor && (
          <>
            <p>Click the color: <strong style={{ color: targetColor }}>{targetName}</strong></p>
            <div className="colormatch-buttons">
              {COLORS.map((c) => (
                <button key={c} className="colormatch-btn" style={{ background: c }} onClick={() => pick(c)} disabled={gameOver} />
              ))}
            </div>
            {gameOver && <button className="btn btn-primary" onClick={start}>Play Again</button>}
          </>
        )}
      </div>
    </div>
  )
}
