import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getZoneById } from '../../game/zones.js'
import { getCandidateSpecies, pickRandomCandidate } from '../../game/encounters.js'
import { usePokedex } from '../../hooks/usePokedex.js'
import { usePokemon } from '../../hooks/usePokemon.js'
import { useGame } from '../../context/GameContext.jsx'
import { GAME_ACTIONS } from '../../context/gameReducer.js'
import { capitalize } from '../../utils/text.js'

function Exploration() {
  const { zoneId } = useParams()
  const zone = getZoneById(zoneId)
  const navigate = useNavigate()
  const { dispatch } = useGame()
  const { status: pokedexStatus, entries } = usePokedex()

  const [explore, setExplore] = useState({ status: 'idle', encounterId: null, error: null })
  const encounter = usePokemon(explore.encounterId)

  async function handleExplore() {
    setExplore({ status: 'exploring', encounterId: null, error: null })
    try {
      const speciesByName = new Map(entries.map((entry) => [entry.name, entry]))
      const candidates = await getCandidateSpecies(zone, speciesByName)
      const picked = pickRandomCandidate(candidates)

      if (!picked) {
        setExplore({ status: 'empty', encounterId: null, error: null })
        return
      }

      dispatch({ type: GAME_ACTIONS.SELECT_POKEMON, id: picked.id })
      setExplore({ status: 'found', encounterId: picked.id, error: null })
    } catch (error) {
      setExplore({ status: 'error', encounterId: null, error })
    }
  }

  if (!zone) {
    return (
      <section className="screen">
        <h1>Zona desconocida</h1>
        <p>No existe una zona llamada "{zoneId}".</p>
        <Link className="btn" to="/map">Volver al mapa</Link>
      </section>
    )
  }

  return (
    <section className="screen">
      <h1>{zone.name}</h1>
      <p>{zone.description}</p>
      <div className="type-badges">
        {zone.types.map((type) => (
          <span key={type} className={`type-badge type-${type}`}>{capitalize(type)}</span>
        ))}
      </div>

      {explore.status === 'idle' && (
        <button className="btn" type="button" onClick={handleExplore} disabled={pokedexStatus !== 'ready'}>
          {pokedexStatus === 'ready' ? 'Explorar' : 'Cargando catálogo...'}
        </button>
      )}

      {explore.status === 'exploring' && <p>Explorando...</p>}

      {explore.status === 'empty' && (
        <>
          <p>No encontraste ningún Pokémon esta vez.</p>
          <button className="btn" type="button" onClick={handleExplore}>Explorar de nuevo</button>
        </>
      )}

      {explore.status === 'error' && (
        <>
          <p>No se pudo generar el encuentro. {explore.error?.message}</p>
          <button className="btn" type="button" onClick={handleExplore}>Reintentar</button>
        </>
      )}

      {explore.status === 'found' && (
        <div className="wild-encounter">
          <p>¡Un Pokémon salvaje apareció!</p>
          {encounter.status === 'ready' && encounter.pokemon ? (
            <>
              <div className="pokemon-details-sprite">
                {encounter.pokemon.sprites?.front_default ? (
                  <img src={encounter.pokemon.sprites.front_default} alt={encounter.pokemon.name} />
                ) : (
                  <span className="placeholder">?</span>
                )}
              </div>
              <h2>{capitalize(encounter.pokemon.name)}</h2>
            </>
          ) : (
            <p>Cargando datos del Pokémon...</p>
          )}
          <div className="explore-actions">
            <button className="btn" type="button" onClick={() => navigate('/battle')}>Enfrentar</button>
            <button className="btn" type="button" onClick={handleExplore}>Explorar de nuevo</button>
          </div>
        </div>
      )}
    </section>
  )
}

export default Exploration
