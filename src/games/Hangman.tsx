import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { saveGameScore } from "../services/scoreService"

const WORDS = ["REACT", "GAMING", "ARENAHUB", "PYTHON", "JAVASCRIPT", "FIREBASE", "BROWSER", "KEYBOARD"]

export default function Hangman() {
  const { user, profile, refreshProfile } = useAuth()
  const [word, setWord] = useState("")
  const [guessed, setGuessed] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const start = () => {
    setWord(WORDS[Math.floor(Math.random() * WORDS.length)])
    setGuessed(new Set())
    setWrong(0)
    setGameOver(false)
  }

  useEffect(() => { start() }, [])

  const guess = (letter: string) => {
    if (gameOver || guessed.has(letter)) return
    setGuessed((g) => new Set([...g, letter]))
    if (!word.includes(letter)) setWrong((w) => w + 1)
  }

  const display = word ? word.split("").map((c) => guessed.has(c) ? c : "_").join(" ") : ""

  useEffect(() => {
    if (!word) return
    const won = word.split("").every((c) => guessed.has(c))
    if (won) {
      setGameOver(true)
      const pts = Math.max(100 - wrong * 10, 20)
      if (user && profile) saveGameScore(user.uid, "hangman", pts, profile.displayName).then(refreshProfile)
    } else if (wrong >= 6) {
      setGameOver(true)
    }
  }, [word, guessed, wrong, user, profile])

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Hangman</h1>
        <span className="game-score">Wrong: {wrong}/6</span>
      </div>
      <div className="game-board hangman-board">
        <p className="hangman-word">{display}</p>
        <div className="hangman-letters">
          {alphabet.map((l) => (
            <button key={l} className="hangman-letter" onClick={() => guess(l)} disabled={guessed.has(l) || gameOver}>
              {l}
            </button>
          ))}
        </div>
        {gameOver && (
          <div className="hangman-end">
            <p>{wrong >= 6 ? "Game Over! Word: " + word : "You Win!"}</p>
            <button className="btn btn-primary" onClick={start}>Play Again</button>
          </div>
        )}
      </div>
    </div>
  )
}
