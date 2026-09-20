export const STORAGE_KEY = 'pokemon-expedition:save'
export const CURRENT_VERSION = 1

function createInitialState() {
  return {
    version: CURRENT_VERSION,
    starterPokemonId: null,
    discoveredPokemonIds: [],
    capturedPokemonIds: [],
    selectedPokemonId: null,
    teamPokemonIds: [],
  }
}

// Solo lectura por ahora: la Fase 4 añade el escritor (GameContext + reducer)
// sobre esta misma forma versionada. Cualquier dato ausente, corrupto o de una
// versión antigua cae de vuelta al estado inicial en lugar de romper la app.
export function loadGameState() {
  if (typeof localStorage === 'undefined') return createInitialState()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()

    const parsed = JSON.parse(raw)
    const isValid =
      parsed &&
      parsed.version === CURRENT_VERSION &&
      Array.isArray(parsed.discoveredPokemonIds) &&
      Array.isArray(parsed.capturedPokemonIds)

    if (!isValid) return createInitialState()

    return { ...createInitialState(), ...parsed }
  } catch {
    return createInitialState()
  }
}
