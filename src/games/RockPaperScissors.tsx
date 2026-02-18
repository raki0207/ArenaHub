import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { saveGameScore } from "../services/scoreService"

const CHOICES = ["rock", "paper", "scissors"]

export default function RockPaperScissors() {
  const { user, profile, refreshProfile } = useAuth()
  const [playerChoice, setPlayerChoice] = useState<string | null>(null)
  const [aiChoice, setAiChoice] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [wins, setWins] = useState(0)

  const play = (choice: string) => {
    const ai = CHOICES[Math.floor(Math.random() * 3)]
    let res = "draw"
    if (choice !== ai) {
      if ((choice === "rock" && ai === "scissors") || (choice === "paper" && ai === "rock") || (choice === "scissors" && ai === "paper")) {
        res = "win"
      } else res = "lose"
    }
    setPlayerChoice(choice)
    setAiChoice(ai)
    setResult(res)
    if (res === "win") setWins((w) => w + 1)
  }

  const save = () => {
    if (user && profile && wins > 0) {
      saveGameScore(user.uid, "rps", Math.min(wins * 10, 100), profile.displayName).then(refreshProfile)
    }
    setPlayerChoice(null)
    setAiChoice(null)
    setResult(null)
    setWins(0)
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Rock Paper Scissors</h1>
        <span className="game-score">Wins: {wins}</span>
      </div>
      <div className="game-board rps-board">
        {result && (
          <div className="rps-result">
            <p>You: {playerChoice} vs AI: {aiChoice}</p>
            <p className={result}>{result.toUpperCase()}!</p>
          </div>
        )}
        <div className="rps-choices">
          {CHOICES.map((c) => (
            <button key={c} className="rps-btn" onClick={() => play(c)}>{c}</button>
          ))}
        </div>
        <button className="btn btn-outline" onClick={save}>End Round and Save</button>
      </div>
    </div>
  )
}
