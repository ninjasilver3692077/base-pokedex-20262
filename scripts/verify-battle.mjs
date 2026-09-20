import assert from 'node:assert/strict'
import { createBattleState, resolveTurn } from '../src/game/battle.js'

const mockEnemy = {
  name: 'mock-enemy',
  stats: [
    { stat: { name: 'hp' }, base_stat: 40 },
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
  // El HP máximo/actual del rival sale del stat real "hp" de PokéAPI, no de un valor inventado.
  const initial = createBattleState(mockEnemy)
  assert.equal(initial.enemyHp, 40)
  assert.equal(initial.enemyMaxHp, 40)
  assert.equal(initial.playerHp, initial.playerMaxHp)
  assert.equal(initial.outcome, null)

  // Run termina el combate sin tocar HP.
  const fled = resolveTurn(initial, 'run', mockEnemy)
  assert.equal(fled.outcome, 'fled')
  assert.equal(fled.enemyHp, 40)
  assert.equal(fled.playerHp, initial.playerHp)

  // Con el combate ya terminado, resolveTurn no debe cambiar nada más.
  const afterFled = resolveTurn(fled, 'attack', mockEnemy)
  assert.deepEqual(afterFled, fled)

  // Attack reduce enemyHp y el rival contraataca si sigue con vida.
  const afterAttack = withMockRandom([0, 0], () => resolveTurn(initial, 'attack', mockEnemy))
  assert.ok(afterAttack.enemyHp < initial.enemyHp)
  assert.ok(afterAttack.playerHp < initial.playerHp, 'el rival debe contraatacar si sobrevive')
  assert.equal(afterAttack.outcome, null)

  // Un golpe que deja al rival en 0 HP termina el combate sin contraataque.
  const almostDeadEnemy = { ...initial, enemyHp: 1 }
  const knockedOut = withMockRandom([0.999], () => resolveTurn(almostDeadEnemy, 'attack', mockEnemy))
  assert.equal(knockedOut.enemyHp, 0)
  assert.equal(knockedOut.outcome, 'enemyFainted')
  assert.equal(knockedOut.playerHp, almostDeadEnemy.playerHp, 'sin contraataque tras debilitar al rival')

  // Si el jugador llega a 0 HP tras el contraataque, el combate termina en derrota.
  // La Pokéball en esta fase no hace daño, así que el rival sigue con vida y contraataca.
  const almostDeadPlayer = { ...initial, playerHp: 1 }
  const defeated = withMockRandom([0], () => resolveTurn(almostDeadPlayer, 'pokeball', mockEnemy))
  assert.equal(defeated.playerHp, 0)
  assert.equal(defeated.outcome, 'playerDefeated')
  assert.equal(defeated.enemyHp, initial.enemyHp, 'la Pokéball en Fase 8 no debe dañar al rival')

  console.log('OK: motor de batalla (HP, attack/special/run/pokéball, turnos, victoria/derrota) verificado.')
}

main()
