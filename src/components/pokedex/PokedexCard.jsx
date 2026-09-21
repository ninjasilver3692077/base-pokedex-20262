import { Link } from 'react-router-dom'
import { usePokemon } from '../../hooks/usePokemon.js'
import { capitalize } from '../../utils/text.js'

const STATUS_LABELS = {
  captured: 'CAPTURADO',
  discovered: 'DESCUBIERTO',
  undiscovered: 'NO DESCUBIERTO',
}

function PokedexCard({ entry }) {
  return <CatalogCard entry={entry} />
}

function CatalogCard({ entry }) {
  const { status, pokemon } = usePokemon(entry.id)
  const sprite = pokemon?.sprites?.front_default

  return (
    <Link to={`/pokedex/${entry.id}`} className={`pokedex-card ${entry.status}`} aria-label={`${capitalize(entry.name)}, número ${entry.id}, ${STATUS_LABELS[entry.status]}`}>
      <div className="pokedex-card-sprite">
        {status === 'ready' && sprite ? (
          <img className="sprite-idle" src={sprite} alt={entry.name} loading="lazy" />
        ) : (
          <span className="placeholder">{status === 'error' ? '!' : '...'}</span>
        )}
      </div>
      <span className="pokedex-card-id">#{String(entry.id).padStart(3, '0')}</span>
      <span className="pokedex-card-name">{capitalize(entry.name)}</span>
      <span className="pokedex-card-status">{STATUS_LABELS[entry.status]}</span>
      {entry.status === 'captured' && <span className="captured-badge" aria-hidden="true">✓</span>}
    </Link>
  )
}

export default PokedexCard
