import assert from 'node:assert/strict'
import { getCaptureChance, attemptCapture } from '../src/game/capture.js'
import { createBattleState, resolveTurn } from '../src/game/battle.js'

const mockEnemy = {
  name: 'mock-enemy',
  stats: [
    { stat: { name: 'hp' }, base_stat: 50 },
    { stat: { name: 'attack' }, base_stat: 60 },
  ],
}

function withMockRandom(sequence, fn) {
  const original = Math.random
  let index = 0
  Math.random = () => sequence[index++ % sequence.length]
  try {
    return fn()
  } finally {
    Math.random = original
  }
}

function main() {
  // HP bajo debe aumentar la probabilidad respecto a HP alto (mismo capture_rate).
  const chanceFullHp = getCaptureChance(50, 50, 45)
  const chanceLowHp = getCaptureChance(5, 50, 45)
  assert.ok(chanceLowHp > chanceFullHp, 'menos HP restante debe aumentar la probabilidad')

  // Mayor capture_rate debe aumentar la probabilidad (mismo HP).
  const chanceEasy = getCaptureChance(50, 50, 255)
  const chanceHard = getCaptureChance(50, 50, 3)
  assert.ok(chanceEasy > chanceHard, 'mayor capture_rate debe aumentar la probabilidad')

  // Nunca debe salir de los límites, ni con datos extremos: nada de
  // probabilidades "extremadamente bajas" que frustren al jugador.
  assert.ok(chanceHard >= 0.1, 'la probabilidad nunca debe bajar del mínimo')
  assert.ok(getCaptureChance(1, 1000, 255) <= 0.95, 'la probabilidad nunca debe superar el máximo')

  // attemptCapture: una tirada baja siempre gana, una tirada alta con poca
  // probabilidad siempre falla.
  withMockRandom([0], () => {
    assert.equal(attemptCapture(10, 100, 200), true)
  })
  withMockRandom([0.999], () => {
    assert.equal(attemptCapture(100, 100, 3), false)
  })

  // Integración con el motor de batalla: captura exitosa termina el
  // combate sin dejar contraatacar al rival.
  const initial = createBattleState(mockEnemy)
  const captured = withMockRandom([0], () => resolveTurn(initial, 'pokeball', mockEnemy, 255))
  assert.equal(captured.outcome, 'captured')
  assert.equal(captured.playerHp, initial.playerHp, 'sin contraataque tras una captura exitosa')

  // Captura fallida: el combate continúa y el rival contraataca.
  const missed = withMockRandom([0.999, 0], () => resolveTurn(initial, 'pokeball', mockEnemy, 3))
  assert.equal(missed.outcome, null, 'una captura fallida debe permitir continuar el combate')
  assert.ok(missed.playerHp < initial.playerHp, 'tras fallar la captura el rival contraataca')

  console.log('OK: fórmula de captura (HP, capture_rate, límites) y su integración con la batalla verificadas.')
}

main()
