import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Games from './pages/Games'
import GameSnake from './games/Snake'
import GameTicTacToe from './games/TicTacToe'
import GameMemory from './games/Memory'
import GamePuzzle from './games/Puzzle'
import Game2048 from './games/Game2048'
import RockPaperScissors from './games/RockPaperScissors'
import Hangman from './games/Hangman'
import Breakout from './games/Breakout'
import SimonSays from './games/SimonSays'
import WhackAMole from './games/WhackAMole'
import ReactionTest from './games/ReactionTest'
import NumberGuess from './games/NumberGuess'
import DiceRoll from './games/DiceRoll'
import ColorMatch from './games/ColorMatch'
import Trivia from './games/Trivia'
import Flappy from './games/Flappy'
import ConnectFour from './games/ConnectFour'
import Mastermind from './games/Mastermind'
import WordScramble from './games/WordScramble'
import Nim from './games/Nim'
import Minesweeper from './games/Minesweeper'
import MathChallenge from './games/MathChallenge'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuth } from './contexts/AuthContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="games" element={<Games />} />
        <Route path="games/snake" element={<GameSnake />} />
        <Route path="games/tictactoe" element={<GameTicTacToe />} />
        <Route path="games/memory" element={<GameMemory />} />
        <Route path="games/puzzle" element={<GamePuzzle />} />
        <Route path="games/2048" element={<Game2048 />} />
        <Route path="games/rps" element={<RockPaperScissors />} />
        <Route path="games/hangman" element={<Hangman />} />
        <Route path="games/breakout" element={<Breakout />} />
        <Route path="games/simon" element={<SimonSays />} />
        <Route path="games/whack" element={<WhackAMole />} />
        <Route path="games/reaction" element={<ReactionTest />} />
        <Route path="games/numberguess" element={<NumberGuess />} />
        <Route path="games/dice" element={<DiceRoll />} />
        <Route path="games/colormatch" element={<ColorMatch />} />
        <Route path="games/trivia" element={<Trivia />} />
        <Route path="games/flappy" element={<Flappy />} />
        <Route path="games/connect4" element={<ConnectFour />} />
        <Route path="games/mastermind" element={<Mastermind />} />
        <Route path="games/wordscramble" element={<WordScramble />} />
        <Route path="games/nim" element={<Nim />} />
        <Route path="games/minesweeper" element={<Minesweeper />} />
        <Route path="games/mathchallenge" element={<MathChallenge />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}
