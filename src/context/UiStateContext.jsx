import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const UiStateContext = createContext(null)

// Estado de UI transitorio (pausa, overlay de Pokédex): a propósito NO vive
// en GameContext, para que nunca se persista en localStorage junto con el
// progreso real de la partida.
export function UiStateProvider({ children }) {
  const [isPaused, setPaused] = useState(false)
  const [isPokedexOpen, setPokedexOpen] = useState(false)
  const [pokedexFocusId, setPokedexFocusId] = useState(null)

  const openPokedexAt = useCallback((id) => {
    setPokedexFocusId(id)
    setPokedexOpen(true)
  }, [])

  const clearPokedexFocus = useCallback(() => setPokedexFocusId(null), [])

  const value = useMemo(
    () => ({ isPaused, setPaused, isPokedexOpen, setPokedexOpen, pokedexFocusId, openPokedexAt, clearPokedexFocus }),
    [isPaused, isPokedexOpen, pokedexFocusId, openPokedexAt, clearPokedexFocus],
  )

  return <UiStateContext.Provider value={value}>{children}</UiStateContext.Provider>
}

export function useUiState() {
  const context = useContext(UiStateContext)
  if (!context) throw new Error('useUiState debe usarse dentro de <UiStateProvider>')
  return context
}
