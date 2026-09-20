import { useMemo } from 'react'
import TileLayer from './TileLayer.jsx'
import TrainerSprite from './TrainerSprite.jsx'
import { computeCameraOffset, TILE_SIZE_PX, VIEWPORT_TILES_X, VIEWPORT_TILES_Y } from '../../game/camera.js'

// Marco de tamaño fijo (overflow: hidden) que traslada una capa "mundo"
// interna vía transform para simular la cámara siguiendo al foco. Nunca
// anima left/top/width (mismo criterio que la corrección de la barra de
// HP en Fase 8): un único translate3d por movimiento, compuesto por GPU.
function GameViewport({ map, focus, direction = 'down' }) {
  const camera = useMemo(() => computeCameraOffset(focus, map), [focus, map])

  return (
    <div
      className="game-viewport"
      style={{
        '--tile-size': `${TILE_SIZE_PX}px`,
        width: VIEWPORT_TILES_X * TILE_SIZE_PX,
        height: VIEWPORT_TILES_Y * TILE_SIZE_PX,
      }}
    >
      <div
        className="game-world"
        style={{ transform: `translate3d(${camera.translateX}px, ${camera.translateY}px, 0)` }}
      >
        <TileLayer map={map} />
        <div
          className="player-sprite-wrapper"
          style={{ transform: `translate3d(${focus.x * TILE_SIZE_PX}px, ${focus.y * TILE_SIZE_PX}px, 0)` }}
        >
          <TrainerSprite direction={direction} />
        </div>
      </div>
    </div>
  )
}

export default GameViewport
