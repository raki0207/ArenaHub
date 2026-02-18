import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { saveGameScore } from "../services/scoreService"

export default function NumberGuess() {
  const { user, profile, refreshProfile } = useAuth()
  const [target, setTarget] = useState(0)
  const [guess, setGuess] = useState("")
  const [hint, setHint] = useState("")
  const [guesses, setGuesses] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const start = () => {
    setTarget(Math.floor(Math.random() * 100) + 1)
    setGuess("")
    setHint("Guess 1-100!")
    setGuesses(0)
    setGameOver(false)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = parseInt(guess, 10)
    if (isNaN(n) || n < 1 || n > 100) {
      setHint("Enter 1-100")
      return
    }
    const newGuesses = guesses + 1
    setGuesses(newGuesses)
    if (n === target) {
      setHint("Correct!")
      setGameOver(true)
      const pts = Math.max(150 - newGuesses * 15, 30)
      if (user && profile) saveGameScore(user.uid, "numberguess", pts, profile.displayName).then(refreshProfile)
    } else {
      setHint(n < target ? "Higher!" : "Lower!")
    }
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Number Guess</h1>
        <span className="game-score">Guesses: {guesses}</span>
      </div>
      <div className="game-board numberguess-board">
        {target === 0 ? (
          <div className="game-start" onClick={start}>Click to Start</div>
        ) : (
          <div className="numberguess-form">
            <p className="hint">{hint}</p>
            <form onSubmit={submit}>
              <input type="number" min={1} max={100} value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="1-100" disabled={gameOver} />
              <button type="submit" className="btn btn-primary" disabled={gameOver}>Guess</button>
            </form>
            {gameOver && <button className="btn btn-outline" onClick={start}>Play Again</button>}
          </div>
        )}
      </div>
    </div>
  )
}
