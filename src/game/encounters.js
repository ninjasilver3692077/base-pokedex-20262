import { getType } from '../api/pokemonService.js'

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
