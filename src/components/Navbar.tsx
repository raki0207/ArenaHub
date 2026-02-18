import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <span className="brand-icon">⚔</span>
        ArenaHub
      </Link>
      <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
      <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
        <li><Link to="/games" onClick={() => setMenuOpen(false)}>Games</Link></li>
        <li><Link to="/leaderboard" onClick={() => setMenuOpen(false)}>Leaderboard</Link></li>
        {user ? (
          <>
            <li><Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link></li>
            <li className="nav-user">
              <span className="points-badge">{profile?.totalPoints ?? 0} pts</span>
              <button onClick={() => signOut()} className="btn btn-outline">Logout</button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
            <li><Link to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Register</Link></li>
          </>
        )}
      </ul>
      {menuOpen && <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />}
    </nav>
  )
}
