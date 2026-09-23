import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// HashRouter en vez de BrowserRouter: GitHub Pages no reescribe rutas al
// servidor (no hay backend), así que recargar /pokedex/25 daría 404 con
// BrowserRouter. Con hash (#/pokedex/25) el servidor siempre sirve
// index.html y React Router resuelve la ruta en el cliente.
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { GameProvider } from './context/GameContext.jsx'
import { initUiSelectSound, startMusicOnFirstGesture } from './audio/sounds.js'
import './styles/variables.css'
import './styles/global.css'
import './styles/animations.css'
import './styles/world.css'
import './styles/battle.css'
import './styles/console.css'

initUiSelectSound()
startMusicOnFirstGesture()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <GameProvider>
        <App />
      </GameProvider>
    </HashRouter>
  </StrictMode>,
)
