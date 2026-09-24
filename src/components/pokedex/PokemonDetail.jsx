import { usePokemon } from '../../hooks/usePokemon.js'
import { useGame } from '../../context/GameContext.jsx'
import { useConsoleActions } from '../../input/InputProvider.jsx'
import { INPUT_ACTIONS } from '../../input/inputActions.js'
import { capitalize } from '../../utils/text.js'
import { useEquip } from '../../hooks/useEquip.js'

const STAT_LABELS = {
  hp: 'HP',
  attack: 'ATAQUE',
  defense: 'DEFENSA',
  'special-attack': 'AT. ESP.',
  'special-defense': 'DEF. ESP.',
  speed: 'VELOCIDAD',
}

// Ficha a dos columnas: sprite y datos básicos a la izquierda, stats y
// habilidades a la derecha, para llenar el ancho de la pantalla en vez de
// dejar franjas negras y obligar a hacer scroll.
function PokemonDetail({ id, onBack, onPrev, onNext, onClose }) {
  const { state } = useGame()
  const isCaptured = state.capturedPokemonIds.includes(id)
  const isDiscovered = isCaptured || state.discoveredPokemonIds.includes(id)
  const { status, pokemon, error } = usePokemon(id)
  const { activeId, canEquip, equip, justEquipped } = useEquip()
  const isActive = id === activeId
  const equippable = canEquip(id)

  useConsoleActions(
    {
      [INPUT_ACTIONS.ACTION_2]: onBack,
      // 3 es EQUIP (solo si está capturado y no equipado); anterior y
      // siguiente siguen en el D-pad, y 4 conserva "siguiente".
      [INPUT_ACTIONS.ACTION_3]: () => equip(id),
      [INPUT_ACTIONS.ACTION_4]: onNext,
      [INPUT_ACTIONS.MOVE_LEFT]: onPrev,
      [INPUT_ACTIONS.MOVE_RIGHT]: onNext,
      [INPUT_ACTIONS.TOGGLE_PAUSE]: onBack,
      // TAB cierra la Pokédex entera y devuelve al juego, en vez de
      // reabrirla sobre sí misma.
      [INPUT_ACTIONS.OPEN_POKEDEX]: onClose,
    },
    {
      context: 'POKEMON_DETAIL',
      hints: [
        { keys: 'LR', label: 'ANTERIOR/SIGUIENTE' },
        { keys: '2', label: 'VOLVER' },
        ...(equippable ? [{ keys: '3', label: 'EQUIP' }] : []),
        { keys: 'TAB', label: 'CERRAR' },
      ],
    },
  )

  if (status === 'loading') {
    return (
      <div className="detail-shell">
        <p className="pokedex-empty" role="status">
          Consultando PokéAPI...
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="detail-shell">
        <p className="pokedex-empty" role="alert">
          No se pudo cargar este Pokémon. {error?.message}
        </p>
        <button className="btn" type="button" onClick={onBack}>
          Volver
        </button>
      </div>
    )
  }

  // Sprite pixel-art, no el artwork moderno de alta resolución: el resto
  // del juego es pixel-art y el artwork rompía el lenguaje visual.
  const sprite = pokemon.sprites?.front_default ?? pokemon.sprites?.other?.['official-artwork']?.front_default
  const statusLabel = isCaptured ? 'CAPTURADO' : isDiscovered ? 'VISTO' : 'SIN DESCUBRIR'
  const statusKey = isCaptured ? 'captured' : isDiscovered ? 'discovered' : 'undiscovered'

  return (
    <div className="detail-shell">
      <header className="detail-head">
        <h1>
          #{String(pokemon.id).padStart(3, '0')} {capitalize(pokemon.name)}
        </h1>
        <span className={`detail-status status-${statusKey}`}>{statusLabel}</span>
        {isActive && <span className="detail-status status-active">★ ACTIVE PARTNER</span>}
        {justEquipped && (
          <span className="equip-toast" role="status">
            POKÉMON EQUIPPED!
          </span>
        )}
      </header>

      <div className="detail-body">
        <div className="detail-pane detail-pane-left">
          <div className="detail-sprite">
            {sprite ? <img src={sprite} alt={pokemon.name} /> : <span className="placeholder">?</span>}
          </div>
          <div className="type-badges">
            {pokemon.types.map(({ type }) => (
              <span key={type.name} className={`type-badge type-${type.name}`}>
                {capitalize(type.name)}
              </span>
            ))}
          </div>
          <dl className="detail-meta">
            <div>
              <dt>ALTURA</dt>
              <dd>{(pokemon.height / 10).toFixed(1)} m</dd>
            </div>
            <div>
              <dt>PESO</dt>
              <dd>{(pokemon.weight / 10).toFixed(1)} kg</dd>
            </div>
          </dl>
        </div>

        <div className="detail-pane detail-pane-right">
          <h2>Estadísticas</h2>
          <ul className="stat-list">
            {pokemon.stats.map((stat) => (
              <li key={stat.stat.name} className="stat-row">
                <span className="stat-name">{STAT_LABELS[stat.stat.name] ?? capitalize(stat.stat.name)}</span>
                <div className="stat-bar">
                  <div className="stat-bar-fill" style={{ width: `${Math.min(100, (stat.base_stat / 200) * 100)}%` }} />
                </div>
                <span className="stat-value">{stat.base_stat}</span>
              </li>
            ))}
          </ul>

          <h2>Habilidades</h2>
          <ul className="detail-abilities">
            {pokemon.abilities.map(({ ability }) => (
              <li key={ability.name}>{capitalize(ability.name.replace('-', ' '))}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PokemonDetail
