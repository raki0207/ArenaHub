import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { saveGameScore } from "../services/scoreService"

const WORDS = ["REACT", "GAMES", "LOGIC", "BRAIN", "PUZZLE", "ARENA", "CODING", "STRATEGY"]

function shuffle(s: string) {
  const a = s.split("")
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.join("")
}

export default function WordScramble() {
  const { user, profile, refreshProfile } = useAuth()
  const [word] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)])
  const [scrambled] = useState(() => shuffle(word))
  const [guess, setGuess] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [solved, setSolved] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setAttempts((a) => a + 1)
    if (guess.toUpperCase().trim() === word) {
      setSolved(true)
      const pts = Math.max(100 - attempts * 10, 30)
      if (user && profile) saveGameScore(user.uid, "wordscramble", pts, profile.displayName).then(refreshProfile)
    }
  }

  const reset = () => window.location.reload()

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Word Scramble</h1>
        <span className="game-score">Attempts: {attempts}</span>
      </div>
      <div className="game-board wordscramble-board">
        <p className="scramble-word">{scrambled}</p>
        <form onSubmit={submit}>
          <input type="text" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Unscramble..." disabled={solved} />
          <button type="submit" className="btn btn-primary" disabled={solved}>Guess</button>
        </form>
        {solved && <><p>Correct!</p><button className="btn btn-outline" onClick={reset}>New Word</button></>}
      </div>
    </div>
  )
}
