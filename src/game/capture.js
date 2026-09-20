// Fórmula de captura deliberadamente simple y generosa (no la fórmula
// competitiva real de los juegos): combina cuánto HP le queda al rival con
// su capture_rate real de pokemon-species y un factor aleatorio. Pensada
// para que capturar sea accesible, nunca una probabilidad frustrantemente
// baja, y que siga siendo explicable en una frase: 20% base, hasta +50%
// según el HP restante, hasta +30% según lo fácil que sea la especie,
// siempre entre 10% y 95%.
const BASE_CHANCE = 0.2
const HP_WEIGHT = 0.5
const CAPTURE_RATE_WEIGHT = 0.3
const MIN_CHANCE = 0.1
const MAX_CHANCE = 0.95
const MAX_CAPTURE_RATE = 255

export function getCaptureChance(enemyHp, enemyMaxHp, captureRate) {
  const hpFactor = enemyMaxHp > 0 ? 1 - enemyHp / enemyMaxHp : 1
  const rateFactor = Math.max(0, Math.min(1, captureRate / MAX_CAPTURE_RATE))
  const chance = BASE_CHANCE + hpFactor * HP_WEIGHT + rateFactor * CAPTURE_RATE_WEIGHT
  return Math.max(MIN_CHANCE, Math.min(MAX_CHANCE, chance))
}

export function attemptCapture(enemyHp, enemyMaxHp, captureRate) {
  const chance = getCaptureChance(enemyHp, enemyMaxHp, captureRate)
  return Math.random() < chance
}
