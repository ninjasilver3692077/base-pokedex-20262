import { usePokemon } from '../../hooks/usePokemon.js'
import { capitalize } from '../../utils/text.js'

// Etiquetas cortas: la tarjeta es pequeña y la ficha completa ya muestra
// el estado con todas las letras.
const STATUS_LABELS = {
  captured: 'CAPTURADO',
  discovered: 'VISTO',
  undiscovered: 'SIN VER',
}

// Presentacional puro: quien lo use decide cómo se selecciona (la Pokédex
// lo envuelve en un <button> propio, ver Pokedex.jsx) en vez de navegar a
// una ruta — la Pokédex es un overlay, no una página.
function PokedexCard({ entry, isActive = false }) {
  const { status, pokemon } = usePokemon(entry.id)
  const sprite = pokemon?.sprites?.front_default

  return (
    <div
      className={`pokedex-card ${entry.status}${isActive ? ' is-active' : ''}`}
      aria-label={`${capitalize(entry.name)}, número ${entry.id}, ${isActive ? 'compañero equipado' : STATUS_LABELS[entry.status]}`}
    >
      <div className="pokedex-card-sprite">
        {status === 'ready' && sprite ? (
          <img src={sprite} alt={entry.name} loading="lazy" />
        ) : (
          <span className="placeholder">{status === 'error' ? '!' : '...'}</span>
        )}
      </div>
      <span className="pokedex-card-name">{capitalize(entry.name)}</span>
      <span className="pokedex-card-meta">
        #{String(entry.id).padStart(3, '0')} · {isActive ? '★ EQUIPPED' : STATUS_LABELS[entry.status]}
      </span>
    </div>
  )
}

export default PokedexCard
