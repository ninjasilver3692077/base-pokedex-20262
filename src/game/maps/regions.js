import { composeMap } from './compose.js'

// Un mapa jugable por región. La estructura de cada uno (camino, lago,
// claros, estructuras, salida) está declarada a mano aquí; composeMap
// solo la pinta y siembra la decoración menor de forma determinista.
//
// Convención compartida: la salida de vuelta a Central Town es el tile
// 'gate' del borde sur, con el jugador apareciendo justo encima.
const W = 30
const H = 22
const GATE = { x: 15, y: H - 1 }
const SPAWN = { x: 15, y: H - 3 }
const BACK = [{ x: GATE.x, y: GATE.y, to: 'central-town' }]

function region(recipe) {
  return composeMap({
    width: W,
    height: H,
    spawn: SPAWN,
    portals: BACK,
    encounterZoneId: recipe.id,
    ...recipe,
    overlay: [{ tile: 'gate', ...GATE }, ...(recipe.overlay ?? [])],
  })
}

export const REGION_MAPS = [
  region({
    id: 'forest',
    name: 'Forest',
    seed: 1101,
    base: 'grass',
    border: 'tree',
    areas: [
      { tile: 'water', x: 3, y: 4, w: 9, h: 6, shape: 'blob' },
      { tile: 'tall-grass', x: 16, y: 3, w: 11, h: 7, shape: 'blob' },
      { tile: 'tall-grass', x: 4, y: 13, w: 9, h: 6, shape: 'blob' },
      { tile: 'tree', x: 20, y: 12, w: 8, h: 6, shape: 'blob' },
    ],
    paths: [
      { tile: 'dirt', points: [[15, 20], [15, 11], [7, 11], [7, 3]], width: 2 },
      { tile: 'dirt', points: [[15, 11], [24, 11]], width: 2 },
    ],
    edges: [{ tile: 'sand', from: ['grass', 'dirt'], around: ['water'] }],
    scatter: [
      { tile: 'flower', on: ['grass'], density: 0.06 },
      { tile: 'flower-blue', on: ['grass'], density: 0.04 },
      { tile: 'bush', on: ['grass'], density: 0.05 },
      { tile: 'tree-tall', on: ['tree'], density: 0.35 },
      { tile: 'rock', on: ['grass'], density: 0.02 },
    ],
    overlay: [
      { tile: 'sign', x: 14, y: 19 },
      { tile: 'bridge', x: 7, y: 7 },
      { tile: 'bridge', x: 7, y: 8 },
    ],
  }),

  region({
    id: 'ocean',
    name: 'Ocean',
    seed: 2202,
    base: 'water',
    border: 'deep-water',
    areas: [
      { tile: 'sand', x: 10, y: 15, w: 11, h: 6, shape: 'blob' },
      { tile: 'sand', x: 3, y: 4, w: 9, h: 6, shape: 'blob' },
      { tile: 'grass', x: 5, y: 5, w: 5, h: 3, shape: 'blob' },
      { tile: 'sand', x: 19, y: 3, w: 8, h: 7, shape: 'blob' },
      { tile: 'grass', x: 21, y: 5, w: 4, h: 3, shape: 'blob' },
    ],
    paths: [
      { tile: 'bridge', points: [[15, 15], [15, 10], [8, 10], [8, 8]], width: 1 },
      { tile: 'bridge', points: [[15, 10], [23, 10], [23, 8]], width: 1 },
    ],
    edges: [{ tile: 'sea-foam', from: ['water'], around: ['sand'] }],
    scatter: [
      { tile: 'rock', on: ['water'], density: 0.04 },
      { tile: 'tree', on: ['grass'], density: 0.25 },
      { tile: 'bush', on: ['sand'], density: 0.04 },
      { tile: 'sea-foam', on: ['water'], density: 0.1 },
    ],
    overlay: [
      { tile: 'sand', x: 15, y: 20 },
      { tile: 'sand', x: 15, y: 19 },
      { tile: 'sign', x: 14, y: 19 },
    ],
  }),

  region({
    id: 'volcano',
    name: 'Volcano',
    seed: 3303,
    base: 'basalt',
    border: 'rock',
    areas: [
      { tile: 'lava', x: 4, y: 3, w: 10, h: 7, shape: 'blob' },
      { tile: 'lava', x: 19, y: 12, w: 8, h: 6, shape: 'blob' },
      { tile: 'ash', x: 16, y: 3, w: 11, h: 6, shape: 'blob' },
      { tile: 'ash', x: 3, y: 13, w: 10, h: 6, shape: 'blob' },
    ],
    paths: [
      { tile: 'basalt', points: [[15, 20], [15, 11], [6, 11], [6, 4]], width: 2 },
      { tile: 'basalt', points: [[15, 11], [24, 11]], width: 2 },
    ],
    edges: [{ tile: 'rock', from: ['basalt', 'ash'], around: ['lava'] }],
    scatter: [
      { tile: 'rock', on: ['basalt'], density: 0.07 },
      { tile: 'ash', on: ['basalt'], density: 0.05 },
    ],
    overlay: [
      { tile: 'sign', x: 14, y: 19 },
      { tile: 'cave-entrance', x: 24, y: 4 },
    ],
  }),

  region({
    id: 'power-plant',
    name: 'Power Plant',
    seed: 4404,
    base: 'metal',
    border: 'machine',
    areas: [
      { tile: 'machine', x: 4, y: 4, w: 7, h: 4 },
      { tile: 'machine', x: 19, y: 4, w: 7, h: 4 },
      { tile: 'machine', x: 4, y: 15, w: 6, h: 4 },
      { tile: 'metal-grate', x: 12, y: 3, w: 7, h: 6 },
      { tile: 'metal-grate', x: 18, y: 14, w: 9, h: 5 },
    ],
    paths: [
      { tile: 'metal', points: [[15, 20], [15, 11], [5, 11]], width: 2 },
      { tile: 'metal', points: [[15, 11], [25, 11]], width: 2 },
    ],
    edges: [],
    scatter: [
      { tile: 'pylon', on: ['metal'], density: 0.04 },
      { tile: 'metal-grate', on: ['metal'], density: 0.06 },
    ],
    overlay: [
      { tile: 'sign', x: 14, y: 19 },
      { tile: 'pylon', x: 7, y: 9 },
      { tile: 'pylon', x: 23, y: 9 },
      { tile: 'pylon', x: 7, y: 13 },
      { tile: 'pylon', x: 23, y: 13 },
    ],
  }),

  region({
    id: 'mountain',
    name: 'Mountain',
    seed: 5505,
    base: 'dirt',
    border: 'cliff',
    areas: [
      { tile: 'cliff', x: 3, y: 3, w: 9, h: 5, shape: 'blob' },
      { tile: 'cliff', x: 18, y: 3, w: 9, h: 5, shape: 'blob' },
      { tile: 'cliff', x: 2, y: 14, w: 7, h: 5, shape: 'blob' },
      { tile: 'tall-grass', x: 12, y: 4, w: 7, h: 5, shape: 'blob' },
      { tile: 'tall-grass', x: 18, y: 14, w: 9, h: 5, shape: 'blob' },
      { tile: 'water', x: 10, y: 11, w: 11, h: 3 },
    ],
    paths: [
      { tile: 'dirt', points: [[15, 20], [15, 15], [11, 15], [11, 9], [15, 9], [15, 4]], width: 2 },
      { tile: 'dirt', points: [[15, 9], [25, 9]], width: 2 },
    ],
    edges: [{ tile: 'rock', from: ['dirt'], around: ['water'] }],
    scatter: [
      { tile: 'rock', on: ['dirt'], density: 0.08 },
      { tile: 'bush', on: ['dirt'], density: 0.03 },
      { tile: 'tree', on: ['dirt'], density: 0.02 },
    ],
    overlay: [
      { tile: 'sign', x: 14, y: 19 },
      { tile: 'bridge', x: 11, y: 11 },
      { tile: 'bridge', x: 11, y: 12 },
      { tile: 'bridge', x: 11, y: 13 },
      { tile: 'bridge', x: 12, y: 11 },
      { tile: 'bridge', x: 12, y: 12 },
      { tile: 'bridge', x: 12, y: 13 },
      { tile: 'stairs', x: 11, y: 10 },
      { tile: 'stairs', x: 12, y: 10 },
      { tile: 'stairs', x: 11, y: 14 },
      { tile: 'stairs', x: 12, y: 14 },
    ],
  }),

  region({
    id: 'dark-cave',
    name: 'Dark Cave',
    seed: 6606,
    base: 'cave-floor',
    border: 'cave-wall',
    areas: [
      { tile: 'cave-wall', x: 4, y: 4, w: 7, h: 5, shape: 'blob' },
      { tile: 'cave-wall', x: 19, y: 4, w: 7, h: 5, shape: 'blob' },
      { tile: 'cave-wall', x: 3, y: 14, w: 6, h: 5, shape: 'blob' },
      { tile: 'cave-wall', x: 21, y: 14, w: 6, h: 5, shape: 'blob' },
      { tile: 'deep-water', x: 12, y: 3, w: 7, h: 4, shape: 'blob' },
    ],
    paths: [
      { tile: 'basalt', points: [[15, 20], [15, 12], [7, 12], [7, 10]], width: 2 },
      { tile: 'basalt', points: [[15, 12], [24, 12], [24, 10]], width: 2 },
    ],
    edges: [{ tile: 'rock', from: ['cave-floor'], around: ['deep-water'] }],
    scatter: [
      { tile: 'rock', on: ['cave-floor'], density: 0.07 },
      { tile: 'cave-wall', on: ['cave-floor'], density: 0.03 },
    ],
    overlay: [
      { tile: 'sign', x: 14, y: 19 },
      { tile: 'cave-entrance', x: 7, y: 9 },
      { tile: 'cave-entrance', x: 24, y: 9 },
    ],
  }),

  region({
    id: 'frozen-lands',
    name: 'Frozen Lands',
    seed: 7707,
    base: 'snow',
    border: 'snow-tree',
    areas: [
      { tile: 'ice', x: 4, y: 4, w: 10, h: 6, shape: 'blob' },
      { tile: 'snow-grass', x: 17, y: 3, w: 10, h: 6, shape: 'blob' },
      { tile: 'snow-grass', x: 4, y: 14, w: 9, h: 5, shape: 'blob' },
      { tile: 'ice', x: 19, y: 13, w: 8, h: 5, shape: 'blob' },
    ],
    paths: [
      { tile: 'dirt', points: [[15, 20], [15, 11], [6, 11], [6, 4]], width: 2 },
      { tile: 'dirt', points: [[15, 11], [24, 11]], width: 2 },
    ],
    edges: [{ tile: 'snow', from: ['snow-grass'], around: ['ice'] }],
    scatter: [
      { tile: 'snow-tree', on: ['snow'], density: 0.07 },
      { tile: 'rock', on: ['snow'], density: 0.03 },
      { tile: 'bush', on: ['snow'], density: 0.02 },
    ],
    overlay: [
      { tile: 'sign', x: 14, y: 19 },
      { tile: 'bridge', x: 6, y: 7 },
      { tile: 'bridge', x: 7, y: 7 },
    ],
  }),

  region({
    id: 'desert',
    name: 'Desert',
    seed: 8808,
    base: 'sand',
    border: 'cliff',
    areas: [
      { tile: 'dune', x: 3, y: 3, w: 10, h: 6, shape: 'blob' },
      { tile: 'dune', x: 18, y: 13, w: 9, h: 6, shape: 'blob' },
      { tile: 'ruins', x: 18, y: 4, w: 7, h: 4 },
      { tile: 'cliff', x: 3, y: 15, w: 7, h: 4, shape: 'blob' },
    ],
    paths: [
      { tile: 'dirt', points: [[15, 20], [15, 11], [5, 11]], width: 2 },
      { tile: 'dirt', points: [[15, 11], [21, 11], [21, 8]], width: 2 },
    ],
    edges: [],
    scatter: [
      { tile: 'cactus', on: ['sand'], density: 0.05 },
      { tile: 'rock', on: ['sand'], density: 0.05 },
      { tile: 'ruins', on: ['sand'], density: 0.02 },
      { tile: 'dune', on: ['sand'], density: 0.05 },
    ],
    overlay: [
      { tile: 'sign', x: 14, y: 19 },
      { tile: 'sand', x: 21, y: 8 },
    ],
  }),
]
