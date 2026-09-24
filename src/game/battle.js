// Motor de batalla puro (sin React, sin llamadas a API): recibe el
// Pokémon rival ya cargado y produce/actualiza un estado de combate.
// Deliberadamente simple: sin IV/EV/naturalezas/PP/precisión/clima/tipos.
import { attemptCapture } from './capture.js'

export const PLAYER_MAX_HP = 100

const PLAYER_ATTACK_MIN = 10
const PLAYER_ATTACK_MAX = 18
const PLAYER_SPECIAL_MIN = 4
const PLAYER_SPECIAL_MAX = 26
const ENEMY_ATTACK_MIN = 5
const ENEMY_ATTACK_MAX = 12

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getBaseStat(pokemon, statName, fallback) {
  const stat = pokemon.stats.find((entry) => entry.stat.name === statName)
  return stat ? stat.base_stat : fallback
}

export function getEnemyMaxHp(enemyPokemon) {
  return getBaseStat(enemyPokemon, 'hp', 50)
}

export function createBattleState(enemyPokemon) {
  const enemyMaxHp = getEnemyMaxHp(enemyPokemon)
  return {
    playerHp: PLAYER_MAX_HP,
    playerMaxHp: PLAYER_MAX_HP,
    enemyHp: enemyMaxHp,
    enemyMaxHp,
    outcome: null, // null | 'enemyFainted' | 'playerDefeated' | 'fled'
    log: [],
  }
}

// Mismo bono que el contraataque rival (stat/15): el compañero equipado
// pega según sus stats reales de PokéAPI sin cambiar las reglas del
// minijuego. Sin Pokémon del jugador (tests antiguos) el bono es 0.
function statBonus(pokemon, statName) {
  return pokemon ? Math.floor(getBaseStat(pokemon, statName, 0) / 15) : 0
}

function playerAttack(state, playerPokemon) {
  const damage = randomInt(PLAYER_ATTACK_MIN, PLAYER_ATTACK_MAX) + statBonus(playerPokemon, 'attack')
  return {
    ...state,
    enemyHp: Math.max(0, state.enemyHp - damage),
    log: [...state.log, `Atacaste e hiciste ${damage} de daño.`],
  }
}

function playerSpecial(state, playerPokemon) {
  const damage = randomInt(PLAYER_SPECIAL_MIN, PLAYER_SPECIAL_MAX) + statBonus(playerPokemon, 'special-attack')
  return {
    ...state,
    enemyHp: Math.max(0, state.enemyHp - damage),
    log: [...state.log, `Usaste un ataque especial e hiciste ${damage} de daño.`],
  }
}

function enemyCounterAttack(state, enemyPokemon) {
  const attackStat = getBaseStat(enemyPokemon, 'attack', 50)
  const damage = randomInt(ENEMY_ATTACK_MIN, ENEMY_ATTACK_MAX) + Math.floor(attackStat / 15)
  return {
    ...state,
    playerHp: Math.max(0, state.playerHp - damage),
    log: [...state.log, `El rival contraatacó e hizo ${damage} de daño.`],
  }
}

// Captura exitosa termina el combate de inmediato (sin contraataque).
// Captura fallida solo dice el mensaje: el combate sigue su curso normal.
function throwPokeball(state, captureRate) {
  const success = attemptCapture(state.enemyHp, state.enemyMaxHp, captureRate)
  if (success) {
    return { ...state, outcome: 'captured', log: [...state.log, '¡Capturaste al Pokémon salvaje!'] }
  }
  return { ...state, log: [...state.log, 'La Pokéball no logró capturar al Pokémon salvaje.'] }
}

export function resolveTurn(state, action, enemyPokemon, captureRate, playerPokemon = null) {
  if (state.outcome) return state

  if (action === 'run') {
    return { ...state, outcome: 'fled', log: [...state.log, 'Huiste del combate.'] }
  }

  let next = state
  if (action === 'attack') next = playerAttack(next, playerPokemon)
  else if (action === 'special') next = playerSpecial(next, playerPokemon)
  else if (action === 'pokeball') next = throwPokeball(next, captureRate)

  if (next.outcome === 'captured') {
    return next
  }

  if (next.enemyHp <= 0) {
    return { ...next, outcome: 'enemyFainted' }
  }

  next = enemyCounterAttack(next, enemyPokemon)

  if (next.playerHp <= 0) {
    return { ...next, outcome: 'playerDefeated' }
  }

  return next
}
