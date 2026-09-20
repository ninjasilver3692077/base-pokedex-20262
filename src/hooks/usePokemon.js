import { useEffect, useState } from 'react'
import { getPokemon } from '../api/pokemonService.js'

// Detalle de un solo Pokémon (stats/tipos/habilidades/sprites) bajo demanda.
export function usePokemon(id) {
  const [state, setState] = useState({ status: 'loading', pokemon: null, error: null })

  useEffect(() => {
    if (id == null) return
    let cancelled = false
    setState({ status: 'loading', pokemon: null, error: null })

    getPokemon(id)
      .then((pokemon) => {
        if (!cancelled) setState({ status: 'ready', pokemon, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', pokemon: null, error })
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return state
}
