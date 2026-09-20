// Cámara pura: dado el foco (posición del jugador en tiles) y el mapa,
// calcula el offset del viewport, centrando cuando hay espacio y
// clampando en los bordes para no mostrar fuera del mapa.
export const TILE_SIZE_PX = 32
export const VIEWPORT_TILES_X = 11
export const VIEWPORT_TILES_Y = 9

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function computeCameraOffset(focus, map) {
  const idealX = focus.x - Math.floor(VIEWPORT_TILES_X / 2)
  const idealY = focus.y - Math.floor(VIEWPORT_TILES_Y / 2)
  const offsetX = clamp(idealX, 0, Math.max(0, map.width - VIEWPORT_TILES_X))
  const offsetY = clamp(idealY, 0, Math.max(0, map.height - VIEWPORT_TILES_Y))
  return {
    offsetX,
    offsetY,
    translateX: -offsetX * TILE_SIZE_PX,
    translateY: -offsetY * TILE_SIZE_PX,
  }
}
