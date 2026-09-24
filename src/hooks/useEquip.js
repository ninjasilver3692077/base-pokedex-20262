import { useCallback, useEffect, useState } from 'react'
import { useGame } from '../context/GameContext.jsx'
import { GAME_ACTIONS } from '../context/gameReducer.js'
import { playSound } from '../audio/sounds.js'

const FEEDBACK_MS = 1400

// Única vía de la UI para cambiar de compañero: Pokédex, ficha y captura
// comparten la misma regla (solo capturados) y el mismo aviso
// "POKÉMON EQUIPPED!". El reducer repite la validación por si acaso.
export function useEquip() {
  const { state, dispatch } = useGame()
  const [justEquipped, setJustEquipped] = useState(false)

  useEffect(() => {
    if (!justEquipped) return undefined
    const timer = setTimeout(() => setJustEquipped(false), FEEDBACK_MS)
    return () => clearTimeout(timer)
  }, [justEquipped])

  const canEquip = useCallback(
    (id) => state.capturedPokemonIds.includes(id) && id !== state.activePokemonId,
    [state.capturedPokemonIds, state.activePokemonId],
  )

  const equip = useCallback(
    (id) => {
      if (!canEquip(id)) return false
      dispatch({ type: GAME_ACTIONS.EQUIP_POKEMON, id })
      playSound('select')
      setJustEquipped(true)
      return true
    },
    [canEquip, dispatch],
  )

  return { activeId: state.activePokemonId, canEquip, equip, justEquipped }
}
