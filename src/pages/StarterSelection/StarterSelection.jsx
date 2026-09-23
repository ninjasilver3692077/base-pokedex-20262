import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../context/GameContext.jsx'
import { GAME_ACTIONS } from '../../context/gameReducer.js'
import { usePokemon } from '../../hooks/usePokemon.js'
import { useConsoleActions } from '../../input/InputProvider.jsx'
import { INPUT_ACTIONS } from '../../input/inputActions.js'
import { capitalize } from '../../utils/text.js'

const STARTERS = [1, 4, 7]

function StarterCard({ id, active }) {
  const { status, pokemon } = usePokemon(id)
  return (
    <>
      <div className="starter-sprite">
        {pokemon?.sprites?.front_default ? <img src={pokemon.sprites.front_default} alt={pokemon.name} /> : '…'}
      </div>
      <div className="starter-info">
        <strong>{pokemon ? capitalize(pokemon.name) : 'Cargando'}</strong>
        <span>{pokemon ? pokemon.types.map(({ type }) => capitalize(type.name)).join(' · ') : status === 'error' ? 'Error' : 'PokéAPI'}</span>
      </div>
      <span className={active ? 'starter-marker active' : 'starter-marker'} aria-hidden="true">
        <i className="glyph glyph-up" />
      </span>
    </>
  )
}

// Los tres starter caben en pantalla a la vez (sin scroll): fila de tres
// columnas que colapsa a una sola si de verdad no hay ancho. D-pad
// izquierda/derecha mueve la selección, Botón 1 confirma; click de
// mouse/touch confirma directo, igual que en el título y en la pausa.
function StarterSelection() {
  const [selected, setSelected] = useState(0)
  const { dispatch } = useGame()
  const navigate = useNavigate()

  function chooseStarter(index) {
    const id = STARTERS[index]
    dispatch({ type: GAME_ACTIONS.SET_STARTER, id })
    dispatch({ type: GAME_ACTIONS.DISCOVER_POKEMON, id })
    dispatch({ type: GAME_ACTIONS.CAPTURE_POKEMON, id })
    navigate('/map')
  }

  const move = (delta) => setSelected((i) => (i + delta + STARTERS.length) % STARTERS.length)

  useConsoleActions(
    {
      [INPUT_ACTIONS.MOVE_LEFT]: () => move(-1),
      [INPUT_ACTIONS.MOVE_RIGHT]: () => move(1),
      [INPUT_ACTIONS.MOVE_UP]: () => move(-1),
      [INPUT_ACTIONS.MOVE_DOWN]: () => move(1),
      [INPUT_ACTIONS.ACTION_1]: () => chooseStarter(selected),
      [INPUT_ACTIONS.ACTION_2]: () => navigate('/'),
    },
    {
      context: 'STARTER',
      hints: [
        { keys: 'LR', label: 'ELEGIR' },
        { keys: '1', label: 'CONFIRMAR' },
        { keys: '2', label: 'VOLVER' },
      ],
    },
  )

  return (
    <section className="screen starter-screen">
      <header className="starter-head">
        <p className="eyebrow">PRIMERA EXPEDICIÓN</p>
        <h1>Elige tu compañero</h1>
      </header>
      <div className="starter-list" role="listbox" aria-label="Starters disponibles">
        {STARTERS.map((id, index) => (
          <button
            key={id}
            type="button"
            role="option"
            aria-selected={index === selected}
            className={index === selected ? 'starter-row selected' : 'starter-row'}
            onClick={() => {
              setSelected(index)
              chooseStarter(index)
            }}
          >
            <StarterCard id={id} active={index === selected} />
          </button>
        ))}
      </div>
    </section>
  )
}

export default StarterSelection
