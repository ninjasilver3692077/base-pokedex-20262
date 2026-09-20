import assert from 'node:assert/strict'
import { resolveStep } from '../src/game/movement.js'
import { CENTRAL_TOWN_MAP } from '../src/game/maps/central-town.js'

const mockMap = {
  width: 3,
  height: 3,
  tiles: [
    ['tree', 'grass', 'tree'],
    ['grass', 'grass', 'water'],
    ['tree', 'grass', 'tree'],
  ],
}

function main() {
  // Paso normal sobre tile transitable.
  const moved = resolveStep({ x: 1, y: 1 }, 'up', mockMap)
  assert.deepEqual(moved.position, { x: 1, y: 0 })
  assert.equal(moved.blocked, false)

  // Bloqueo por colisión (agua no es transitable).
  const blockedByWater = resolveStep({ x: 1, y: 1 }, 'right', mockMap)
  assert.deepEqual(blockedByWater.position, { x: 1, y: 1 }, 'no debe moverse si el tile destino no es transitable')
  assert.equal(blockedByWater.blocked, true)

  // Bloqueo por colisión (árbol).
  const blockedByTree = resolveStep({ x: 1, y: 0 }, 'left', mockMap)
  assert.deepEqual(blockedByTree.position, { x: 1, y: 0 })
  assert.equal(blockedByTree.blocked, true)

  // Bloqueo por borde del mapa.
  const blockedByEdge = resolveStep({ x: 1, y: 0 }, 'up', mockMap)
  assert.deepEqual(blockedByEdge.position, { x: 1, y: 0 }, 'no debe salir de los límites del mapa')
  assert.equal(blockedByEdge.blocked, true)

  // Dirección inválida: no debe explotar, solo bloquear.
  const invalidDirection = resolveStep({ x: 1, y: 1 }, 'diagonal', mockMap)
  assert.deepEqual(invalidDirection.position, { x: 1, y: 1 })
  assert.equal(invalidDirection.blocked, true)

  // Integración con el mapa real de Central Town: el spawn tiene un
  // tramo de árboles justo debajo (borde del pueblo) y hierba alta arriba.
  const fromSpawnDown = resolveStep(CENTRAL_TOWN_MAP.spawn, 'down', CENTRAL_TOWN_MAP)
  assert.equal(fromSpawnDown.blocked, true, 'el borde de árboles debajo del spawn debe bloquear')

  const fromSpawnUp = resolveStep(CENTRAL_TOWN_MAP.spawn, 'up', CENTRAL_TOWN_MAP)
  assert.equal(fromSpawnUp.blocked, false, 'debe poder caminar hacia la hierba alta arriba del spawn')

  console.log('OK: resolución de movimiento (paso, colisión con obstáculo, borde de mapa, integración con Central Town) verificada.')
}

main()
