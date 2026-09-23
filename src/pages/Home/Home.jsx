import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../context/GameContext.jsx'
import { GAME_ACTIONS } from '../../context/gameReducer.js'
import { useConsoleActions } from '../../input/InputProvider.jsx'
import { INPUT_ACTIONS } from '../../input/inputActions.js'
import { isMuted, toggleMute } from '../../audio/sounds.js'

const CONFIRM_ITEMS = [
  { id: 'yes', label: 'YES' },
  { id: 'no', label: 'NO' },
]

// Pantalla de título dentro de la consola: reemplaza el antiguo Home de
// "página web" (mountains/sun/Links). D-pad mueve la selección, Botón 1
// confirma — mismo patrón que PauseOverlay y StarterSelection.
function Home() {
  const { state, dispatch } = useGame()
  const navigate = useNavigate()
  const hasProgress = state.starterPokemonId != null

  const titleItems = [
    ...(hasProgress ? [{ id: 'continue', label: 'CONTINUE' }] : []),
    { id: 'newGame', label: 'NEW GAME' },
    { id: 'options', label: 'OPTIONS' },
  ]

  const [view, setView] = useState('title')
  const [selected, setSelected] = useState(0)
  const [muted, setMuted] = useState(isMuted)

  function activateTitleItem(item) {
    if (item.id === 'continue') {
      navigate('/map')
    } else if (item.id === 'newGame') {
      if (hasProgress) {
        setSelected(1)
        setView('confirmReset')
      } else {
        navigate('/starter')
      }
    } else if (item.id === 'options') {
      setView('options')
    }
  }

  function activateConfirmItem(item) {
    if (item.id === 'yes') {
      dispatch({ type: GAME_ACTIONS.RESET_GAME })
      navigate('/starter')
    } else {
      setSelected(0)
      setView('title')
    }
  }

  const viewConfig =
    view === 'title'
      ? {
          context: 'TITLE',
          hints: [
            { keys: 'UD', label: 'SELECT' },
            { keys: '1', label: 'CONFIRM' },
          ],
          handlers: {
            [INPUT_ACTIONS.MOVE_UP]: () => setSelected((i) => (i - 1 + titleItems.length) % titleItems.length),
            [INPUT_ACTIONS.MOVE_DOWN]: () => setSelected((i) => (i + 1) % titleItems.length),
            [INPUT_ACTIONS.ACTION_1]: () => activateTitleItem(titleItems[selected]),
          },
        }
      : view === 'confirmReset'
        ? {
            context: 'NEW_GAME_CONFIRM',
            hints: [
              { keys: 'LR', label: 'SELECT' },
              { keys: '1', label: 'CONFIRM' },
              { keys: '2', label: 'CANCEL' },
            ],
            handlers: {
              [INPUT_ACTIONS.MOVE_LEFT]: () => setSelected((i) => (i - 1 + CONFIRM_ITEMS.length) % CONFIRM_ITEMS.length),
              [INPUT_ACTIONS.MOVE_RIGHT]: () => setSelected((i) => (i + 1) % CONFIRM_ITEMS.length),
              [INPUT_ACTIONS.ACTION_1]: () => activateConfirmItem(CONFIRM_ITEMS[selected]),
              [INPUT_ACTIONS.ACTION_2]: () => {
                setSelected(0)
                setView('title')
              },
            },
          }
        : {
            context: 'SETTINGS',
            hints: [
              { keys: '1', label: 'SONIDO' },
              { keys: '2', label: 'VOLVER' },
            ],
            handlers: {
              [INPUT_ACTIONS.ACTION_1]: () => setMuted(toggleMute()),
              [INPUT_ACTIONS.ACTION_2]: () => setView('title'),
            },
          }

  useConsoleActions(viewConfig.handlers, { context: viewConfig.context, hints: viewConfig.hints })

  return (
    <section className="screen title-screen">
      <p className="eyebrow">REGIÓN AURORA · 01</p>
      <h1 className="title-heading">
        POKÉMON
        <br />
        <span>EXPEDITION</span>
      </h1>

      {view === 'title' && (
        <ul className="overlay-menu title-menu">
          {titleItems.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                className={index === selected ? 'menu-option selected' : 'menu-option'}
                onClick={() => {
                  setSelected(index)
                  activateTitleItem(item)
                }}
              >
                <i className="glyph glyph-right menu-cursor" aria-hidden="true" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {view === 'confirmReset' && (
        <div className="confirm-panel">
          <p>Existing save detected.</p>
          <p>Start new game?</p>
          <div className="confirm-options">
            {CONFIRM_ITEMS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={index === selected ? 'menu-option selected' : 'menu-option'}
                onClick={() => {
                  setSelected(index)
                  activateConfirmItem(item)
                }}
              >
                <i className="glyph glyph-right menu-cursor" aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'options' && (
        <div className="confirm-panel">
          <button type="button" className="menu-option" onClick={() => setMuted(toggleMute())}>
            SONIDO: {muted ? 'OFF' : 'ON'}
          </button>
        </div>
      )}
    </section>
  )
}

export default Home
