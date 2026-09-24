import assert from 'node:assert/strict'
import { gameReducer, GAME_ACTIONS } from '../src/context/gameReducer.js'
import { createInitialGameState, normalizeGameState } from '../src/utils/gameStorage.js'

function main() {
  let state = createInitialGameState()

  state = gameReducer(state, { type: GAME_ACTIONS.DISCOVER_POKEMON, id: 25 })
  assert.deepEqual(state.discoveredPokemonIds, [25])
  assert.deepEqual(state.capturedPokemonIds, [])

  // Idempotente: descubrir dos veces no duplica.
  state = gameReducer(state, { type: GAME_ACTIONS.DISCOVER_POKEMON, id: 25 })
  assert.deepEqual(state.discoveredPokemonIds, [25])

  state = gameReducer(state, { type: GAME_ACTIONS.CAPTURE_POKEMON, id: 1 })
  assert.deepEqual(state.capturedPokemonIds, [1])
  assert.ok(state.discoveredPokemonIds.includes(1), 'capturar implica descubrir')
  assert.deepEqual(state.discoveredPokemonIds, [25, 1])

  state = gameReducer(state, { type: GAME_ACTIONS.SELECT_POKEMON, id: 1 })
  assert.equal(state.selectedPokemonId, 1)

  state = gameReducer(state, { type: GAME_ACTIONS.SET_STARTER, id: 4 })
  assert.equal(state.starterPokemonId, 4)

  const unknownActionState = gameReducer(state, { type: 'NOT_A_REAL_ACTION' })
  assert.equal(unknownActionState, state, 'acciones desconocidas no deben mutar el estado')

  const resetState = gameReducer(state, { type: GAME_ACTIONS.RESET_GAME })
  assert.deepEqual(resetState, createInitialGameState())

  // Compañero equipado: el starter nace descubierto, capturado y equipado.
  let party = gameReducer(createInitialGameState(), { type: GAME_ACTIONS.SET_STARTER, id: 7 })
  assert.equal(party.activePokemonId, 7)
  assert.deepEqual(party.capturedPokemonIds, [7])
  assert.deepEqual(party.discoveredPokemonIds, [7])

  // Capturar no reemplaza al compañero.
  party = gameReducer(party, { type: GAME_ACTIONS.CAPTURE_POKEMON, id: 25 })
  assert.equal(party.activePokemonId, 7)

  // Equipar un capturado cambia el compañero.
  party = gameReducer(party, { type: GAME_ACTIONS.EQUIP_POKEMON, id: 25 })
  assert.equal(party.activePokemonId, 25)

  // Ni visto ni desconocido se pueden equipar.
  party = gameReducer(party, { type: GAME_ACTIONS.DISCOVER_POKEMON, id: 16 })
  assert.equal(gameReducer(party, { type: GAME_ACTIONS.EQUIP_POKEMON, id: 16 }), party)
  assert.equal(gameReducer(party, { type: GAME_ACTIONS.EQUIP_POKEMON, id: 999 }), party)

  // Save v2 sin activePokemonId: starter como fallback, versión subida.
  const oldSave = { version: 2, starterPokemonId: 4, discoveredPokemonIds: [4, 1], capturedPokemonIds: [1, 4] }
  const migrated = normalizeGameState(oldSave)
  assert.equal(migrated.activePokemonId, 4)
  assert.equal(migrated.version, createInitialGameState().version)
  // Starter inválido: primer capturado. Nada capturado: null.
  assert.equal(normalizeGameState({ ...oldSave, starterPokemonId: 99 }).activePokemonId, 1)
  assert.equal(normalizeGameState({ ...oldSave, capturedPokemonIds: [] }).activePokemonId, null)
  // Un activo guardado que ya no está capturado no se respeta.
  assert.equal(normalizeGameState({ ...oldSave, version: 3, activePokemonId: 150 }).activePokemonId, 4)

  // Fase 11D: mundo/jugador.
  let world = createInitialGameState()

  world = gameReducer(world, { type: GAME_ACTIONS.ENTER_REGION, regionId: 'central-town', x: 6, y: 8 })
  assert.equal(world.currentRegionId, 'central-town')
  assert.deepEqual(world.playerPosition, { x: 6, y: 8 })

  world = gameReducer(world, { type: GAME_ACTIONS.MOVE_PLAYER, x: 6, y: 7, direction: 'up' })
  assert.deepEqual(world.playerPosition, { x: 6, y: 7 })
  assert.equal(world.playerDirection, 'up')

  world = gameReducer(world, { type: GAME_ACTIONS.SET_MODE, mode: 'menu' })
  assert.equal(world.mode, 'menu')

  // ENTER_BATTLE debe snapshotear dónde estaba el jugador antes de pelear.
  world = gameReducer(world, { type: GAME_ACTIONS.ENTER_BATTLE })
  assert.equal(world.mode, 'battle')
  assert.deepEqual(world.lastWorldPosition, { regionId: 'central-town', x: 6, y: 7 })

  // El jugador se mueve "dentro" de la batalla (no debería pasar en la UI
  // real, pero el reducer no lo impide) para probar que EXIT_BATTLE
  // restaura la posición snapshoteada, no la actual.
  world = gameReducer(world, { type: GAME_ACTIONS.MOVE_PLAYER, x: 0, y: 0, direction: 'left' })
  world = gameReducer(world, { type: GAME_ACTIONS.EXIT_BATTLE })
  assert.equal(world.mode, 'world')
  assert.equal(world.currentRegionId, 'central-town')
  assert.deepEqual(world.playerPosition, { x: 6, y: 7 }, 'debe restaurar la posición previa a la batalla, no la actual')

  // EXIT_BATTLE sin lastWorldPosition (nunca se entró a batalla) no debe romper.
  const freshExit = gameReducer(createInitialGameState(), { type: GAME_ACTIONS.EXIT_BATTLE })
  assert.equal(freshExit.mode, 'world')

  console.log('OK: gameReducer (descubrir, capturar, seleccionar, starter, equipar, migración, reset, mundo/jugador) verificado.')
}

main()
