import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { saveGameScore } from "../services/scoreService"

const TOTAL = 21

export default function Nim() {
  const { user, profile, refreshProfile } = useAuth()
  const [stones, setStones] = useState(TOTAL)
  const [playerTurn, setPlayerTurn] = useState(true)
  const [gameOver, setGameOver] = useState(false)

  const take = (n: number) => {
    if (gameOver || !playerTurn || stones < n) return
    const next = stones - n
    if (next <= 0) {
      setStones(0)
      setGameOver(true)
    } else {
      setStones(next)
      setPlayerTurn(false)
      setTimeout(() => aiTurn(next), 400)
    }
  }

  const aiTurn = (remain: number) => {
    const move = (remain - 1) % 4
    const takeCount = move === 0 ? Math.min(3, Math.floor(Math.random() * 3) + 1) : move
    const next = remain - takeCount
    if (next <= 0) {
      setStones(0)
      setGameOver(true)
      if (user && profile) saveGameScore(user.uid, "nim", 80, profile.displayName).then(refreshProfile)
    } else {
      setStones(next)
      setPlayerTurn(true)
    }
  }

  const reset = () => {
    setStones(TOTAL)
    setPlayerTurn(true)
    setGameOver(false)
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Nim</h1>
        <span className="game-score">{stones} stones left</span>
      </div>
      <div className="game-board nim-board">
        <p>Take 1-3 stones. Last to take loses.</p>
        <div className="nim-stones">{Array(stones).fill(0).map((_, i) => <span key={i} className="nim-stone">●</span>)}</div>
        {!gameOver && playerTurn && (
          <div className="nim-buttons">
            {[1, 2, 3].map((n) => (
              <button key={n} className="btn btn-outline" onClick={() => take(n)} disabled={stones < n}>Take {n}</button>
            ))}
          </div>
        )}
        {gameOver && <><p>{playerTurn ? "AI wins" : "You win!"}</p><button className="btn btn-primary" onClick={reset}>Play Again</button></>}
      </div>
    </div>
  )
}
