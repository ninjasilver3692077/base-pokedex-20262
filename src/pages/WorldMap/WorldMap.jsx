import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import GameViewport from '../../components/world/GameViewport.jsx'
import { CENTRAL_TOWN_MAP } from '../../game/maps/central-town.js'
import { useGame } from '../../context/GameContext.jsx'
import { GAME_ACTIONS } from '../../context/gameReducer.js'
import { useWorldMovement } from '../../hooks/useWorldMovement.js'

// Fase 11D: movimiento real. Al entrar por primera vez a esta región se
// coloca al jugador en el spawn (ENTER_REGION); en visitas siguientes
// (incluida una recarga) currentRegionId ya coincide y se respeta la
// posición persistida. El listado de zonas como tarjetas se retira en
// 11E, cuando existan más regiones jugables de verdad.
function WorldMap() {
  const { state, dispatch } = useGame()
  const isPositioned = state.currentRegionId === CENTRAL_TOWN_MAP.id

  useEffect(() => {
    if (!isPositioned) {
      dispatch({
        type: GAME_ACTIONS.ENTER_REGION,
        regionId: CENTRAL_TOWN_MAP.id,
        x: CENTRAL_TOWN_MAP.spawn.x,
        y: CENTRAL_TOWN_MAP.spawn.y,
      })
    }
  }, [isPositioned, dispatch])

  useWorldMovement(CENTRAL_TOWN_MAP, state.mode === 'world')

  return (
    <section className="screen pokedex-screen">
      <h1>Mapa del mundo</h1>
      <p>Muévete con las flechas o WASD.</p>

      <GameViewport
        map={CENTRAL_TOWN_MAP}
        focus={isPositioned ? state.playerPosition : CENTRAL_TOWN_MAP.spawn}
        direction={state.playerDirection}
      />

      <Link to="/pokedex" className="text-link">Ver Pokédex</Link>
    </section>
  )
}

export default WorldMap
