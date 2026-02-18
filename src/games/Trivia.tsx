import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { saveGameScore } from "../services/scoreService"

const QS = [
  { q: "What is 2 + 2?", a: 4, opts: [3, 4, 5, 6] },
  { q: "Capital of France?", a: "Paris", opts: ["London", "Paris", "Berlin", "Madrid"] },
  { q: "How many continents?", a: 7, opts: [5, 6, 7, 8] },
  { q: "Largest planet?", a: "Jupiter", opts: ["Mars", "Jupiter", "Saturn", "Earth"] },
  { q: "2 x 8 = ?", a: 16, opts: [14, 16, 18, 20] },
]

export default function Trivia() {
  const { user, profile, refreshProfile } = useAuth()
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [qs, setQs] = useState<typeof QS>([])

  const start = () => {
    setQs([...QS].sort(() => Math.random() - 0.5))
    setIdx(0)
    setScore(0)
  }

  const pick = (opt: string | number) => {
    const q = qs[idx]
    const add = opt === q.a ? 20 : 0
    setScore((s) => s + add)
    setIdx((i) => {
      if (i >= qs.length - 1 && user && profile) {
        saveGameScore(user.uid, "trivia", score + add, profile.displayName).then(refreshProfile)
      }
      return i + 1
    })
  }

  if (qs.length === 0) {
    return (
      <div className="game-container">
        <div className="game-header">
          <Link to="/games" className="btn btn-outline">Back</Link>
          <h1>Trivia</h1>
        </div>
        <div className="game-board"><div className="game-start" onClick={start}>Start Quiz</div></div>
      </div>
    )
  }

  const done = idx >= qs.length
  const q = qs[idx]

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Trivia</h1>
        <span className="game-score">Score: {score}</span>
      </div>
      <div className="game-board trivia-board">
        {done ? (
          <div><p>Final: {score}</p><button className="btn btn-primary" onClick={start}>Again</button></div>
        ) : q ? (
          <div>
            <p className="trivia-q">{q.q}</p>
            <div className="trivia-opts">
              {q.opts.map((o) => <button key={String(o)} className="btn btn-outline trivia-opt" onClick={() => pick(o)}>{String(o)}</button>)}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
