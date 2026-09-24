import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../context/GameContext.jsx'
import { usePokemon } from '../../hooks/usePokemon.js'
import { useSpecies } from '../../hooks/useSpecies.js'
import { createBattleState, resolveTurn } from '../../game/battle.js'
import { GAME_ACTIONS } from '../../context/gameReducer.js'
import { capitalize } from '../../utils/text.js'
import PokeballIcon from '../../components/battle/PokeballIcon.jsx'
import { playSound } from '../../audio/sounds.js'
import { useConsoleActions } from '../../input/InputProvider.jsx'
import { INPUT_ACTIONS } from '../../input/inputActions.js'
import { useUiState } from '../../context/UiStateContext.jsx'
import { useEquip } from '../../hooks/useEquip.js'

const OUTCOME_MESSAGES = {
  enemyFainted: 'El Pokémon salvaje se debilitó por completo y ya no se puede capturar.',
  playerDefeated: 'Te quedaste sin fuerzas y el Pokémon salvaje escapó.',
  fled: 'Huiste del combate.',
  captured: '¡Quedó registrado como capturado en tu Pokédex!',
}

// Las cuatro acciones de combate se disparan por los botones físicos 1-4
// de la consola (o Digit1-4 del teclado, vía InputProvider). Qué hace cada
// uno lo anuncia la ContextControlBar, que lee las hints declaradas abajo
// en useConsoleActions: esta pantalla no dibuja botones ni etiquetas
// propias.
const ACTION_SOUNDS = {
  attack: 'attack',
  special: 'hardAttack',
  pokeball: 'select',
  run: 'select',
}

// Caja de datos estilo RPG: nombre, nivel y barra de HP dentro de un
// panel con esquina cortada, en vez de una tarjeta web centrada.
function InfoBox({ name, current, max, side }) {
  const percent = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0
  const level = percent <= 20 ? 'low' : percent <= 50 ? 'mid' : 'high'
  return (
    <div className={`battle-info battle-info-${side}`}>
      <p className="battle-info-name">{name}</p>
      <div className="hp-row">
        <span className="hp-tag">HP</span>
        <div className="hp-bar">
          <div className={`hp-bar-fill hp-bar-${level}`} style={{ transform: `scaleX(${percent / 100})` }} />
        </div>
      </div>
      <p className="hp-numbers">
        {current}/{max}
      </p>
    </div>
  )
}

