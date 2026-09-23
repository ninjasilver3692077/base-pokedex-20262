import { useEffect, useMemo, useRef, useState } from 'react'
import TileLayer from './TileLayer.jsx'
import TrainerSprite from './TrainerSprite.jsx'
import { computeCameraOffset, TILE_SIZE_PX, VIEWPORT_TILES_X, VIEWPORT_TILES_Y } from '../../game/camera.js'

const BASE_WIDTH = VIEWPORT_TILES_X * TILE_SIZE_PX
const BASE_HEIGHT = VIEWPORT_TILES_Y * TILE_SIZE_PX
const MIN_SCALE = 0.34
const MAX_SCALE = 1.5

// El viewport siempre se dibuja a su tamaño lógico (840x520) y se escala
// entero con un transform, midiendo el espacio real que le da su
// contenedor (antes medía window.innerHeight, que asumía ser el contenido
// principal de la página entera; ahora vive dentro de la pantalla fija de
// la consola, así que el contenedor —no la ventana— es la fuente de
// verdad del espacio disponible).
function useStageScale(stageRef) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    function update() {
      const next = Math.min(stage.clientWidth / BASE_WIDTH, stage.clientHeight / BASE_HEIGHT)
      setScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, next)))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [stageRef])

  return scale
}

// Marco de tamaño fijo (overflow: hidden) que traslada una capa "mundo"
// interna vía transform para simular la cámara siguiendo al foco. Nunca
// anima left/top/width (mismo criterio que la corrección de la barra de
// HP en Fase 8): un único translate3d por movimiento, compuesto por GPU.
function GameViewport({ map, focus, direction = 'down', ambience = 'town', children }) {
  const camera = useMemo(() => computeCameraOffset(focus, map), [focus, map])
  const stageRef = useRef(null)
  const scale = useStageScale(stageRef)

  return (
    <div className="game-stage" ref={stageRef}>
      <div
        className={`game-viewport ambience-${ambience}`}
        style={{
          '--tile-size': `${TILE_SIZE_PX}px`,
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          transform: `scale(${scale})`,
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
            <span className="player-shadow" aria-hidden="true" />
            <TrainerSprite direction={direction} />
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

export default GameViewport
