// Reducer puro (sin React) para que sea trivial de verificar con un script
// de Node plano. La integración con React vive en GameContext.jsx.
import { createInitialGameState } from '../utils/gameStorage.js'

export const GAME_ACTIONS = {
  DISCOVER_POKEMON: 'DISCOVER_POKEMON',
  CAPTURE_POKEMON: 'CAPTURE_POKEMON',
  SELECT_POKEMON: 'SELECT_POKEMON',
  SET_STARTER: 'SET_STARTER',
  EQUIP_POKEMON: 'EQUIP_POKEMON',
  RESET_GAME: 'RESET_GAME',
  ENTER_REGION: 'ENTER_REGION',
  MOVE_PLAYER: 'MOVE_PLAYER',
  SET_MODE: 'SET_MODE',
  ENTER_BATTLE: 'ENTER_BATTLE',
  EXIT_BATTLE: 'EXIT_BATTLE',
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

    // El starter nace descubierto, capturado y equipado en un solo paso.
    case GAME_ACTIONS.SET_STARTER:
      return {
        ...state,
        starterPokemonId: action.id,
        activePokemonId: action.id,
        discoveredPokemonIds: addUnique(state.discoveredPokemonIds, action.id),
        capturedPokemonIds: addUnique(state.capturedPokemonIds, action.id),
      }

    // Solo se puede equipar lo capturado; cualquier otro id se ignora.
    case GAME_ACTIONS.EQUIP_POKEMON:
      if (!state.capturedPokemonIds.includes(action.id)) return state
      return { ...state, activePokemonId: action.id }

    case GAME_ACTIONS.RESET_GAME:
      return createInitialGameState()

    case GAME_ACTIONS.ENTER_REGION:
      return { ...state, currentRegionId: action.regionId, playerPosition: { x: action.x, y: action.y } }

    case GAME_ACTIONS.MOVE_PLAYER:
      return { ...state, playerPosition: { x: action.x, y: action.y }, playerDirection: action.direction }

    case GAME_ACTIONS.SET_MODE:
      return { ...state, mode: action.mode }

    // Snapshotea dónde estaba el jugador en el mundo antes de entrar a
    // batalla, para poder restaurarlo exactamente con EXIT_BATTLE.
    case GAME_ACTIONS.ENTER_BATTLE:
      return {
        ...state,
        mode: 'battle',
        lastWorldPosition: { regionId: state.currentRegionId, ...state.playerPosition },
      }

    case GAME_ACTIONS.EXIT_BATTLE: {
      const back = state.lastWorldPosition
      return {
        ...state,
        mode: 'world',
        currentRegionId: back?.regionId ?? state.currentRegionId,
        playerPosition: back ? { x: back.x, y: back.y } : state.playerPosition,
      }
    }

    default:
      return state
  }
}
