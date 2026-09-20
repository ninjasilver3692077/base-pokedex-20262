export const STORAGE_KEY = 'pokemon-expedition:save'
export const CURRENT_VERSION = 1

export function createInitialGameState() {
  return {
    version: CURRENT_VERSION,
    starterPokemonId: null,
    discoveredPokemonIds: [],
    capturedPokemonIds: [],
    selectedPokemonId: null,
    teamPokemonIds: [],
  }
}

// Cualquier dato ausente, corrupto o de una versión antigua cae de vuelta al
// estado inicial en lugar de romper la app.
export function loadGameState() {
  if (typeof localStorage === 'undefined') return createInitialGameState()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialGameState()

    const parsed = JSON.parse(raw)
    const isValid =
      parsed &&
      parsed.version === CURRENT_VERSION &&
      Array.isArray(parsed.discoveredPokemonIds) &&
      Array.isArray(parsed.capturedPokemonIds)

    if (!isValid) return createInitialGameState()

    return { ...createInitialGameState(), ...parsed }
  } catch {
    return createInitialGameState()
  }
}

export function saveGameState(state) {
  if (typeof localStorage === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage puede fallar (modo privado, cuota excedida, etc.); el
    // progreso simplemente no persiste en ese caso, sin romper la app.
  }
}
