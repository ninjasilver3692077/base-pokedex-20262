// Registro de tipos de tile del mundo: puro, sin React ni llamadas a red.
// Cada tipo declara si el jugador puede pisarlo y si puede disparar un
// encuentro salvaje. Un tile desconocido cae a "grass" en vez de romper
// el render, mismo criterio defensivo que gameStorage.loadGameState.
//
// `encounter: true` es la ÚNICA fuente de verdad de dónde aparecen
// Pokémon salvajes: la consume shouldTriggerEncounter() en encounters.js.
// Caminos, agua, árboles y edificios nunca la tienen.
export const TILE_TYPES = {
  // --- base común ---
  grass: { walkable: true, encounter: false, className: 'tile-grass' },
  'tall-grass': { walkable: true, encounter: true, className: 'tile-tall-grass' },
  dirt: { walkable: true, encounter: false, className: 'tile-dirt' },
  sand: { walkable: true, encounter: false, className: 'tile-sand' },
  water: { walkable: false, encounter: false, className: 'tile-water' },
  'deep-water': { walkable: false, encounter: false, className: 'tile-deep-water' },
  rock: { walkable: false, encounter: false, className: 'tile-rock' },
  tree: { walkable: false, encounter: false, className: 'tile-tree' },
  'tree-tall': { walkable: false, encounter: false, className: 'tile-tree-tall' },
  bush: { walkable: false, encounter: false, className: 'tile-bush' },
  flower: { walkable: true, encounter: false, className: 'tile-flower' },
  'flower-blue': { walkable: true, encounter: false, className: 'tile-flower-blue' },
  cliff: { walkable: false, encounter: false, className: 'tile-cliff' },
  stairs: { walkable: true, encounter: false, className: 'tile-stairs' },
  bridge: { walkable: true, encounter: false, className: 'tile-bridge' },
  building: { walkable: false, encounter: false, className: 'tile-building' },
  'building-door': { walkable: false, encounter: false, className: 'tile-building-door' },
  roof: { walkable: false, encounter: false, className: 'tile-roof' },
  fence: { walkable: false, encounter: false, className: 'tile-fence' },
  sign: { walkable: false, encounter: false, className: 'tile-sign' },
  // Salida hacia otra región. Es transitable a propósito: pisarla es lo
  // que dispara el viaje (ver `portals` en la definición del mapa).
  gate: { walkable: true, encounter: false, className: 'tile-gate' },

  // --- biomas ---
  snow: { walkable: true, encounter: false, className: 'tile-snow' },
  'snow-grass': { walkable: true, encounter: true, className: 'tile-snow-grass' },
  'snow-tree': { walkable: false, encounter: false, className: 'tile-snow-tree' },
  ice: { walkable: true, encounter: false, className: 'tile-ice' },
  lava: { walkable: false, encounter: false, className: 'tile-lava' },
  basalt: { walkable: true, encounter: false, className: 'tile-basalt' },
  ash: { walkable: true, encounter: true, className: 'tile-ash' },
  'cave-entrance': { walkable: true, encounter: false, className: 'tile-cave-entrance' },
  'cave-floor': { walkable: true, encounter: true, className: 'tile-cave-floor' },
  'cave-wall': { walkable: false, encounter: false, className: 'tile-cave-wall' },
  metal: { walkable: true, encounter: false, className: 'tile-metal' },
  'metal-grate': { walkable: true, encounter: true, className: 'tile-metal-grate' },
  machine: { walkable: false, encounter: false, className: 'tile-machine' },
  pylon: { walkable: false, encounter: false, className: 'tile-pylon' },
  dune: { walkable: true, encounter: true, className: 'tile-dune' },
  cactus: { walkable: false, encounter: false, className: 'tile-cactus' },
  ruins: { walkable: false, encounter: false, className: 'tile-ruins' },
  'sea-foam': { walkable: true, encounter: true, className: 'tile-sea-foam' },
}

export function getTileDef(tileType) {
  return TILE_TYPES[tileType] ?? TILE_TYPES.grass
}

export function isWalkable(tileType) {
  return getTileDef(tileType).walkable
}

export function isEncounterTile(tileType) {
  return getTileDef(tileType).encounter
}
