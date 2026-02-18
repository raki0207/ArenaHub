import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const withBase = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

const games = [
  { id: 'snake', name: 'Snake', desc: 'Eat food, grow longer. Classic arcade fun!', path: '/games/snake', image: '/Snake.jpg' },
  { id: 'tictactoe', name: 'Tic Tac Toe', desc: 'Beat the AI in this timeless strategy game.', path: '/games/tictactoe' , image: '/tic-tac-to.jpg'},
  { id: 'memory', name: 'Memory Game', desc: 'Find matching pairs. Test your memory!', path: '/games/memory' , image: '/memory-game.avif'},
  { id: 'puzzle', name: 'Slide Puzzle', desc: 'Slide tiles to solve the puzzle.', path: '/games/puzzle' , image: '/slider.png'},
  { id: '2048', name: '2048', desc: 'Merge tiles to reach 2048!', path: '/games/2048' , image: '/2048.png'},
  { id: 'rps', name: 'Rock Paper Scissors', desc: 'Classic hand game vs AI.', path: '/games/rps' , image: '/rock-paper-scissor.webp'},
  { id: 'hangman', name: 'Hangman', desc: 'Guess the word before you run out of lives.', path: '/games/hangman' , image: '/hungman.webp'},
  { id: 'breakout', name: 'Breakout', desc: 'Break all the bricks with the ball!', path: '/games/breakout' , image: '/breakout.png'},
  { id: 'simon', name: 'Simon Says', desc: 'Repeat the color sequence.', path: '/games/simon' , image: '/simon.jpg'},
  { id: 'whack', name: 'Whack-a-Mole', desc: 'Whack the moles before time runs out!', path: '/games/whack' , image: '/whack-a-mole.jpg'},
  { id: 'reaction', name: 'Reaction Test', desc: 'Click when the screen turns green!', path: '/games/reaction' , image: '/reaction.jpg'},
  { id: 'numberguess', name: 'Number Guess', desc: 'Guess the number 1-100.', path: '/games/numberguess' , image: '/number.jpg'},
  { id: 'dice', name: 'Dice Roll', desc: 'Roll 5 dice, 3 rounds. Highest total wins!', path: '/games/dice' , image: '/dice.jpg'},
  { id: 'colormatch', name: 'Color Match', desc: 'Click the matching color quickly!', path: '/games/colormatch' , image: '/color.png'},
  { id: 'trivia', name: 'Trivia', desc: 'Answer quiz questions for points.', path: '/games/trivia' , image: '/trivia.png'},
  { id: 'flappy', name: 'Flappy', desc: 'Tap to fly, avoid the pipes!', path: '/games/flappy' , image: '/flappy.png'},
  { id: 'connect4', name: 'Connect Four', desc: 'Get 4 in a row. Strategy vs AI!', path: '/games/connect4' , image: '/connect.png'},
  { id: 'mastermind', name: 'Mastermind', desc: 'Crack the 4-color code.', path: '/games/mastermind' , image: '/mastermind.png'},
  { id: 'wordscramble', name: 'Word Scramble', desc: 'Unscramble letters to form words.', path: '/games/wordscramble' , image: '/word-scramble.png'},
  { id: 'nim', name: 'Nim', desc: 'Take 1-3 stones. Last to take loses.', path: '/games/nim' , image: '/nim.png'},
  { id: 'minesweeper', name: 'Minesweeper', desc: 'Reveal cells, avoid mines.', path: '/games/minesweeper' , image: '/mindsweeper.png'},
  { id: 'mathchallenge', name: 'Math Challenge', desc: 'Solve arithmetic problems.', path: '/games/mathchallenge' , image: '/mathchallenge.png'},
]

export default function Games() {
  const { user } = useAuth()
  return (
    <div className="games-page">
      <h1 className="page-title">Games</h1>
      <p className="page-subtitle">Choose a game and start earning points!</p>
      {!user && (
        <div className="games-login-banner">
          <Link to="/login">Log in</Link> or <Link to="/register">register</Link> to save scores and climb the leaderboard!
        </div>
      )}
      <div className="game-grid">
        {games.map((g) => (
          <Link key={g.id} to={g.path} className="game-card-large">
            <div className="game-card-image">
              <img
                src={withBase(g.image || `/images/games/${g.id}.jpg`)}
                alt={g.name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.add('visible')
                }}
              />
              <div className="game-card-placeholder" />
            </div>
            <div className="game-card-content">
              <h3>{g.name}</h3>
              <p>{g.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
