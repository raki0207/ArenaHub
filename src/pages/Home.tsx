import { Link } from 'react-router-dom'

const featuredGames = [
  { id: 'snake', name: 'Snake', desc: 'Classic snake game', path: '/games/snake', image: '/Snake.jpg' },
  { id: '2048', name: '2048', desc: 'Merge tiles', path: '/games/2048' , image: '/2048.png'},
  { id: 'breakout', name: 'Breakout', desc: 'Break bricks', path: '/games/breakout' , image: '/breakout.png'},
  { id: 'whack', name: 'Whack-a-Mole', desc: 'Hit the moles', path: '/games/whack' , image: '/whack-a-mole.jpg'},
  { id: 'simon', name: 'Simon Says', desc: 'Memory sequence', path: '/games/simon' , image: '/simon.jpg'},
  { id: 'hangman', name: 'Hangman', desc: 'Guess the word', path: '/games/hangman' , image: '/hungman.webp'},
  { id: 'reaction', name: 'Reaction Test', desc: 'Click when green', path: '/games/reaction' , image: '/reaction.jpg'},
  { id: 'flappy', name: 'Flappy', desc: 'Tap to fly', path: '/games/flappy' , image: '/flappy.png'},
  { id: 'connect4', name: 'Connect Four', desc: 'Strategy game', path: '/games/connect4' , image: '/connect.png'},
  { id: 'mastermind', name: 'Mastermind', desc: 'Code breaker', path: '/games/mastermind' , image: '/mastermind.png'},
]

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero-title">Welcome to ArenaHub</h1>
        <p className="hero-subtitle">Play. Compete. Dominate.</p>
        <p className="hero-desc">Your ultimate gaming hub with multiple browser games, global leaderboards, and achievements.</p>
        <div className="hero-actions">
          <Link to="/games" className="btn btn-primary btn-lg">Play Games</Link>
          <Link to="/leaderboard" className="btn btn-outline btn-lg">View Leaderboard</Link>
        </div>
      </section>

      <section className="featured">
        <h2>Featured Games</h2>
        <div className="game-cards">
          {featuredGames.map((g) => (
            <Link key={g.id} to={g.path} className="game-card">
              <div className="game-card-image">
                <img src={g.image || `/images/games/${g.id}.jpg`} alt={g.name} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.add('visible'); }} />
                <div className="game-card-placeholder" />
              </div>
              <div className="game-card-content">
                <h3>{g.name}</h3>
                <p>{g.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
