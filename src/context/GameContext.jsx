import { createContext, useContext, useEffect, useReducer } from 'react'
import { gameReducer } from './gameReducer.js'
import { loadGameState, saveGameState } from '../utils/gameStorage.js'

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadGameState)

  useEffect(() => {
    saveGameState(state)
  }, [state])

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame debe usarse dentro de <GameProvider>')
  }
  return context
}
