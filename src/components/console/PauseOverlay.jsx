import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../context/GameContext.jsx'
import { GAME_ACTIONS } from '../../context/gameReducer.js'
import { useUiState } from '../../context/UiStateContext.jsx'
import { useConsoleActions } from '../../input/InputProvider.jsx'
import { INPUT_ACTIONS } from '../../input/inputActions.js'
import { isMuted, toggleMute } from '../../audio/sounds.js'
import { usePokemon } from '../../hooks/usePokemon.js'
import { capitalize } from '../../utils/text.js'

const MENU_ITEMS = [
  { id: 'continue', label: 'CONTINUE' },
  { id: 'pokedex', label: 'POKÉDEX' },
  { id: 'settings', label: 'SETTINGS' },
  { id: 'mainMenu', label: 'MAIN MENU' },
]

// Overlay montado por GameConsole encima de la pantalla enrutada (World o
// Battle siguen montados debajo, sin perder su estado). Por eso puede
// pausar el mundo con solo un booleano leído por useWorldMovement, en vez
// de necesitar desmontar nada.
function PauseOverlay() {
  const navigate = useNavigate()
  const { dispatch, state } = useGame()
  const { setPaused, setPokedexOpen } = useUiState()
  const [view, setView] = useState('menu')
  const [selected, setSelected] = useState(0)
  const [muted, setMuted] = useState(isMuted)
  // Solo informativo: el compañero se cambia desde la Pokédex.
  const { pokemon: partner } = usePokemon(state.activePokemonId)

  function closePause() {
    setPaused(false)
  }

  function activateItem(item) {
    if (item.id === 'continue') {
      closePause()
    } else if (item.id === 'pokedex') {
      setPokedexOpen(true)
      closePause()
    } else if (item.id === 'settings') {
      setView('settings')
    } else if (item.id === 'mainMenu') {
      if (state.mode === 'battle') dispatch({ type: GAME_ACTIONS.EXIT_BATTLE })
      closePause()
      navigate('/')
    }
  }

  useConsoleActions(
    view === 'menu'
      ? {
          [INPUT_ACTIONS.MOVE_UP]: () => setSelected((i) => (i - 1 + MENU_ITEMS.length) % MENU_ITEMS.length),
          [INPUT_ACTIONS.MOVE_DOWN]: () => setSelected((i) => (i + 1) % MENU_ITEMS.length),
          [INPUT_ACTIONS.ACTION_1]: () => activateItem(MENU_ITEMS[selected]),
          [INPUT_ACTIONS.OPEN_POKEDEX]: () => activateItem(MENU_ITEMS.find((item) => item.id === 'pokedex')),
          [INPUT_ACTIONS.TOGGLE_PAUSE]: closePause,
        }
      : {
          [INPUT_ACTIONS.ACTION_1]: () => setMuted(toggleMute()),
          [INPUT_ACTIONS.ACTION_2]: () => setView('menu'),
          [INPUT_ACTIONS.TOGGLE_PAUSE]: closePause,
        },
    view === 'menu'
      ? {
          context: 'PAUSE',
          hints: [
            { keys: 'UD', label: 'SELECT' },
            { keys: '1', label: 'CONFIRMAR' },
            { keys: 'PAUSE', label: 'CERRAR' },
          ],
        }
      : {
          context: 'SETTINGS',
          hints: [
            { keys: '1', label: 'SONIDO' },
            { keys: '2', label: 'VOLVER' },
            { keys: 'PAUSE', label: 'CERRAR' },
          ],
        },
  )

  return (
    <div className="overlay pause-overlay" role="dialog" aria-modal="true" aria-label="Menú de pausa">
      {view === 'menu' ? (
        <>
          <p className="overlay-title">PAUSED</p>
          {partner && (
            <p className="pause-partner">
              PARTNER <strong>{capitalize(partner.name)}</strong>
            </p>
          )}
          <ul className="overlay-menu">
            {MENU_ITEMS.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={index === selected ? 'menu-option selected' : 'menu-option'}
                  onClick={() => {
                    setSelected(index)
                    activateItem(item)
                  }}
                >
                  <i className="glyph glyph-right menu-cursor" aria-hidden="true" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p className="overlay-title">AJUSTES</p>
          <button type="button" className="menu-option" onClick={() => setMuted(toggleMute())}>
            SONIDO: {muted ? 'OFF' : 'ON'}
          </button>
        </>
      )}
    </div>
  )
}

export default PauseOverlay
