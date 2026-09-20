import assert from 'node:assert/strict'
import { getCandidateSpecies, pickRandomCandidate } from '../src/game/encounters.js'
import { getSpeciesList } from '../src/api/speciesService.js'
import { getIdFromUrl } from '../src/utils/pokeapiId.js'
import { ZONES, getZoneById } from '../src/game/zones.js'

async function main() {
  // pickRandomCandidate: casos puros, sin red.
  assert.equal(pickRandomCandidate([]), null)
  const single = { id: 1, name: 'bulbasaur' }
  assert.equal(pickRandomCandidate([single]), single)

  // getCandidateSpecies contra la PokéAPI real, con el catálogo completo.
  const first = await getSpeciesList({ limit: 1, offset: 0 })
  const full = await getSpeciesList({ limit: first.count, offset: 0 })
  const speciesByName = new Map(
    full.results.map((species) => [species.name, { id: getIdFromUrl(species.url), name: species.name }]),
  )

  const powerPlant = getZoneById('power-plant')
  const candidates = await getCandidateSpecies(powerPlant, speciesByName)
  assert.ok(candidates.length > 0, 'Power Plant debería tener especies candidatas (electric/steel)')

  const ids = candidates.map((candidate) => candidate.id)
  assert.equal(new Set(ids).size, ids.length, 'no debe haber especies candidatas duplicadas')

  for (const candidate of candidates) {
    assert.ok(speciesByName.has(candidate.name), `${candidate.name} debe ser una especie real del catálogo`)
  }

  // Ninguna de las 8 zonas debe quedar sin especies candidatas.
  for (const zone of ZONES) {
    const zoneCandidates = await getCandidateSpecies(zone, speciesByName)
    assert.ok(zoneCandidates.length > 0, `${zone.name} no tiene especies candidatas`)
  }

  console.log('OK: motor de encuentros (candidatos por zona, sin duplicados, selección aleatoria) verificado.')
}

main().catch((error) => {
  console.error('FALLÓ la verificación del motor de encuentros:', error)
  process.exitCode = 1
})
