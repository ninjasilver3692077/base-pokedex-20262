import { Link, useParams } from 'react-router-dom'
import { usePokemon } from '../../hooks/usePokemon.js'
import { useGame } from '../../context/GameContext.jsx'
import { capitalize } from '../../utils/text.js'

function PokemonDetails() {
  const { pokemonId } = useParams()
  const id = Number(pokemonId)
  const isValidId = Number.isInteger(id) && id > 0

  const { state } = useGame()
  const { discoveredPokemonIds, capturedPokemonIds } = state
  const isCaptured = capturedPokemonIds.includes(id)
  const isDiscovered = isCaptured || discoveredPokemonIds.includes(id)

  const { status, pokemon, error } = usePokemon(isValidId && isDiscovered ? id : null)

  if (!isValidId) {
    return (
      <section className="screen">
        <h1>Pokémon no válido</h1>
        <Link className="btn" to="/pokedex">Volver a la Pokédex</Link>
      </section>
    )
  }

  if (!isDiscovered) {
    return (
      <section className="screen">
        <h1>#{String(id).padStart(3, '0')} — ???</h1>
        <p>Todavía no has descubierto este Pokémon. Explora el mundo para encontrarlo.</p>
        <Link className="btn" to="/pokedex">Volver a la Pokédex</Link>
      </section>
    )
  }

  if (status === 'loading') {
    return (
      <section className="screen">
        <h1>Cargando...</h1>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="screen">
        <h1>Error</h1>
        <p>No se pudo cargar este Pokémon desde PokéAPI. {error?.message}</p>
        <Link className="btn" to="/pokedex">Volver a la Pokédex</Link>
      </section>
    )
  }

  const artwork = pokemon.sprites?.other?.['official-artwork']?.front_default ?? pokemon.sprites?.front_default

  return (
    <section className="screen pokemon-details">
      <Link to="/pokedex">&larr; Volver a la Pokédex</Link>
      <h1>
        #{String(pokemon.id).padStart(3, '0')} — {capitalize(pokemon.name)}
        {isCaptured && <span className="captured-badge">✓ Capturado</span>}
      </h1>

      <div className="pokemon-details-sprite">
        {artwork ? <img src={artwork} alt={pokemon.name} /> : <span className="placeholder">?</span>}
      </div>

      <div className="type-badges">
        {pokemon.types.map(({ type }) => (
          <span key={type.name} className={`type-badge type-${type.name}`}>{capitalize(type.name)}</span>
        ))}
      </div>

      <dl className="pokemon-meta">
        <div>
          <dt>Altura</dt>
          <dd>{(pokemon.height / 10).toFixed(1)} m</dd>
        </div>
        <div>
          <dt>Peso</dt>
          <dd>{(pokemon.weight / 10).toFixed(1)} kg</dd>
        </div>
      </dl>

      <h2>Habilidades</h2>
      <ul>
        {pokemon.abilities.map(({ ability }) => (
          <li key={ability.name}>{capitalize(ability.name.replace('-', ' '))}</li>
        ))}
      </ul>

      <h2>Estadísticas base</h2>
      <ul className="stat-list">
        {pokemon.stats.map((stat) => (
          <li key={stat.stat.name} className="stat-row">
            <span className="stat-name">{capitalize(stat.stat.name.replace('-', ' '))}</span>
            <div className="stat-bar">
              <div className="stat-bar-fill" style={{ width: `${Math.min(100, (stat.base_stat / 200) * 100)}%` }} />
            </div>
            <span className="stat-value">{stat.base_stat}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PokemonDetails
