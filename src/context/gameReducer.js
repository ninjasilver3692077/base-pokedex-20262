// Reducer puro (sin React) para que sea trivial de verificar con un script
// de Node plano. La integración con React vive en GameContext.jsx.
import { createInitialGameState } from '../utils/gameStorage.js'

export const GAME_ACTIONS = {
  DISCOVER_POKEMON: 'DISCOVER_POKEMON',
  CAPTURE_POKEMON: 'CAPTURE_POKEMON',
  SELECT_POKEMON: 'SELECT_POKEMON',
  SET_STARTER: 'SET_STARTER',
  RESET_GAME: 'RESET_GAME',
}

function addUnique(list, id) {
  return list.includes(id) ? list : [...list, id]
}

export function gameReducer(state, action) {
  switch (action.type) {
    case GAME_ACTIONS.DISCOVER_POKEMON:
      return { ...state, discoveredPokemonIds: addUnique(state.discoveredPokemonIds, action.id) }

    // Capturar implica haber descubierto: nunca queda captured sin discovered.
    case GAME_ACTIONS.CAPTURE_POKEMON:
      return {
        ...state,
        discoveredPokemonIds: addUnique(state.discoveredPokemonIds, action.id),
        capturedPokemonIds: addUnique(state.capturedPokemonIds, action.id),
      }

    case GAME_ACTIONS.SELECT_POKEMON:
      return { ...state, selectedPokemonId: action.id }

    case GAME_ACTIONS.SET_STARTER:
      return { ...state, starterPokemonId: action.id }

    case GAME_ACTIONS.RESET_GAME:
      return createInitialGameState()

    default:
      return state
  }
}
