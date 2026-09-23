import { Routes, Route } from 'react-router-dom'
import Home from '../../pages/Home/Home.jsx'
import StarterSelection from '../../pages/StarterSelection/StarterSelection.jsx'
import WorldMap from '../../pages/WorldMap/WorldMap.jsx'
import Battle from '../../pages/Battle/Battle.jsx'
import Pokedex from '../../pages/Pokedex/Pokedex.jsx'
import NotFound from '../../pages/NotFound/NotFound.jsx'
import ConsoleScreen from './ConsoleScreen.jsx'
import DPad from './DPad.jsx'
import ActionButtons from './ActionButtons.jsx'
import TabButton from './TabButton.jsx'
import PauseButton from './PauseButton.jsx'
import PauseOverlay from './PauseOverlay.jsx'
import { InputProvider, useConsoleActions } from '../../input/InputProvider.jsx'
import { INPUT_ACTIONS } from '../../input/inputActions.js'
import { UiStateProvider, useUiState } from '../../context/UiStateContext.jsx'

// Todo lo que el juego dibuja vive dentro de ConsoleScreen: las rutas son un
// detalle interno de navegación, nunca una URL que el jugador deba ver como
// "página". Pausa y Pokédex son overlays de estado (UiStateContext), no
// rutas: así siguen montadas debajo World/Battle sin perder su progreso
// local cuando el jugador las abre y las cierra.
function ConsoleContent() {
  const { isPaused, setPaused, isPokedexOpen, pokedexFocusId, setPokedexOpen, clearPokedexFocus } = useUiState()

  // global: es el fallback de toda la consola (abrir pausa/Pokédex desde
  // cualquier pantalla), así que va al fondo del stack y nunca pisa el
  // contexto de la pantalla montada.
  useConsoleActions(
    {
      [INPUT_ACTIONS.TOGGLE_PAUSE]: () => setPaused(true),
      [INPUT_ACTIONS.OPEN_POKEDEX]: () => setPokedexOpen(true),
    },
    { global: true },
  )

  return (
    <ConsoleScreen>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/starter" element={<StarterSelection />} />
        <Route path="/map" element={<WorldMap />} />
        <Route path="/battle" element={<Battle />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {isPokedexOpen && (
        <div className="overlay pokedex-overlay">
          <Pokedex
            initialFocusId={pokedexFocusId}
            onClose={() => {
              setPokedexOpen(false)
              clearPokedexFocus()
            }}
          />
        </div>
      )}
      {isPaused && <PauseOverlay />}
    </ConsoleScreen>
  )
}

function GameConsole() {
  return (
    <UiStateProvider>
      <InputProvider>
        <div className="console-body">
          <ConsoleContent />
          <div className="console-controls">
            <DPad />
            <div className="console-lower">
              <TabButton />
              <PauseButton />
            </div>
            <ActionButtons />
          </div>
        </div>
      </InputProvider>
    </UiStateProvider>
  )
}

export default GameConsole
