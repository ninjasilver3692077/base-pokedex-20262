import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { isMuted, toggleMute } from '../../audio/sounds.js'

const links = [
  { to: '/', label: 'Home' },
  { to: '/starter', label: 'Starter' },
  { to: '/map', label: 'World Map' },
  { to: '/pokedex', label: 'Pokédex' },
]

function NavBar() {
  const [muted, setMuted] = useState(isMuted)

  return (
    <nav className="nav-bar">
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          {label}
        </NavLink>
      ))}
      <button
        className="mute-btn"
        type="button"
        data-sfx="off"
        aria-pressed={muted}
        aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
        onClick={() => setMuted(toggleMute())}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </nav>
  )
}

export default NavBar
