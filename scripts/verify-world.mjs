import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { computeCameraOffset, TILE_SIZE_PX, VIEWPORT_TILES_X, VIEWPORT_TILES_Y } from '../src/game/camera.js'
import { TILE_TYPES } from '../src/game/tiles.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mapsDir = path.join(__dirname, '../src/game/maps')

async function main() {
  // --- Cámara: centrado + clamping en los 4 bordes ---
  const map = { width: 14, height: 10 }

  const center = computeCameraOffset({ x: 6, y: 5 }, map)
  assert.equal(center.offsetX, 6 - Math.floor(VIEWPORT_TILES_X / 2))
  assert.equal(center.offsetY, 5 - Math.floor(VIEWPORT_TILES_Y / 2))
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
  const mapFiles = readdirSync(mapsDir).filter((file) => file.endsWith('.js'))
  assert.ok(mapFiles.length > 0, 'debe existir al menos un mapa para validar')

  for (const file of mapFiles) {
    const moduleExports = await import(path.join(mapsDir, file))
    const mapDef = Object.values(moduleExports).find((value) => value && Array.isArray(value.tiles))
    assert.ok(mapDef, `${file} debe exportar un mapa con .tiles`)

    assert.equal(mapDef.tiles.length, mapDef.height, `${file}: la cantidad de filas debe igualar height`)
    for (const row of mapDef.tiles) {
      assert.equal(row.length, mapDef.width, `${file}: cada fila debe tener exactamente width columnas`)
      for (const tileType of row) {
        assert.ok(knownTileTypes.has(tileType), `${file}: tile desconocido "${tileType}" (typo de autoría)`)
      }
    }

    const spawnTile = mapDef.tiles[mapDef.spawn.y][mapDef.spawn.x]
    assert.ok(TILE_TYPES[spawnTile]?.walkable, `${file}: el tile de spawn (${spawnTile}) debe ser transitable`)
  }

  console.log(
    `OK: cámara (centrado + clamping en los 4 bordes) y ${mapFiles.length} mapa(s) (dimensiones, tiles válidos, spawn transitable) verificados.`,
  )
}

main().catch((error) => {
  console.error('FALLÓ la verificación del mundo:', error)
  process.exitCode = 1
})
