import assert from 'node:assert/strict'
import { getPokemon, getType } from '../src/api/pokemonService.js'
import { getSpecies, getSpeciesList } from '../src/api/speciesService.js'
import { PokeApiError } from '../src/api/pokeApi.js'

async function main() {
  const pikachu = await getPokemon('pikachu')
  assert.equal(pikachu.name, 'pikachu')
  assert.ok(Array.isArray(pikachu.types) && pikachu.types.length > 0)

  const pikachuSpecies = await getSpecies('pikachu')
  assert.equal(pikachuSpecies.name, 'pikachu')
  assert.ok(typeof pikachuSpecies.capture_rate === 'number')

  const speciesPage = await getSpeciesList({ limit: 1 })
  assert.ok(speciesPage.count > 0)
  assert.equal(speciesPage.results.length, 1)

  const electric = await getType('electric')
  assert.ok(Array.isArray(electric.pokemon) && electric.pokemon.length > 0)

  const cachedA = await getPokemon('pikachu')
  const cachedB = await getPokemon('pikachu')
  assert.equal(cachedA, cachedB, 'las peticiones repetidas deben servirse desde cache (misma referencia)')

  await assert.rejects(
    () => getPokemon('esto-no-existe-123456'),
    (error) => {
      assert.ok(error instanceof PokeApiError)
      assert.equal(error.status, 404)
      return true
    },
  )

  console.log('OK: capa de PokéAPI (fetch, errores, cache) verificada contra la API real.')
}

main().catch((error) => {
  console.error('FALLÓ la verificación de la capa de PokéAPI:', error)
  process.exitCode = 1
})
