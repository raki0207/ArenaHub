import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { saveGameScore } from "../services/scoreService"

const ROWS = 6
const COLS = 7

function checkWin(board: (1 | 2 | null)[][]): 1 | 2 | null {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS - 3; c++) {
    const v = board[r][c]
    if (v && v === board[r][c + 1] && v === board[r][c + 2] && v === board[r][c + 3]) return v
  }
  for (let r = 0; r < ROWS - 3; r++) for (let c = 0; c < COLS; c++) {
    const v = board[r][c]
    if (v && v === board[r + 1][c] && v === board[r + 2][c] && v === board[r + 3][c]) return v
  }
  for (let r = 0; r < ROWS - 3; r++) for (let c = 0; c < COLS - 3; c++) {
    const v = board[r][c]
    if (v && v === board[r + 1][c + 1] && v === board[r + 2][c + 2] && v === board[r + 3][c + 3]) return v
  }
  for (let r = 3; r < ROWS; r++) for (let c = 0; c < COLS - 3; c++) {
    const v = board[r][c]
    if (v && v === board[r - 1][c + 1] && v === board[r - 2][c + 2] && v === board[r - 3][c + 3]) return v
  }
  return null
}

export default function ConnectFour() {
  const { user, profile, refreshProfile } = useAuth()
  const [board, setBoard] = useState<(1 | 2 | null)[][]>(() => Array(ROWS).fill(null).map(() => Array(COLS).fill(null)))
  const [playerTurn, setPlayerTurn] = useState(true)
  const [gameOver, setGameOver] = useState(false)

  const drop = (col: number) => {
    if (gameOver || !playerTurn) return
    const next = board.map((row) => [...row])
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!next[r][col]) {
        next[r][col] = 1
        break
      }
    }
    const win = checkWin(next)
    if (win) {
      setBoard(next)
      setGameOver(true)
      if (win === 1 && user && profile) saveGameScore(user.uid, "connect4", 80, profile.displayName).then(refreshProfile)
    } else if (next.every((row) => row.every((cell) => cell))) {
      setBoard(next)
      setGameOver(true)
      if (user && profile) saveGameScore(user.uid, "connect4", 20, profile.displayName).then(refreshProfile)
    } else {
      setBoard(next)
      setPlayerTurn(false)
      setTimeout(() => aiMove(next), 300)
    }
  }

  const aiMove = (current: (1 | 2 | null)[][]) => {
    const next = current.map((r) => [...r])
    const valid = []
    for (let c = 0; c < COLS; c++) if (!next[0][c]) valid.push(c)
    const col = valid[Math.floor(Math.random() * valid.length)]
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!next[r][col]) { next[r][col] = 2; break }
    }
    const win = checkWin(next)
    setBoard(next)
    if (win) setGameOver(true)
    else setPlayerTurn(true)
  }

  const reset = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)))
    setPlayerTurn(true)
    setGameOver(false)
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Connect Four</h1>
        <span className="game-score">{playerTurn ? "Your turn" : "AI thinking..."}</span>
      </div>
      <div className="game-board connect4-board">
        <div className="connect4-grid">
          {board.map((row, r) => row.map((cell, c) => (
            <button key={r + "," + c} className={"connect4-cell p" + (cell || 0)} onClick={() => drop(c)} disabled={gameOver || !playerTurn || !!board[0][c]} />
          )))}
        </div>
        {gameOver && <div><button className="btn btn-primary" onClick={reset}>Play Again</button></div>}
      </div>
    </div>
  )
}
