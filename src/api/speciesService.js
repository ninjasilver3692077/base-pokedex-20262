import { apiGet } from './pokeApi.js'

export function getSpeciesList({ limit = 100, offset = 0 } = {}) {
  return apiGet(`/pokemon-species?limit=${limit}&offset=${offset}`)
}

export function getSpecies(idOrName) {
  return apiGet(`/pokemon-species/${idOrName}`)
}
