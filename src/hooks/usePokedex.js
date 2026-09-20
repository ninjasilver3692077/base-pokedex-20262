import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSpeciesList } from '../api/speciesService.js'
import { useGame } from '../context/GameContext.jsx'
import { getIdFromUrl } from '../utils/pokeapiId.js'

// Catálogo ligero (id + nombre) para TODAS las especies: una sola petición
// para el total dinámico y otra para el listado completo, nunca detalles por
// especie al arrancar. El estado (undiscovered/discovered/captured) se
// recalcula en memoria cada vez que cambia el progreso del GameContext, sin
// volver a pedir el catálogo.
export function usePokedex() {
  const { state } = useGame()
  const [catalog, setCatalog] = useState({ status: 'loading', species: [], error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setCatalog({ status: 'loading', species: [], error: null })

    async function load() {
      try {
        const first = await getSpeciesList({ limit: 1, offset: 0 })
        const total = first.count
        const full = await getSpeciesList({ limit: total, offset: 0 })
        if (!cancelled) setCatalog({ status: 'ready', species: full.results, error: null })
      } catch (error) {
        if (!cancelled) setCatalog({ status: 'error', species: [], error })
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [attempt])

  const entries = useMemo(() => {
    if (catalog.status !== 'ready') return []

    const discovered = new Set(state.discoveredPokemonIds)
    const captured = new Set(state.capturedPokemonIds)

    return catalog.species.map((species) => {
      const id = getIdFromUrl(species.url)
      const isCaptured = captured.has(id)
      const isDiscovered = isCaptured || discovered.has(id)
      return {
        id,
        name: species.name,
        status: isCaptured ? 'captured' : isDiscovered ? 'discovered' : 'undiscovered',
      }
    })
  }, [catalog, state.discoveredPokemonIds, state.capturedPokemonIds])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return { status: catalog.status, entries, error: catalog.error, retry }
}
