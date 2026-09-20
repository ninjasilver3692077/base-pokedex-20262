// Resolución de un paso de movimiento: pura, sin React. Dada la posición
// actual, una dirección y el mapa, decide la siguiente posición
// respetando límites del mapa y colisión (game/tiles.js).
import { isWalkable } from './tiles.js'

const DIRECTION_DELTAS = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
}

export function resolveStep(position, direction, map) {
  const delta = DIRECTION_DELTAS[direction]
  if (!delta) return { position, blocked: true }

  const nextX = position.x + delta.dx
  const nextY = position.y + delta.dy

  const outOfBounds = nextX < 0 || nextY < 0 || nextX >= map.width || nextY >= map.height
  if (outOfBounds) return { position, blocked: true }

  const tileType = map.tiles[nextY][nextX]
  if (!isWalkable(tileType)) return { position, blocked: true }

  return { position: { x: nextX, y: nextY }, blocked: false }
}
