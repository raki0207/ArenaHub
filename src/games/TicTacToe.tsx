import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { saveGameScore } from "../services/scoreService"

type Cell = "X" | "O" | null

function checkWinner(board: Cell[]): Cell {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ]
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]
  }
  return null
}

export default function GameTicTacToe() {
  const { user, profile, refreshProfile } = useAuth()
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [xTurn, setXTurn] = useState(true)
  const [gameOver, setGameOver] = useState(false)

  const handleClick = (i: number) => {
    if (board[i] || gameOver) return
    const newBoard = [...board]
    newBoard[i] = xTurn ? "X" : "O"
    setBoard(newBoard)
    setXTurn(!xTurn)
    const winner = checkWinner(newBoard)
    if (winner) {
      setGameOver(true)
      if (winner === "X" && user && profile) {
        saveGameScore(user.uid, "tictactoe", 50, profile.displayName).then(refreshProfile)
      }
    } else if (newBoard.every(Boolean)) {
      setGameOver(true)
      if (user && profile) {
        saveGameScore(user.uid, "tictactoe", 10, profile.displayName).then(refreshProfile)
      }
    }
  }

  const reset = () => {
    setBoard(Array(9).fill(null))
    setXTurn(true)
    setGameOver(false)
  }

  const winner = checkWinner(board)
  const draw = board.every(Boolean) && !winner

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Tic Tac Toe</h1>
      </div>
      <div className="game-board ttt-board">
        <div className="ttt-grid">
          {board.map((cell, i) => (
            <button key={i} className="ttt-cell" onClick={() => handleClick(i)} disabled={!!cell || gameOver}>
              {cell}
            </button>
          ))}
        </div>
        {(winner || draw) && (
          <div className="ttt-result">
            <p>{winner ? winner + " wins!" : "Draw!"}</p>
            <button className="btn btn-primary" onClick={reset}>Play Again</button>
          </div>
        )}
      </div>
    </div>
  )
}
