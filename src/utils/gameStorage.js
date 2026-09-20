export const STORAGE_KEY = 'pokemon-expedition:save'
export const CURRENT_VERSION = 2

export function createInitialGameState() {
  return {
    version: CURRENT_VERSION,
    starterPokemonId: null,
    discoveredPokemonIds: [],
    capturedPokemonIds: [],
    selectedPokemonId: null,
    teamPokemonIds: [],
    // Fase 11D: estado del mundo/jugador. Sin migración desde version 1
    // (mismo criterio que ya tenía loadGameState: un save de una versión
    // antigua cae al estado inicial en vez de romper la app).
    mode: 'world', // 'world' | 'battle' | 'menu'
    currentRegionId: null,
    playerPosition: { x: 0, y: 0 },
    playerDirection: 'down',
    lastWorldPosition: null, // { regionId, x, y } — snapshot antes de entrar a batalla
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
