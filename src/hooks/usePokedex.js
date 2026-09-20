import { useCallback, useEffect, useState } from 'react'
import { getSpeciesList } from '../api/speciesService.js'
import { loadGameState } from '../utils/gameStorage.js'
import { getIdFromUrl } from '../utils/pokeapiId.js'

// Catálogo ligero (id + nombre) para TODAS las especies, cruzado con el
// progreso guardado. Una sola petición para el total dinámico y otra para el
// listado completo: nunca se piden detalles de cada especie al arrancar.
export function usePokedex() {
  const [state, setState] = useState({ status: 'loading', entries: [], error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading', entries: [], error: null })

    async function load() {
      try {
        const first = await getSpeciesList({ limit: 1, offset: 0 })
        const total = first.count
        const full = await getSpeciesList({ limit: total, offset: 0 })
        if (cancelled) return

        const { discoveredPokemonIds, capturedPokemonIds } = loadGameState()
        const discovered = new Set(discoveredPokemonIds)
        const captured = new Set(capturedPokemonIds)

        const entries = full.results.map((species) => {
          const id = getIdFromUrl(species.url)
          const isCaptured = captured.has(id)
          const isDiscovered = isCaptured || discovered.has(id)
          return {
            id,
            name: species.name,
            status: isCaptured ? 'captured' : isDiscovered ? 'discovered' : 'undiscovered',
          }
        })

        setState({ status: 'ready', entries, error: null })
      } catch (error) {
        if (!cancelled) setState({ status: 'error', entries: [], error })
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return { ...state, retry }
}
