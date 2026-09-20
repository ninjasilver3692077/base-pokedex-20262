import { useEffect, useState } from 'react'
import { getSpecies } from '../api/speciesService.js'

// Datos propios de especie (capture_rate, flavor text, etc.) bajo demanda,
// separados de usePokemon porque la mayoría de usos (tarjetas, detalle)
// no los necesitan.
export function useSpecies(id) {
  const [state, setState] = useState({ status: 'loading', species: null, error: null })

  useEffect(() => {
    if (id == null) return
    let cancelled = false
    setState({ status: 'loading', species: null, error: null })

    getSpecies(id)
      .then((species) => {
        if (!cancelled) setState({ status: 'ready', species, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', species: null, error })
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return state
}
