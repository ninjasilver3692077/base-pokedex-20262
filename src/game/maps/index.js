import { CENTRAL_TOWN_MAP } from './central-town.js'
import { REGION_MAPS } from './regions.js'

// Registro único de mapas jugables. Todo lo que necesita "el mapa de X"
// (la pantalla de mundo, los portales, los scripts de verificación) pasa
// por acá en vez de importar un archivo concreto.
export const MAPS = [CENTRAL_TOWN_MAP, ...REGION_MAPS]

export const STARTING_MAP_ID = CENTRAL_TOWN_MAP.id

export function getMapById(id) {
  return MAPS.find((map) => map.id === id) ?? null
}