function Battle() {
  const { state: gameState, dispatch } = useGame()
  const navigate = useNavigate()
  const { setPokedexOpen } = useUiState()
  const enemyId = gameState.selectedPokemonId
  const { status, pokemon: enemyPokemon, error } = usePokemon(enemyId)
  const { status: speciesStatus, species } = useSpecies(enemyId)
  // El jugador pelea con su compañero equipado (activePokemonId), cargado
  // por la misma capa cacheada de PokéAPI que el rival. Se fija al entrar:
  // equipar durante el combate (Pokédex o tras capturar) vale para el
  // siguiente, nunca cambia de Pokémon a mitad de pelea.
  const [partnerId] = useState(gameState.activePokemonId)
  const { status: partnerStatus, pokemon: partner } = usePokemon(partnerId)
  const { canEquip, equip, justEquipped } = useEquip()

  const [battle, setBattle] = useState(null)
  // effects.tick fuerza el remount de los elementos animados de cada turno
  // (para que las animaciones CSS de un solo golpe se repitan cada vez, sin
  // afectar a la barra de HP, que necesita permanecer montada para que su
  // transition anime la reducción en vez de saltar de golpe).
  const [effects, setEffects] = useState({ tick: 0, enemyClass: '', playerClass: '' })

  useEffect(() => {
    if (status === 'ready' && enemyPokemon) {
      setBattle(createBattleState(enemyPokemon))
    }
  }, [status, enemyPokemon])

  // Captura exitosa: actualizar estado a captured y persistir (Fase 4 ya
  // persiste automáticamente en cada cambio del GameContext). Idempotente,
  // así que un re-render de más no duplica nada.
  useEffect(() => {
    if (battle?.outcome === 'captured' && enemyId != null) {
      dispatch({ type: GAME_ACTIONS.CAPTURE_POKEMON, id: enemyId })
    }
  }, [battle?.outcome, enemyId, dispatch])

  // Única salida del combate: EXIT_BATTLE devuelve mode a 'world' y
  // restaura la región y el tile exactos que ENTER_BATTLE snapshoteó.
  const returnToWorld = useCallback(() => {
    dispatch({ type: GAME_ACTIONS.EXIT_BATTLE })
    navigate('/map')
  }, [dispatch, navigate])

  const handleAction = useCallback(
    (action) => {
      if (!battle || battle.outcome) return
      if (action === 'pokeball' && speciesStatus !== 'ready') return

      const next = resolveTurn(battle, action, enemyPokemon, species?.capture_rate, partner)

      let enemyClass = ''
      if (next.outcome === 'captured') enemyClass = 'capture-success'
      else if (action === 'pokeball') enemyClass = 'capture-fail-bounce'
      else if (action === 'attack') enemyClass = 'attack-flash'
      else if (action === 'special') enemyClass = 'special-flash'

      // La captura tiene su propio sonido y pisa al de lanzar la ball.
      playSound(next.outcome === 'captured' ? 'captured' : ACTION_SOUNDS[action])

      const playerClass = next.playerHp < battle.playerHp ? 'player-hit-flash' : ''

      setEffects((prev) => ({ tick: prev.tick + 1, enemyClass, playerClass }))
      setBattle(next)
    },
    [battle, speciesStatus, enemyPokemon, species, partner],
  )

  const finished = Boolean(battle?.outcome)
  // Tras capturar se ofrece equiparlo, nunca se equipa solo: 1 sigue con
  // el compañero actual, 3 cambia al recién capturado.
  const offerEquip = battle?.outcome === 'captured' && canEquip(enemyId)

  useConsoleActions(
    finished
      ? {
          [INPUT_ACTIONS.ACTION_1]: returnToWorld,
          [INPUT_ACTIONS.ACTION_2]: () => setPokedexOpen(true),
          [INPUT_ACTIONS.ACTION_3]: () => equip(enemyId),
        }
      : {
          [INPUT_ACTIONS.ACTION_1]: () => handleAction('attack'),
          [INPUT_ACTIONS.ACTION_2]: () => handleAction('special'),
          [INPUT_ACTIONS.ACTION_3]: () => {
            if (speciesStatus === 'ready') handleAction('pokeball')
          },
          [INPUT_ACTIONS.ACTION_4]: () => handleAction('run'),
        },
    {
      context: 'BATTLE',
      hints: finished
        ? [
            { keys: '1', label: battle.outcome === 'captured' ? 'CONTINUAR' : 'VOLVER AL MUNDO' },
            { keys: '2', label: 'POKÉDEX' },
            ...(offerEquip ? [{ keys: '3', label: 'EQUIP' }] : []),
          ]
        : [
            { keys: '1', label: 'ATACAR' },
            { keys: '2', label: 'ESPECIAL' },
            { keys: '3', label: speciesStatus === 'ready' ? 'POKÉBALL' : 'POKÉBALL…' },
            { keys: '4', label: 'HUIR' },
          ],
    },
  )

  if (enemyId == null) {
    return (
      <section className="screen">
        <h1>Sin combate activo</h1>
        <p>Camina por la hierba alta del mundo para encontrar un Pokémon salvaje.</p>
        <button className="btn" type="button" onClick={() => navigate('/map')}>
          Ir al mundo
        </button>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="screen">
        <h1>Error</h1>
        <p>No se pudo cargar al Pokémon rival desde PokéAPI. {error?.message}</p>
        <button className="btn" type="button" onClick={returnToWorld}>
          Volver al mundo
        </button>
      </section>
    )
  }

  if (status === 'loading' || !battle || (partnerId != null && partnerStatus === 'loading')) {
    return (
      <section className="screen">
        <h1>Cargando combate...</h1>
        <p role="status">Preparando al Pokémon salvaje.</p>
      </section>
    )
  }

  const sprite = enemyPokemon.sprites?.front_default
  const playerSprite = partner?.sprites?.back_default ?? partner?.sprites?.front_default
  const playerName = partner ? capitalize(partner.name) : 'Tu equipo'
  const lastMessage = battle.log[battle.log.length - 1]
  const message = battle.outcome
    ? `${OUTCOME_MESSAGES[battle.outcome] ?? ''}`
    : (lastMessage ?? `¡Un ${capitalize(enemyPokemon.name)} salvaje apareció!`)

  return (
    <section className="screen battle-screen">
      <div className="battle-arena">
        <div className="arena-sky" aria-hidden="true" />
        <div className="arena-ground" aria-hidden="true" />

        <div className="battle-slot slot-enemy">
          <span className="battle-platform platform-enemy" aria-hidden="true" />
          <div key={effects.tick} className={`battle-sprite ${effects.tick === 0 ? 'sprite-appear' : effects.enemyClass}`}>
            {sprite ? (
              <img className="sprite-idle" src={sprite} alt={`${enemyPokemon.name} salvaje`} />
            ) : (
              <span className="placeholder">?</span>
            )}
          </div>
          {(effects.enemyClass === 'capture-fail-bounce' || effects.enemyClass === 'capture-success') && (
            <PokeballIcon key={`ball-${effects.tick}`} result={effects.enemyClass === 'capture-success' ? 'success' : 'fail'} />
          )}
        </div>

        <div className="battle-slot slot-player">
          <span className="battle-platform platform-player" aria-hidden="true" />
          <div key={`p-${effects.tick}`} className={`battle-sprite ${effects.playerClass}`}>
            {playerSprite ? <img className="sprite-idle" src={playerSprite} alt={playerName} /> : <span className="trainer-stand" aria-hidden="true" />}
          </div>
        </div>

        <InfoBox name={`${capitalize(enemyPokemon.name)} salvaje`} current={battle.enemyHp} max={battle.enemyMaxHp} side="enemy" />
        <InfoBox name={playerName} current={battle.playerHp} max={battle.playerMaxHp} side="player" />
      </div>

      <div className="battle-console">
        <div className="dialogue-box" role="status" aria-live="polite">
          <p>{message}</p>
          {battle.outcome === 'captured' && (
            <p className="dialogue-highlight">
              {justEquipped ? 'POKÉMON EQUIPPED!' : `¡Atrapaste a ${capitalize(enemyPokemon.name)}!`}
            </p>
          )}
        </div>

      </div>
    </section>
  )
}

export default Battle
