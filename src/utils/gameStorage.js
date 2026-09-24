export const STORAGE_KEY = 'pokemon-expedition:save'
export const CURRENT_VERSION = 3
// v2 -> v3 solo añadió activePokemonId, así que un save v2 se migra (ver
// normalizeGameState) en vez de descartarse.
const MIGRATABLE_VERSIONS = [2, CURRENT_VERSION]

export function createInitialGameState() {
  return {
    version: CURRENT_VERSION,
    starterPokemonId: null,
    discoveredPokemonIds: [],
    capturedPokemonIds: [],
    selectedPokemonId: null,
    // Pokémon que pelea por el jugador. Siempre uno de capturedPokemonIds
    // (o null antes de elegir starter). Un solo compañero por ahora: el
    // equipo de seis podrá vivir en teamPokemonIds sin tocar este campo.
    activePokemonId: null,
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
      MIGRATABLE_VERSIONS.includes(parsed.version) &&
      Array.isArray(parsed.discoveredPokemonIds) &&
      Array.isArray(parsed.capturedPokemonIds)

    if (!isValid) return createInitialGameState()

    return normalizeGameState(parsed)
  } catch {
    return createInitialGameState()
  }
}

// Compañero válido para un estado dado: el guardado si sigue capturado; si
// no (save antiguo o corrupto), el starter; si tampoco, el primer capturado.
export function resolveActivePokemonId(state) {
  const captured = state.capturedPokemonIds
  if (captured.includes(state.activePokemonId)) return state.activePokemonId
  if (captured.includes(state.starterPokemonId)) return state.starterPokemonId
  return captured[0] ?? null
}

export function normalizeGameState(parsed) {
  const state = { ...createInitialGameState(), ...parsed, version: CURRENT_VERSION }
  return { ...state, activePokemonId: resolveActivePokemonId(state) }
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
