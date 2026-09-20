import { apiGet } from './pokeApi.js'

export function getPokemon(idOrName) {
  return apiGet(`/pokemon/${idOrName}`)
}

export function getType(idOrName) {
  return apiGet(`/type/${idOrName}`)
}
