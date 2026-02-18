import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { saveGameScore } from "../services/scoreService"

const COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#1abc9c"]

function getFeedback(guess: number[], secret: number[]) {
  let black = 0
  const gCnt = [0, 0, 0, 0, 0, 0]
  const sCnt = [0, 0, 0, 0, 0, 0]
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) black++
    else { gCnt[guess[i]]++; sCnt[secret[i]]++ }
  }
  let white = 0
  for (let i = 0; i < 6; i++) white += Math.min(gCnt[i], sCnt[i])
  return { black, white }
}

export default function Mastermind() {
  const { user, profile, refreshProfile } = useAuth()
  const [secret] = useState(() => [0, 1, 2, 3].map(() => Math.floor(Math.random() * 6)))
  const [guesses, setGuesses] = useState<{ code: number[]; black: number; white: number }[]>([])
  const [current, setCurrent] = useState([0, 0, 0, 0])
  const [slot, setSlot] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  const submit = () => {
    if (slot !== 4 || gameOver) return
    const fb = getFeedback(current, secret)
    const next = [...guesses, { code: [...current], black: fb.black, white: fb.white }]
    setGuesses(next)
    if (fb.black === 4) {
      setWon(true)
      setGameOver(true)
      const pts = Math.max(150 - next.length * 15, 40)
      if (user && profile) saveGameScore(user.uid, "mastermind", pts, profile.displayName).then(refreshProfile)
    } else if (next.length >= 10) setGameOver(true)
    setCurrent([0, 0, 0, 0])
    setSlot(0)
  }

  const pick = (i: number) => {
    if (gameOver) return
    const next = [...current]
    next[slot] = i
    setCurrent(next)
    setSlot(Math.min(slot + 1, 4))
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Mastermind</h1>
        <span className="game-score">Guess {guesses.length + 1}/10</span>
      </div>
      <div className="game-board mastermind-board">
        <p>Guess the 4-color code. B = right pos, W = right color.</p>
        <div className="mastermind-current">
          {current.map((c, i) => <button key={i} className="mastermind-peg" style={{ background: COLORS[c] }} onClick={() => setSlot(i)} />)}
        </div>
        <div className="mastermind-palette">
          {COLORS.map((c, i) => <button key={i} className="mastermind-peg" style={{ background: c }} onClick={() => pick(i)} disabled={gameOver} />)}
        </div>
        <button className="btn btn-primary" onClick={submit} disabled={slot !== 4 || gameOver}>Submit</button>
        <div className="mastermind-history">
          {guesses.map((g, i) => (
            <div key={i} className="mastermind-row">
              {g.code.map((c, j) => <span key={j} className="mastermind-peg small" style={{ background: COLORS[c] }} />)}
              <span>B:{g.black} W:{g.white}</span>
            </div>
          ))}
        </div>
        {gameOver && <button className="btn btn-outline" onClick={() => window.location.reload()}>New Game</button>}
      </div>
    </div>
  )
}
