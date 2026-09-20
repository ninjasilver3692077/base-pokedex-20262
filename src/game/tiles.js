// Registro de tipos de tile del mundo: puro, sin React ni llamadas a red.
// Cada tipo declara si el jugador puede pisarlo y si puede disparar un
// encuentro salvaje (Fase 11F). Un tile desconocido cae a "grass" en vez
// de romper el render, mismo criterio defensivo que gameStorage.loadGameState.
export const TILE_TYPES = {
  grass: { walkable: true, encounter: false, className: 'tile-grass' },
  'tall-grass': { walkable: true, encounter: true, className: 'tile-tall-grass' },
  dirt: { walkable: true, encounter: false, className: 'tile-dirt' },
  sand: { walkable: true, encounter: false, className: 'tile-sand' },
  water: { walkable: false, encounter: false, className: 'tile-water' },
  rock: { walkable: false, encounter: false, className: 'tile-rock' },
  tree: { walkable: false, encounter: false, className: 'tile-tree' },
  flower: { walkable: true, encounter: false, className: 'tile-flower' },
  cliff: { walkable: false, encounter: false, className: 'tile-cliff' },
  bridge: { walkable: true, encounter: false, className: 'tile-bridge' },
  building: { walkable: false, encounter: false, className: 'tile-building' },
  fence: { walkable: false, encounter: false, className: 'tile-fence' },
  snow: { walkable: true, encounter: false, className: 'tile-snow' },
  ice: { walkable: true, encounter: false, className: 'tile-ice' },
  lava: { walkable: false, encounter: false, className: 'tile-lava' },
  'cave-entrance': { walkable: true, encounter: false, className: 'tile-cave-entrance' },
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
