import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { saveGameScore } from "../services/scoreService"

export default function DiceRoll() {
  const { user, profile, refreshProfile } = useAuth()
  const [dice, setDice] = useState<number[]>([1, 1, 1, 1, 1])
  const [round, setRound] = useState(0)
  const [total, setTotal] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const roll = () => {
    const next = dice.map(() => Math.floor(Math.random() * 6) + 1)
    setDice(next)
    const sum = next.reduce((a, b) => a + b, 0)
    setTotal((t) => t + sum)
    const newTotal = total + sum
    setRound((r) => {
      if (r >= 2) {
        setGameOver(true)
        if (user && profile) saveGameScore(user.uid, "dice", newTotal, profile.displayName).then(refreshProfile)
      }
      return r + 1
    })
  }

  const start = () => {
    setDice([1, 1, 1, 1, 1])
    setRound(0)
    setTotal(0)
    setGameOver(false)
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Dice Roll</h1>
        <span className="game-score">Total: {total} | Round {round + 1}/3</span>
      </div>
      <div className="game-board dice-board">
        {round === 0 && total === 0 ? (
          <div className="game-start" onClick={roll}>Roll Dice</div>
        ) : (
          <>
            <div className="dice-row">
              {dice.map((d, i) => (
                <span key={i} className="dice-face">{d}</span>
              ))}
            </div>
            {!gameOver ? (
              <button className="btn btn-primary" onClick={roll}>Roll Again</button>
            ) : (
              <div>
                <p>Final Score: {total}</p>
                <button className="btn btn-primary" onClick={start}>Play Again</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
