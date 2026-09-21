import { getType } from '../api/pokemonService.js'
import { isEncounterTile } from './tiles.js'

// Resuelve las especies candidatas de una zona cruzando sus tipos
// permitidos (regla propia del juego, ver zones.js) con el catálogo real
// de especies de PokéAPI (Map<nombre, {id, name}>).
//
// /type/{name} devuelve TODAS las formas con ese tipo, incluidas variantes
// (p. ej. "charizard-mega-x", "raichu-alola"). Esos nombres no coinciden
// exactamente con ninguna especie de pokemon-species, así que quedan
// excluidos automáticamente sin pedir detalle por Pokémon: no hace falta
// resolver formas una por una. Una especie con varios tipos de la zona no
// se duplica (se acumula en un Set antes de mapear a especie).
export async function getCandidateSpecies(zone, speciesByName) {
  const candidateNames = new Set()

  for (const typeName of zone.types) {
    const typeData = await getType(typeName)
    for (const entry of typeData.pokemon) {
      candidateNames.add(entry.pokemon.name)
    }
  }

  const candidates = []
  for (const name of candidateNames) {
    const species = speciesByName.get(name)
    if (species) candidates.push(species)
  }

  return candidates
}

export function pickRandomCandidate(candidates) {
  if (candidates.length === 0) return null
  const index = Math.floor(Math.random() * candidates.length)
  return candidates[index]
}

// --- Regla de encuentro al caminar (pura, sin React) -------------------
//
// Un paso solo puede generar un encuentro si el tile pisado lo permite
// (tiles.js: tall-grass, ash, dune, cave-floor, ...). Nunca en caminos,
// puentes, agua ni dentro de un pueblo. Además exige un cooldown de
// pasos desde el último encuentro, para que salir de una batalla no
// dispare otra inmediatamente al primer paso de vuelta.
export const ENCOUNTER_CHANCE = 0.18
export const ENCOUNTER_COOLDOWN_STEPS = 6

export function shouldTriggerEncounter(tileType, stepsSinceLastEncounter, random = Math.random) {
  if (!isEncounterTile(tileType)) return false
  if (stepsSinceLastEncounter < ENCOUNTER_COOLDOWN_STEPS) return false
  return random() < ENCOUNTER_CHANCE
}
