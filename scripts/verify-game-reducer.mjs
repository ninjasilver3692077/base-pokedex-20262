import assert from 'node:assert/strict'
import { gameReducer, GAME_ACTIONS } from '../src/context/gameReducer.js'
import { createInitialGameState } from '../src/utils/gameStorage.js'

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

  console.log('OK: gameReducer (descubrir, capturar, seleccionar, starter, reset) verificado.')
}

main()
