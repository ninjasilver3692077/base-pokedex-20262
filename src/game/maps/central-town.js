// Primer mapa jugable (semilla de la Fase 11C): 14x10, más grande que el
// viewport (11x9) a propósito para poder verificar visualmente el
// clamping de la cámara en los bordes. Contenido real de Central Town
// llega en la Fase 11E; esto valida el sistema de tiles/cámara.
const T = 'tree'
const G = 'grass'
const B = 'building'
const F = 'fence'
const D = 'dirt'
const W = 'water'
const TG = 'tall-grass'
const FL = 'flower'

export const CENTRAL_TOWN_MAP = {
  id: 'central-town',
  width: 14,
  height: 10,
  spawn: { x: 6, y: 8 },
  encounterZoneId: 'forest',
  tiles: [
    [T, T, T, T, T, T, T, T, T, T, T, T, T, T],
    [T, G, G, G, B, B, B, G, G, G, G, G, G, T],
    [T, G, G, G, B, B, B, G, FL, G, G, G, G, T],
    [T, G, FL, G, F, F, F, G, G, G, G, G, G, T],
    [T, G, G, D, D, D, D, D, D, D, G, G, G, T],
    [T, G, G, D, G, G, G, G, G, D, G, TG, TG, T],
    [T, W, W, D, G, TG, TG, G, G, D, G, TG, TG, T],
    [T, W, W, D, G, TG, TG, G, G, D, G, G, G, T],
    [T, G, G, D, D, D, D, D, D, D, G, G, G, T],
    [T, T, T, T, T, T, T, T, T, T, T, T, T, T],
  ],
}
