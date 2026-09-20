import { Link } from 'react-router-dom'
import { ZONES } from '../../game/zones.js'
import { capitalize } from '../../utils/text.js'

function WorldMap() {
  return (
    <section className="screen pokedex-screen">
      <h1>Mapa del mundo</h1>
      <p>Elige una zona para explorarla y buscar Pokémon salvajes.</p>

      <div className="zone-grid">
        {ZONES.map((zone) => (
          <Link key={zone.id} to={`/explore/${zone.id}`} className="zone-card">
            <h2>{zone.name}</h2>
            <p>{zone.description}</p>
            <div className="type-badges">
              {zone.types.map((type) => (
                <span key={type} className={`type-badge type-${type}`}>{capitalize(type)}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <Link to="/pokedex">Ver Pokédex</Link>
    </section>
  )
}

export default WorldMap
