import assert from 'node:assert/strict'
import {
  ENCOUNTER_COOLDOWN_STEPS,
  getCandidateSpecies,
  pickRandomCandidate,
  shouldTriggerEncounter,
} from '../src/game/encounters.js'
import { getSpeciesList } from '../src/api/speciesService.js'
import { getIdFromUrl } from '../src/utils/pokeapiId.js'
import { ZONES, getZoneById } from '../src/game/zones.js'

async function main() {
  // pickRandomCandidate: casos puros, sin red.
  assert.equal(pickRandomCandidate([]), null)
  const single = { id: 1, name: 'bulbasaur' }
  assert.equal(pickRandomCandidate([single]), single)

  // --- Regla de encuentro al caminar (pura, con random determinista) ---
  const alwaysHit = () => 0
  const neverHit = () => 0.999
  const walked = ENCOUNTER_COOLDOWN_STEPS

  // Solo los tiles marcados como zona de encuentro generan Pokémon.
  assert.equal(shouldTriggerEncounter('tall-grass', walked, alwaysHit), true)
  assert.equal(shouldTriggerEncounter('cave-floor', walked, alwaysHit), true)
  assert.equal(shouldTriggerEncounter('dune', walked, alwaysHit), true)

  // Caminos, agua, árboles y edificios nunca, por muy favorable que sea
  // la tirada: es lo que evita encuentros en medio del pueblo.
  for (const safeTile of ['dirt', 'water', 'tree', 'building', 'bridge', 'grass', 'gate']) {
    assert.equal(
      shouldTriggerEncounter(safeTile, walked, alwaysHit),
      false,
      `${safeTile} no debe poder generar un encuentro`,
    )
  }

  // Cooldown: recién salido de un combate no puede haber otro al primer paso.
  assert.equal(shouldTriggerEncounter('tall-grass', 0, alwaysHit), false)
  assert.equal(shouldTriggerEncounter('tall-grass', ENCOUNTER_COOLDOWN_STEPS - 1, alwaysHit), false)

  // Y no ocurre en cada paso: con una tirada alta no hay encuentro.
  assert.equal(shouldTriggerEncounter('tall-grass', walked, neverHit), false)

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
