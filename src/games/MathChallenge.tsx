import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { saveGameScore } from "../services/scoreService"

const OPS = ["+", "-", "×"]
const MAX = 20

function genProblem() {
  const a = Math.floor(Math.random() * MAX) + 1
  const b = Math.floor(Math.random() * MAX) + 1
  const op = OPS[Math.floor(Math.random() * 3)]
  let ans = 0
  if (op === "+") ans = a + b
  else if (op === "-") ans = Math.max(0, a - b)
  else ans = a * b
  return { a, b, op, ans }
}

export default function MathChallenge() {
  const { user, profile, refreshProfile } = useAuth()
  const [problem, setProblem] = useState(() => genProblem())
  const [score, setScore] = useState(0)
  const [input, setInput] = useState("")
  const [round, setRound] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = parseInt(input, 10)
    if (isNaN(n)) return
    const correct = n === problem.ans
    if (correct) setScore((s) => s + 10)
    setInput("")
    setRound((r) => {
      if (r >= 9) {
        setGameOver(true)
        if (user && profile) saveGameScore(user.uid, "mathchallenge", score + (correct ? 10 : 0), profile.displayName).then(refreshProfile)
      } else setProblem(genProblem())
      return r + 1
    })
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Math Challenge</h1>
        <span className="game-score">Score: {score} | {10 - round} left</span>
      </div>
      <div className="game-board mathchallenge-board">
        {!gameOver ? (
          <>
            <p className="math-problem">{problem.a} {problem.op} {problem.b} = ?</p>
            <form onSubmit={submit}>
              <input type="number" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Answer" autoFocus />
              <button type="submit" className="btn btn-primary">Submit</button>
            </form>
          </>
        ) : (
          <div>
            <p>Final Score: {score}</p>
            <button className="btn btn-primary" onClick={() => { setScore(0); setRound(0); setGameOver(false); setProblem(genProblem()); }}>Play Again</button>
          </div>
        )}
      </div>
    </div>
  )
}
