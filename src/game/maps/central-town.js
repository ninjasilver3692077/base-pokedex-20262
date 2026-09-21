import { applyEdges, fromRows } from './compose.js'

// Central Town, autorado tile a tile (31x22). La composición sigue el
// lenguaje de las referencias: borde de copas de árbol cerrando el
// horizonte, un centro Pokémon con tejado y puerta, vallas delimitando
// el patio, un estanque con orilla de arena, un río cruzado por un
// puente, plaza de tierra conectando las cuatro salidas y campos de
// hierba alta SOLO al sur del río (el pueblo no genera encuentros).
//
// Cada 'G' es una salida física hacia otra región: pisarla viaja (ver
// `portals`). Leyenda de caracteres en compose.js.
const TILES = fromRows([
  'TTTTTTTTTTTTTTGTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTT:TTTTTTTTTTTTTTTT',
  'T.....TT......:......TT......YT',
  'T.f...TT..b...:..b...TT...f...T',
  'T..........RRRRRR...........bYT',
  'T...sss....RRRRRR.....b.......T',
  'T..s~~~s...BBDDBB......YY.....T',
  'T..s~~~s...BB::BB...b..YY.....T',
  'T...sss.##.##::##.##..........T',
  'T.......::::::::::::::::::::::G',
  'T..b....:.....::.....:.......bT',
  'T.......:..f..::..F..:........T',
  'T..b....s.....ss.....s...,,,..T',
  'T~~~~~~~~~~~~~==~~~~~~~~~~~~~~T',
  'T..,,,..s.....ss.....s..,,,,..T',
  'G.,,,,,.:.....::.....:..,,,,,.T',
  'T..,,,..:..r..::..r..:...,,,..T',
  'T.......::::::::::::::::......T',
  'T..YY........:::.!.......b....T',
  'T..YY...b....::......b.....f..T',
  'T............::...............T',
  'TTTTTTTTTTTTTGTTTTTTTTTTTTTTTTT',
])

// Orilla de arena en todo lo que toca el agua: el estanque y el río
// dejan de cortar el pasto a filo, que es el defecto más visible frente
// a las referencias. El puente y los caminos se autoran a mano, así que
// se pintan después de este pase (ver ROWS) y no se ven afectados.
applyEdges(TILES, { tile: 'sand', from: ['grass', 'flower'], around: ['water'] })

export const CENTRAL_TOWN_MAP = {
  id: 'central-town',
  name: 'Central Town',
  width: 31,
  height: 22,
  spawn: { x: 14, y: 10 },
  // El pueblo no tiene tiles de encuentro; la zona queda declarada para
  // los campos de hierba alta del sur del río.
  encounterZoneId: 'forest',
  ambience: 'town',
  baseTile: 'grass',
  tiles: TILES,
  portals: [
    { x: 14, y: 0, to: 'forest' },
    { x: 30, y: 9, to: 'mountain' },
    { x: 0, y: 15, to: 'ocean' },
    { x: 13, y: 21, to: 'desert' },
  ],
}
