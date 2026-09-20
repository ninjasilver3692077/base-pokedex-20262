import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/starter', label: 'Starter' },
  { to: '/map', label: 'World Map' },
  { to: '/pokedex', label: 'Pokédex' },
]

function NavBar() {
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
    </nav>
  )
}

export default NavBar
