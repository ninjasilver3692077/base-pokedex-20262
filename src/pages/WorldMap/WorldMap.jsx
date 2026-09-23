import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GameViewport from '../../components/world/GameViewport.jsx'
import { getMapById, STARTING_MAP_ID } from '../../game/maps/index.js'
import { useGame } from '../../context/GameContext.jsx'
import { GAME_ACTIONS } from '../../context/gameReducer.js'
import { useWorldMovement } from '../../hooks/useWorldMovement.js'
import { usePokedex } from '../../hooks/usePokedex.js'
import { useUiState } from '../../context/UiStateContext.jsx'
import { useConsoleActions } from '../../input/InputProvider.jsx'
import { INPUT_ACTIONS } from '../../input/inputActions.js'
import { getZoneById } from '../../game/zones.js'
import { getCandidateSpecies, pickRandomCandidate, shouldTriggerEncounter } from '../../game/encounters.js'

const ENCOUNTER_TRANSITION_MS = 900

// Pantalla principal del juego: el mundo jugable ocupa la pantalla y todo
// lo demás (HUD) queda alrededor, sin botones HTML de navegación — Tab
// abre la Pokédex, el D-pad de la consola mueve, ACTION_1 revisa al
// compañero. El ciclo completo caminar → hierba alta → encuentro → batalla
// vive acá: useWorldMovement avisa cada paso, shouldTriggerEncounter
// decide (regla pura), y ENTER_BATTLE congela el mundo guardando dónde
// estaba el jugador para que EXIT_BATTLE lo devuelva al mismo tile.
function WorldMap() {
  const { state, dispatch } = useGame()
  const navigate = useNavigate()
  const { isPaused, openPokedexAt } = useUiState()
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

  useWorldMovement(map, phase === 'world' && state.mode !== 'battle' && !isPaused, handleStep)

  useConsoleActions(
    {
      [INPUT_ACTIONS.ACTION_1]: () => {
        if (state.starterPokemonId != null) openPokedexAt(state.starterPokemonId)
      },
    },
    {
      context: 'WORLD',
      hints: [
        { keys: 'DPAD', label: 'MOVER' },
        { keys: '1', label: 'EQUIPO' },
        { keys: 'TAB', label: 'POKÉDEX' },
        { keys: 'PAUSE', label: 'MENÚ' },
      ],
    },
  )

  const zone = getZoneById(map.encounterZoneId)
  const failed = pokedexStatus === 'error' || zoneStatus === 'error'
  const ready = pokedexStatus === 'ready' && zoneStatus === 'ready'

  const statusText = notice ?? (failed ? 'Sin datos de PokéAPI' : ready ? (zone ? `Tipo ${zone.types.join(', ')}` : 'Zona segura') : 'Cargando...')
  const statusClass = notice ? 'hud-notice' : ready ? 'hud-ok' : failed ? 'hud-error' : 'hud-pending'

  return (
    <section className="screen world-screen">
      <div className="world-topbar">
        <strong>{map.name}</strong>
        <span className={statusClass} role="status">
          {statusText}
        </span>
      </div>

      <GameViewport map={map} focus={isPositioned ? state.playerPosition : map.spawn} direction={state.playerDirection} ambience={map.ambience}>
        {phase === 'encounter' && (
          <div className="encounter-transition" role="status">
            <span>¡Un Pokémon salvaje apareció!</span>
          </div>
        )}
        {phase === 'travel' && <div className="travel-fade" aria-hidden="true" />}
      </GameViewport>
    </section>
  )
}

export default WorldMap
