import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { saveGameScore } from "../services/scoreService"

const SIZE = 8
const MINES = 10

function initBoard() {
  const mines = new Set<number>()
  while (mines.size < MINES) mines.add(Math.floor(Math.random() * SIZE * SIZE))
  const board: { mine: boolean; revealed: boolean; flagged: boolean; count: number }[] = []
  for (let i = 0; i < SIZE * SIZE; i++) {
    board.push({ mine: mines.has(i), revealed: false, flagged: false, count: 0 })
  }
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const i = r * SIZE + c
      if (board[i].mine) continue
      let n = 0
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr * SIZE + nc].mine) n++
        }
      board[i].count = n
    }
  }
  return board
}

export default function Minesweeper() {
  const { user, profile, refreshProfile } = useAuth()
  const [board, setBoard] = useState(initBoard)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  const reveal = (i: number) => {
    if (gameOver || board[i].revealed || board[i].flagged) return
    const next = [...board]
    if (next[i].mine) {
      next.forEach((cell) => { cell.revealed = true })
      setBoard(next)
      setGameOver(true)
    } else {
      const flood = (idx: number) => {
        if (idx < 0 || idx >= SIZE * SIZE || next[idx].revealed || next[idx].mine) return
        next[idx].revealed = true
        if (next[idx].count === 0) {
          const r = Math.floor(idx / SIZE), c = idx % SIZE
          for (let dr = -1; dr <= 1; dr++)
            for (let dc = -1; dc <= 1; dc++) flood((r + dr) * SIZE + (c + dc))
        }
      }
      flood(i)
      setBoard(next)
      const revealed = next.filter((cell) => cell.revealed).length
      if (revealed === SIZE * SIZE - MINES) {
        setGameOver(true)
        setWon(true)
        if (user && profile) saveGameScore(user.uid, "minesweeper", 100, profile.displayName).then(refreshProfile)
      }
    }
  }

  const flag = (e: React.MouseEvent, i: number) => {
    e.preventDefault()
    if (gameOver || board[i].revealed) return
    const next = [...board]
    next[i].flagged = !next[i].flagged
    setBoard(next)
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <Link to="/games" className="btn btn-outline">Back</Link>
        <h1>Minesweeper</h1>
        <span className="game-score">{MINES} mines</span>
      </div>
      <div className="game-board minesweeper-board">
        <div className="minesweeper-grid" style={{ gridTemplateColumns: "repeat(8, 32px)" }}>
          {board.map((cell, i) => (
            <button key={i} className={"minesweeper-cell " + (cell.revealed ? "revealed" : "")} onClick={() => reveal(i)} onContextMenu={(e) => flag(e, i)}>
              {cell.flagged ? "F" : cell.revealed ? (cell.mine ? "X" : cell.count || "") : ""}
            </button>
          ))}
        </div>
        {gameOver && <><p>{won ? "You win!" : "Game Over"}</p><button className="btn btn-primary" onClick={() => { setBoard(initBoard()); setGameOver(false); setWon(false); }}>Play Again</button></>}
      </div>
    </div>
  )
}
