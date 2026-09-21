import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import GameViewport from '../../components/world/GameViewport.jsx'
import TouchPad from '../../components/world/TouchPad.jsx'
import { getMapById, MAPS, STARTING_MAP_ID } from '../../game/maps/index.js'
import { useGame } from '../../context/GameContext.jsx'
import { GAME_ACTIONS } from '../../context/gameReducer.js'
import { useWorldMovement } from '../../hooks/useWorldMovement.js'
import { usePokedex } from '../../hooks/usePokedex.js'
import { getZoneById } from '../../game/zones.js'
import { getCandidateSpecies, pickRandomCandidate, shouldTriggerEncounter } from '../../game/encounters.js'
import { capitalize } from '../../utils/text.js'

const ENCOUNTER_TRANSITION_MS = 900

// Pantalla principal del juego: el mundo jugable ocupa la pantalla y
// todo lo demás (HUD, viaje, Pokédex) queda alrededor. El ciclo
// completo caminar → hierba alta → encuentro → batalla vive acá:
// useWorldMovement avisa cada paso, shouldTriggerEncounter decide (regla
// pura), y ENTER_BATTLE congela el mundo guardando dónde estaba el
// jugador para que EXIT_BATTLE lo devuelva al mismo tile.
function WorldMap() {
  const { state, dispatch } = useGame()
  const navigate = useNavigate()
  const { status: pokedexStatus, entries } = usePokedex()

  const map = getMapById(state.currentRegionId) ?? getMapById(STARTING_MAP_ID)
  const isPositioned = state.currentRegionId === map.id

  // 'world' | 'encounter' (transición) | 'travel' (fundido entre mapas)
  const [phase, setPhase] = useState('world')
  const [notice, setNotice] = useState(null)
  const [zoneStatus, setZoneStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const candidatesRef = useRef({ zoneId: null, list: [] })
  const stepsSinceEncounter = useRef(0)

  useEffect(() => {
    if (!isPositioned) {
      dispatch({ type: GAME_ACTIONS.ENTER_REGION, regionId: map.id, x: map.spawn.x, y: map.spawn.y })
    }
  }, [isPositioned, map, dispatch])

  // Destraba el mundo si se llegó acá con el modo en 'battle' (URL
  // directa, recarga durante un combate). Solo al montar: durante la
  // transición de encuentro el mundo sigue montado con mode 'battle' a
  // propósito, y volver a despachar EXIT_BATTLE lo cancelaría.
  const releaseOnMount = useRef(false)
  useEffect(() => {
    if (releaseOnMount.current) return
    releaseOnMount.current = true
    if (state.mode === 'battle') dispatch({ type: GAME_ACTIONS.EXIT_BATTLE })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Precarga de las especies candidatas de la zona actual: cruzar los
  // tipos de la zona con el catálogo real cuesta varias peticiones a
  // /type, así que se hacen una vez al entrar y no en medio del paso.
  // Sin esto, el encuentro tendría medio segundo de espera en blanco.
  useEffect(() => {
    if (pokedexStatus !== 'ready') return undefined
    const zone = getZoneById(map.encounterZoneId)
    if (!zone || candidatesRef.current.zoneId === zone.id) return undefined

    let cancelled = false
    setZoneStatus('loading')
    const speciesByName = new Map(entries.map((entry) => [entry.name, entry]))
    getCandidateSpecies(zone, speciesByName)
      .then((list) => {
        if (cancelled) return
        candidatesRef.current = { zoneId: zone.id, list }
        setZoneStatus(list.length > 0 ? 'ready' : 'error')
      })
      .catch(() => {
        // Sin candidatos precargados el mundo sigue siendo jugable: no
        // habrá encuentros hasta que la red vuelva. Se avisa en el HUD.
        if (cancelled) return
        candidatesRef.current = { zoneId: null, list: [] }
        setZoneStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [pokedexStatus, entries, map.encounterZoneId])

  const travelTo = useCallback(
    (regionId) => {
      const target = getMapById(regionId)
      if (!target || target.id === state.currentRegionId) return
      setPhase('travel')
      stepsSinceEncounter.current = 0
      candidatesRef.current = { zoneId: null, list: [] }
      setZoneStatus('loading')
      setNotice(`Llegaste a ${target.name}.`)
      dispatch({ type: GAME_ACTIONS.ENTER_REGION, regionId: target.id, x: target.spawn.x, y: target.spawn.y })
      setTimeout(() => setPhase('world'), 260)
    },
    [dispatch, state.currentRegionId],
  )

  const handleStep = useCallback(
    (tileType, position) => {
      const portal = map.portals?.find((entry) => entry.x === position.x && entry.y === position.y)
      if (portal) {
        travelTo(portal.to)
        return
      }

      stepsSinceEncounter.current += 1
      if (!shouldTriggerEncounter(tileType, stepsSinceEncounter.current)) return

      const picked = pickRandomCandidate(candidatesRef.current.list)
      if (!picked) return

      stepsSinceEncounter.current = 0
      setPhase('encounter')
      setNotice(null)
      // Descubrir ocurre al APARECER: aunque el jugador huya o falle la
      // captura, el Pokémon ya queda registrado en la Pokédex.
      dispatch({ type: GAME_ACTIONS.SELECT_POKEMON, id: picked.id })
      dispatch({ type: GAME_ACTIONS.DISCOVER_POKEMON, id: picked.id })
      dispatch({ type: GAME_ACTIONS.ENTER_BATTLE })
      setTimeout(() => navigate('/battle'), ENCOUNTER_TRANSITION_MS)
    },
    [map, dispatch, navigate, travelTo],
  )

  const step = useWorldMovement(map, phase === 'world' && state.mode !== 'battle', handleStep)

  const zone = getZoneById(map.encounterZoneId)
  const failed = pokedexStatus === 'error' || zoneStatus === 'error'
  const ready = pokedexStatus === 'ready' && zoneStatus === 'ready'

  return (
    <section className="screen world-screen">
      <div className="world-hud world-hud-top">
        <div className="hud-panel hud-region">
          <span className="hud-label">Región</span>
          <strong>{map.name}</strong>
          <span className="hud-note">
            {zone ? `Pokémon de tipo ${zone.types.join(', ')}` : 'Zona segura'}
          </span>
        </div>
        <div className="hud-panel hud-help">
          <span className="hud-label">Controles</span>
          <p>Flechas o WASD para caminar. La hierba alta esconde Pokémon salvajes.</p>
          <p className={ready ? 'hud-ok' : failed ? 'hud-error' : 'hud-pending'} role="status">
            {failed
              ? 'Sin datos de PokéAPI: el mundo es explorable, pero no habrá encuentros.'
              : ready
                ? 'Zona cargada'
                : 'Cargando fauna de la zona...'}
          </p>
        </div>
        <Link to="/pokedex" className="btn hud-btn">Pokédex</Link>
      </div>

      <GameViewport
        map={map}
        focus={isPositioned ? state.playerPosition : map.spawn}
        direction={state.playerDirection}
        ambience={map.ambience}
      >
        {phase === 'encounter' && (
          <div className="encounter-transition" role="status">
            <span>¡Un Pokémon salvaje apareció!</span>
          </div>
        )}
        {phase === 'travel' && <div className="travel-fade" aria-hidden="true" />}
      </GameViewport>

      <div className="world-hud world-hud-bottom">
        <TouchPad onStep={step} disabled={phase !== 'world'} />
        <div className="hud-panel hud-travel">
          <span className="hud-label">Viaje</span>
          <p className="hud-note">Camina hasta una salida del mapa o viaja directo:</p>
          <div className="travel-grid">
            {MAPS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={entry.id === map.id ? 'travel-chip active' : 'travel-chip'}
                onClick={() => travelTo(entry.id)}
                aria-current={entry.id === map.id ? 'true' : undefined}
              >
                {entry.name}
              </button>
            ))}
          </div>
          {notice && <p className="hud-notice" role="status">{notice}</p>}
        </div>
        <div className="hud-panel hud-progress">
          <span className="hud-label">Expedición</span>
          <p>
            <strong>{state.capturedPokemonIds.length}</strong> capturados
          </p>
          <p>
            <strong>{state.discoveredPokemonIds.length}</strong> descubiertos
          </p>
          {state.starterPokemonId ? (
            <Link className="text-link" to={`/pokedex/${state.starterPokemonId}`}>
              Ver a tu compañero
            </Link>
          ) : (
            <Link className="text-link" to="/starter">Elegir compañero</Link>
          )}
        </div>
      </div>

      <details className="zone-details">
        <summary>Rutas de exploración manual</summary>
        <div className="zone-grid">
          {MAPS.filter((entry) => entry.id !== STARTING_MAP_ID).map((entry) => (
            <Link key={entry.id} to={`/explore/${entry.encounterZoneId}`} className="zone-chip">
              {entry.name}
              <span>{capitalize(getZoneById(entry.encounterZoneId)?.description ?? '')}</span>
            </Link>
          ))}
        </div>
      </details>
    </section>
  )
}

export default WorldMap
