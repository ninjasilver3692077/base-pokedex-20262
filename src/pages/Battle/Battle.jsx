import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGame } from '../../context/GameContext.jsx'
import { usePokemon } from '../../hooks/usePokemon.js'
import { useSpecies } from '../../hooks/useSpecies.js'
import { createBattleState, resolveTurn } from '../../game/battle.js'
import { GAME_ACTIONS } from '../../context/gameReducer.js'
import { capitalize } from '../../utils/text.js'
import PokeballIcon from '../../components/battle/PokeballIcon.jsx'

const OUTCOME_MESSAGES = {
  enemyFainted: 'El Pokémon salvaje se debilitó por completo y ya no se puede capturar.',
  playerDefeated: 'Te quedaste sin fuerzas y el Pokémon salvaje escapó.',
  fled: 'Huiste del combate.',
  captured: '¡Quedó registrado como capturado en tu Pokédex!',
}

const ACTIONS = [
  { action: 'attack', label: 'Atacar' },
  { action: 'special', label: 'Especial' },
  { action: 'pokeball', label: 'Pokéball' },
  { action: 'run', label: 'Huir' },
]

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
  const enemyId = gameState.selectedPokemonId
  const { status, pokemon: enemyPokemon, error } = usePokemon(enemyId)
  const { status: speciesStatus, species } = useSpecies(enemyId)
  const { pokemon: starter } = usePokemon(gameState.starterPokemonId)

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

  function handleAction(action) {
    if (!battle || battle.outcome) return
    if (action === 'pokeball' && speciesStatus !== 'ready') return

    const next = resolveTurn(battle, action, enemyPokemon, species?.capture_rate)

    let enemyClass = ''
    if (next.outcome === 'captured') enemyClass = 'capture-success'
    else if (action === 'pokeball') enemyClass = 'capture-fail-bounce'
    else if (action === 'attack') enemyClass = 'attack-flash'
    else if (action === 'special') enemyClass = 'special-flash'

    const playerClass = next.playerHp < battle.playerHp ? 'player-hit-flash' : ''

    setEffects((prev) => ({ tick: prev.tick + 1, enemyClass, playerClass }))
    setBattle(next)
  }

  if (enemyId == null) {
    return (
      <section className="screen">
        <h1>Sin combate activo</h1>
        <p>Camina por la hierba alta del mundo para encontrar un Pokémon salvaje.</p>
        <Link className="btn" to="/map">Ir al mundo</Link>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="screen">
        <h1>Error</h1>
        <p>No se pudo cargar al Pokémon rival desde PokéAPI. {error?.message}</p>
        <button className="btn" type="button" onClick={returnToWorld}>Volver al mundo</button>
      </section>
    )
  }

  if (status === 'loading' || !battle) {
    return (
      <section className="screen">
        <h1>Cargando combate...</h1>
        <p role="status">Preparando al Pokémon salvaje.</p>
      </section>
    )
  }

  const sprite = enemyPokemon.sprites?.front_default
  const playerSprite = starter?.sprites?.back_default ?? starter?.sprites?.front_default
  const playerName = starter ? capitalize(starter.name) : 'Tu equipo'
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
            <PokeballIcon
              key={`ball-${effects.tick}`}
              result={effects.enemyClass === 'capture-success' ? 'success' : 'fail'}
            />
          )}
        </div>

        <div className="battle-slot slot-player">
          <span className="battle-platform platform-player" aria-hidden="true" />
          <div key={`p-${effects.tick}`} className={`battle-sprite ${effects.playerClass}`}>
            {playerSprite ? (
              <img className="sprite-idle" src={playerSprite} alt={playerName} />
            ) : (
              <span className="trainer-stand" aria-hidden="true" />
            )}
          </div>
        </div>

        <InfoBox
          name={`${capitalize(enemyPokemon.name)} salvaje`}
          current={battle.enemyHp}
          max={battle.enemyMaxHp}
          side="enemy"
        />
        <InfoBox name={playerName} current={battle.playerHp} max={battle.playerMaxHp} side="player" />
      </div>

      <div className="battle-console">
        <div className="dialogue-box" role="status" aria-live="polite">
          <p>{message}</p>
          {battle.outcome === 'captured' && (
            <p className="dialogue-highlight">¡Atrapaste a {capitalize(enemyPokemon.name)}!</p>
          )}
        </div>

        {!battle.outcome ? (
          <div className="battle-actions" role="group" aria-label="Acciones de combate">
            {ACTIONS.map(({ action, label }) => (
              <button
                key={action}
                className="action-btn"
                type="button"
                onClick={() => handleAction(action)}
                disabled={action === 'pokeball' && speciesStatus !== 'ready'}
              >
                {label}
                {action === 'pokeball' && speciesStatus !== 'ready' && (
                  <span className="action-hint">cargando…</span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="battle-actions battle-outcome">
            <button className="action-btn action-primary" type="button" onClick={returnToWorld}>
              Volver al mundo
            </button>
            <Link className="action-btn" to="/pokedex">Ver Pokédex</Link>
          </div>
        )}
      </div>

      {battle.log.length > 0 && (
        <ul className="battle-log" aria-label="Historial del combate">
          {battle.log.slice(-3).map((entry, index) => (
            <li key={`${index}-${entry}`}>{entry}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Battle
