import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getZoneById } from '../../game/zones.js'
import { getCandidateSpecies, pickRandomCandidate } from '../../game/encounters.js'
import { usePokedex } from '../../hooks/usePokedex.js'
import { usePokemon } from '../../hooks/usePokemon.js'
import { useGame } from '../../context/GameContext.jsx'
import { GAME_ACTIONS } from '../../context/gameReducer.js'
import { capitalize } from '../../utils/text.js'
import PokedexUpdatedBanner from '../../components/common/PokedexUpdatedBanner.jsx'

const DISCOVERY_BANNER_DURATION_MS = 4000

function Exploration() {
  const { zoneId } = useParams()
  const zone = getZoneById(zoneId)
  const navigate = useNavigate()
  const { state, dispatch } = useGame()
  const { status: pokedexStatus, entries } = usePokedex()

  const [explore, setExplore] = useState({
    status: 'idle',
    encounterId: null,
    encounterName: null,
    isNewDiscovery: false,
    error: null,
  })
  const encounter = usePokemon(explore.encounterId)

  // El Pokémon queda "discovered" en cuanto aparece en el encuentro, sin
  // importar qué pase después en la batalla (huir, perder, fallar la
  // captura). DISCOVER_POKEMON es idempotente, así que siempre se puede
  // disparar; isNewDiscovery se calcula ANTES para decidir si mostrar el
  // aviso "POKÉDEX UPDATED!".
  async function handleExplore() {
    setExplore({ status: 'exploring', encounterId: null, encounterName: null, isNewDiscovery: false, error: null })
    try {
      const speciesByName = new Map(entries.map((entry) => [entry.name, entry]))
      const candidates = await getCandidateSpecies(zone, speciesByName)
      const picked = pickRandomCandidate(candidates)

      if (!picked) {
        setExplore({ status: 'empty', encounterId: null, encounterName: null, isNewDiscovery: false, error: null })
        return
      }

      const isNewDiscovery =
        !state.discoveredPokemonIds.includes(picked.id) && !state.capturedPokemonIds.includes(picked.id)

      dispatch({ type: GAME_ACTIONS.SELECT_POKEMON, id: picked.id })
      dispatch({ type: GAME_ACTIONS.DISCOVER_POKEMON, id: picked.id })

      setExplore({
        status: 'found',
        encounterId: picked.id,
        encounterName: picked.name,
        isNewDiscovery,
        error: null,
      })
    } catch (error) {
      setExplore({ status: 'error', encounterId: null, encounterName: null, isNewDiscovery: false, error })
    }
  }

  useEffect(() => {
    if (explore.status !== 'found' || !explore.isNewDiscovery) return undefined
    const timer = setTimeout(() => {
      setExplore((prev) => ({ ...prev, isNewDiscovery: false }))
    }, DISCOVERY_BANNER_DURATION_MS)
    return () => clearTimeout(timer)
  }, [explore.status, explore.isNewDiscovery, explore.encounterId])

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
          {explore.isNewDiscovery && (
            <PokedexUpdatedBanner
              pokemonName={explore.encounterName}
              onDismiss={() => setExplore((prev) => ({ ...prev, isNewDiscovery: false }))}
            />
          )}
          <p>¡Un Pokémon salvaje apareció!</p>
          {encounter.status === 'ready' && encounter.pokemon ? (
            <>
              <div key={explore.encounterId} className="pokemon-details-sprite sprite-appear">
                {encounter.pokemon.sprites?.front_default ? (
                  <img className="sprite-idle" src={encounter.pokemon.sprites.front_default} alt={encounter.pokemon.name} />
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
