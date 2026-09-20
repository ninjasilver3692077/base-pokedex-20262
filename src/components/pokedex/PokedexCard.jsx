import { Link } from 'react-router-dom'
import { usePokemon } from '../../hooks/usePokemon.js'
import { capitalize } from '../../utils/text.js'

function PokedexCard({ entry }) {
  if (entry.status === 'undiscovered') {
    return (
      <div className="pokedex-card locked" aria-label="Pokémon sin descubrir">
        <div className="pokedex-card-sprite">
          <span className="placeholder">?</span>
        </div>
        <span className="pokedex-card-id">#{String(entry.id).padStart(3, '0')}</span>
        <span className="pokedex-card-name">???</span>
      </div>
    )
  }

  return <DiscoveredCard entry={entry} />
}

function DiscoveredCard({ entry }) {
  const { status, pokemon } = usePokemon(entry.id)
  const sprite = pokemon?.sprites?.front_default

  return (
    <Link to={`/pokedex/${entry.id}`} className={`pokedex-card ${entry.status}`}>
      <div className="pokedex-card-sprite">
        {status === 'ready' && sprite ? (
          <img src={sprite} alt={entry.name} loading="lazy" />
        ) : (
          <span className="placeholder">{status === 'error' ? '!' : '...'}</span>
        )}
      </div>
      <span className="pokedex-card-id">#{String(entry.id).padStart(3, '0')}</span>
      <span className="pokedex-card-name">{capitalize(entry.name)}</span>
      {entry.status === 'captured' && <span className="captured-badge">✓</span>}
    </Link>
  )
}

export default PokedexCard
