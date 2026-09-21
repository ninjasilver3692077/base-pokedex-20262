// Autoría de mapas: dos utilidades puras, sin React ni red.
//
// 1) fromRows(): un mapa escrito a mano como filas de caracteres. Es la
//    forma legible de autorar un pueblo tile a tile (ver central-town.js).
// 2) composeMap(): construye un mapa a partir de una RECETA de bioma.
//    La composición (dónde va el camino, el lago, el claro, la entrada)
//    se declara a mano con coordenadas; solo la decoración menor —una
//    flor, una roca suelta— se siembra con un PRNG determinista, para
//    que el mapa no sea un patrón repetido pero siga siendo el mismo en
//    cada carga y en cada navegador. Nada de aleatoriedad sin
//    composición: el ruido nunca decide estructura ni transitabilidad.

export const TILE_LEGEND = {
  '.': 'grass',
  ',': 'tall-grass',
  ':': 'dirt',
  T: 'tree',
  Y: 'tree-tall',
  b: 'bush',
  f: 'flower',
  F: 'flower-blue',
  '~': 'water',
  W: 'deep-water',
  s: 'sand',
  r: 'rock',
  '=': 'bridge',
  B: 'building',
  D: 'building-door',
  R: 'roof',
  '#': 'fence',
  '!': 'sign',
  G: 'gate',
  S: 'stairs',
  C: 'cliff',
  o: 'cave-entrance',
  n: 'snow',
  m: 'snow-grass',
  N: 'snow-tree',
  i: 'ice',
  L: 'lava',
  a: 'ash',
  v: 'basalt',
  c: 'cave-floor',
  X: 'cave-wall',
  M: 'metal',
  g: 'metal-grate',
  H: 'machine',
  P: 'pylon',
  d: 'dune',
  K: 'cactus',
  U: 'ruins',
  e: 'sea-foam',
}

export function fromRows(rows) {
  return rows.map((row, y) =>
    [...row].map((char, x) => {
      const tile = TILE_LEGEND[char]
      if (!tile) throw new Error(`Carácter de mapa desconocido "${char}" en (${x}, ${y})`)
      return tile
    }),
  )
}

// mulberry32: PRNG determinista de 32 bits, corto y suficiente para
// sembrar decoración. Misma semilla => mismo mapa, siempre.
function createRandom(seed) {
  let state = seed >>> 0
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function inBounds(grid, x, y) {
  return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length
}

// Área declarada a mano. `blob` redondea las esquinas con el PRNG para
// que un lago o un claro no sea un rectángulo perfecto; el centro del
// área siempre se rellena, así que la forma general la decide la receta.
function paintArea(grid, area, random) {
  const { tile, x, y, w, h, shape = 'rect' } = area
  const cx = x + (w - 1) / 2
  const cy = y + (h - 1) / 2
  for (let ty = y; ty < y + h; ty += 1) {
    for (let tx = x; tx < x + w; tx += 1) {
      if (!inBounds(grid, tx, ty)) continue
      if (shape === 'blob') {
        const nx = (tx - cx) / (w / 2)
        const ny = (ty - cy) / (h / 2)
        const distance = Math.sqrt(nx * nx + ny * ny)
        if (distance > 0.72 + random() * 0.34) continue
      }
      grid[ty][tx] = tile
    }
  }
}

// Polilínea trazada a mano (camino, río, pasarela). Se dibuja en L
// (primero en x, luego en y) con el grosor pedido.
function paintPath(grid, pathDef, protectedCells) {
  const { tile, points, width = 2 } = pathDef
  const half = Math.floor(width / 2)

  function stamp(x, y) {
    for (let dy = -half; dy <= width - 1 - half; dy += 1) {
      for (let dx = -half; dx <= width - 1 - half; dx += 1) {
        if (!inBounds(grid, x + dx, y + dy)) continue
        grid[y + dy][x + dx] = tile
        // Un camino trazado a mano es estructura: la decoración sembrada
        // más abajo nunca puede caer encima y cortar el paso.
        protectedCells.add(`${x + dx},${y + dy}`)
      }
    }
  }

  for (let i = 0; i < points.length - 1; i += 1) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[i + 1]
    const stepX = Math.sign(x2 - x1)
    for (let x = x1; x !== x2 + stepX && stepX !== 0; x += stepX) stamp(x, y1)
    const stepY = Math.sign(y2 - y1)
    for (let y = y1; y !== y2 + stepY && stepY !== 0; y += stepY) stamp(x2, y)
  }
  const [lastX, lastY] = points[points.length - 1]
  stamp(lastX, lastY)
}

// Orillas automáticas: todo tile `from` que toque un tile de `around`
// pasa a ser `tile`. Es lo que evita "agua sin orilla" y "lava pegada al
// pasto" sin tener que dibujar cada borde a mano.
export function applyEdges(grid, edge, protectedCells = new Set()) {
  const around = new Set(edge.around)
  const from = new Set(edge.from)
  const result = []
  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < grid[0].length; x += 1) {
      if (!from.has(grid[y][x])) continue
      // Los caminos autorados ganan sobre la orilla automática: un
      // sendero que llega al agua sigue siendo sendero (y el puente o la
      // escalera se pone a mano en `overlay`).
      if (protectedCells.has(`${x},${y}`)) continue
      const touches = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ].some(([nx, ny]) => inBounds(grid, nx, ny) && around.has(grid[ny][nx]))
      if (touches) result.push([x, y])
    }
  }
  for (const [x, y] of result) grid[y][x] = edge.tile
}

export function composeMap(recipe) {
  const {
    id,
    name,
    width,
    height,
    seed,
    base,
    border,
    spawn,
    encounterZoneId,
    ambience = id,
    areas = [],
    paths = [],
    edges = [],
    scatter = [],
    overlay = [],
    portals = [],
  } = recipe

  const random = createRandom(seed)
  const grid = Array.from({ length: height }, () => Array.from({ length: width }, () => base))

  // 1. Marco infranqueable del mapa (árboles, roca, pared de cueva...).
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const onEdge = x === 0 || y === 0 || x === width - 1 || y === height - 1
      // Segunda fila de marco solo arriba: da profundidad al horizonte,
      // igual que el borde de copas de las referencias.
      if (onEdge || y === 1) grid[y][x] = border
    }
  }

  // 2. Estructura declarada a mano.
  for (const area of areas) paintArea(grid, area, random)
  const protectedCells = new Set()
  for (const pathDef of paths) paintPath(grid, pathDef, protectedCells)
  for (const edge of edges) applyEdges(grid, edge, protectedCells)

  // 3. Decoración sembrada: solo sobre los tiles que la receta permite.
  for (const { tile, on, density } of scatter) {
    const allowed = new Set(on)
    for (let y = 2; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        if (protectedCells.has(`${x},${y}`)) continue
        if (!allowed.has(grid[y][x])) continue
        if (random() < density) grid[y][x] = tile
      }
    }
  }

  // 4. Remates puestos a mano DESPUÉS del ruido (señales, puertas,
  // puentes, la salida): nada sembrado puede taparlos ni bloquearlos.
  for (const { tile, x, y } of overlay) {
    if (inBounds(grid, x, y)) grid[y][x] = tile
  }

  return { id, name, width, height, spawn, encounterZoneId, ambience, portals, baseTile: base, tiles: grid }
}
