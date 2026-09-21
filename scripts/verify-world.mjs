import assert from 'node:assert/strict'
import { computeCameraOffset, TILE_SIZE_PX, VIEWPORT_TILES_X, VIEWPORT_TILES_Y } from '../src/game/camera.js'
import { TILE_TYPES, isEncounterTile, isWalkable } from '../src/game/tiles.js'
import { MAPS, getMapById } from '../src/game/maps/index.js'

// Todo tile transitable alcanzable caminando desde el spawn. Es la
// comprobación que de verdad importa en un mapa compuesto: que la
// decoración sembrada no haya cortado el camino ni encerrado una salida.
function reachableFrom(map, start) {
  const seen = new Set([`${start.x},${start.y}`])
  const queue = [[start.x, start.y]]
  while (queue.length > 0) {
    const [x, y] = queue.pop()
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue
      const key = `${nx},${ny}`
      if (seen.has(key)) continue
      if (!isWalkable(map.tiles[ny][nx])) continue
      seen.add(key)
      queue.push([nx, ny])
    }
  }
  return seen
}

async function main() {
  // --- Cámara: centrado + clamping en los 4 bordes ---
  // Mapa de prueba mayor que el viewport (21x13), como los reales.
  const map = { width: 30, height: 22 }

  const center = computeCameraOffset({ x: 15, y: 11 }, map)
  assert.equal(center.offsetX, 15 - Math.floor(VIEWPORT_TILES_X / 2))
  assert.equal(center.offsetY, 11 - Math.floor(VIEWPORT_TILES_Y / 2))
  assert.equal(center.translateX, -center.offsetX * TILE_SIZE_PX)
  assert.equal(center.translateY, -center.offsetY * TILE_SIZE_PX)

  const topLeft = computeCameraOffset({ x: 0, y: 0 }, map)
  assert.equal(topLeft.offsetX, 0)
  assert.equal(topLeft.offsetY, 0)

  const bottomRight = computeCameraOffset({ x: map.width - 1, y: map.height - 1 }, map)
  assert.equal(bottomRight.offsetX, map.width - VIEWPORT_TILES_X)
  assert.equal(bottomRight.offsetY, map.height - VIEWPORT_TILES_Y)

  const farLeft = computeCameraOffset({ x: -5, y: 0 }, map)
  assert.equal(farLeft.offsetX, 0, 'no debe clampear a un offset negativo aunque el foco esté fuera del mapa')

  const farRight = computeCameraOffset({ x: 999, y: 0 }, map)
  assert.equal(farRight.offsetX, map.width - VIEWPORT_TILES_X, 'no debe superar el borde derecho del mapa')

  // Mapa más chico que el viewport: no debe intentar un offset negativo.
  const tinyMap = { width: 4, height: 3 }
  const tinyCamera = computeCameraOffset({ x: 1, y: 1 }, tinyMap)
  assert.equal(tinyCamera.offsetX, 0)
  assert.equal(tinyCamera.offsetY, 0)

  // --- Tiles: cada string usado en cada mapa debe existir en TILE_TYPES,
  // y el spawn debe caer sobre un tile transitable. Recorre todos los
  // archivos de src/game/maps/ para que siga funcionando cuando la Fase
  // 11H agregue el resto de regiones, sin tocar este script.
  const knownTileTypes = new Set(Object.keys(TILE_TYPES))
  assert.ok(MAPS.length >= 9, 'deben existir Central Town y las 8 regiones')

  for (const mapDef of MAPS) {
    const id = mapDef.id
    assert.equal(mapDef.tiles.length, mapDef.height, `${id}: la cantidad de filas debe igualar height`)
    for (const row of mapDef.tiles) {
      assert.equal(row.length, mapDef.width, `${id}: cada fila debe tener exactamente width columnas`)
      for (const tileType of row) {
        assert.ok(knownTileTypes.has(tileType), `${id}: tile desconocido "${tileType}" (typo de autoría)`)
      }
    }

    // El mapa debe ser mayor que el viewport, o la cámara no tendría
    // nada que desplazar ni que clampear.
    assert.ok(mapDef.width > VIEWPORT_TILES_X, `${id}: el mapa debe ser más ancho que el viewport`)
    assert.ok(mapDef.height > VIEWPORT_TILES_Y, `${id}: el mapa debe ser más alto que el viewport`)

    const spawnTile = mapDef.tiles[mapDef.spawn.y][mapDef.spawn.x]
    assert.ok(TILE_TYPES[spawnTile]?.walkable, `${id}: el tile de spawn (${spawnTile}) debe ser transitable`)

    const reachable = reachableFrom(mapDef, mapDef.spawn)

    for (const portal of mapDef.portals ?? []) {
      assert.ok(
        reachable.has(`${portal.x},${portal.y}`),
        `${id}: la salida hacia ${portal.to} debe poder alcanzarse caminando desde el spawn`,
      )
      assert.ok(getMapById(portal.to), `${id}: la salida apunta a un mapa inexistente (${portal.to})`)
    }

    // Toda región jugable debe tener hierba alta (o su equivalente de
    // bioma) alcanzable: sin eso el ciclo caminar → encuentro no existe.
    if (id !== 'central-town') {
      const encounterTiles = [...reachable].filter((key) => {
        const [x, y] = key.split(',').map(Number)
        return isEncounterTile(mapDef.tiles[y][x])
      })
      assert.ok(
        encounterTiles.length >= 20,
        `${id}: debe haber zona de encuentros alcanzable (encontradas ${encounterTiles.length})`,
      )
    }
  }

  console.log(
    `OK: cámara (centrado + clamping en los 4 bordes) y ${MAPS.length} mapas (dimensiones, tiles válidos, spawn transitable, salidas alcanzables, zonas de encuentro) verificados.`,
  )
}

main().catch((error) => {
  console.error('FALLÓ la verificación del mundo:', error)
  process.exitCode = 1
})
