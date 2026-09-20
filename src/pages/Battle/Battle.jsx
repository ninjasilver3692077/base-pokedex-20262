import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
}

function HpBar({ current, max }) {
  const percent = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0
  const level = percent <= 20 ? 'low' : percent <= 50 ? 'mid' : 'high'
  return (
    <div className="hp-bar">
      <div className={`hp-bar-fill hp-bar-${level}`} style={{ transform: `scaleX(${percent / 100})` }} />
      <span className="hp-bar-label">{current}/{max} HP</span>
    </div>
  )
}

function Battle() {
  const { state: gameState, dispatch } = useGame()
  const enemyId = gameState.selectedPokemonId
  const { status, pokemon: enemyPokemon, error } = usePokemon(enemyId)
  const { status: speciesStatus, species } = useSpecies(enemyId)

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
        <p>Explora una zona para encontrar un Pokémon salvaje antes de entrar en batalla.</p>
        <Link className="btn" to="/map">Ir al mapa</Link>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="screen">
        <h1>Error</h1>
        <p>No se pudo cargar al Pokémon rival desde PokéAPI. {error?.message}</p>
        <Link className="btn" to="/map">Volver al mapa</Link>
      </section>
    )
  }

  if (status === 'loading' || !battle) {
    return (
      <section className="screen">
        <h1>Cargando combate...</h1>
      </section>
    )
  }

  const sprite = enemyPokemon.sprites?.front_default

  return (
    <section className="screen battle-screen">
      <h1>Combate salvaje</h1>

      <div className="battle-field">
        <div className="battle-enemy">
          <h2>{capitalize(enemyPokemon.name)}</h2>
          <HpBar current={battle.enemyHp} max={battle.enemyMaxHp} />
          <div key={effects.tick} className={effects.tick === 0 ? 'sprite-appear' : effects.enemyClass}>
            {sprite ? <img className="sprite-idle" src={sprite} alt={enemyPokemon.name} /> : <span className="placeholder">?</span>}
          </div>
          {(effects.enemyClass === 'capture-fail-bounce' || effects.enemyClass === 'capture-success') && (
            <PokeballIcon
              key={`ball-${effects.tick}`}
              result={effects.enemyClass === 'capture-success' ? 'success' : 'fail'}
            />
          )}
        </div>

        <div className="battle-player">
          <h2 key={effects.tick} className={effects.playerClass}>Tú</h2>
          <HpBar current={battle.playerHp} max={battle.playerMaxHp} />
        </div>
      </div>

      <ul className="battle-log">
        {battle.log.slice(-4).map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ul>

      {!battle.outcome && (
        <div className="battle-actions">
          <button className="btn" type="button" onClick={() => handleAction('attack')}>Attack</button>
          <button className="btn" type="button" onClick={() => handleAction('special')}>Special</button>
          <button
            className="btn"
            type="button"
            onClick={() => handleAction('pokeball')}
            disabled={speciesStatus !== 'ready'}
          >
            Pokéball
          </button>
          <button className="btn" type="button" onClick={() => handleAction('run')}>Run</button>
        </div>
      )}

      {battle.outcome === 'captured' && (
        <div className="battle-outcome captured">
          <p>¡Atrapaste a {capitalize(enemyPokemon.name)}! Quedó registrado como capturado en tu Pokédex.</p>
          <Link className="btn" to="/pokedex">Ver Pokédex</Link>
          <Link className="btn" to="/map">Volver al mapa</Link>
        </div>
      )}

      {battle.outcome && battle.outcome !== 'captured' && (
        <div className="battle-outcome">
          <p>{OUTCOME_MESSAGES[battle.outcome]}</p>
          <Link className="btn" to="/map">Volver al mapa</Link>
        </div>
      )}
    </section>
  )
}

export default Battle
