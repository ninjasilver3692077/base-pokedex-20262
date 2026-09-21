import { useMemo, useState } from 'react'
import { usePokedex } from '../../hooks/usePokedex.js'
import PokedexCard from '../../components/pokedex/PokedexCard.jsx'

const PAGE_SIZE = 24
const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'captured', label: 'Capturados' },
  { value: 'discovered', label: 'Descubiertos' },
  { value: 'undiscovered', label: 'Sin descubrir' },
]

function Pokedex() {
  const { status, entries, error, retry } = usePokedex()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return entries.filter((entry) => {
      const matchesSearch = query === '' || entry.name.includes(query) || String(entry.id).padStart(3, '0').includes(query) || String(entry.id).includes(query)
      const matchesStatus = statusFilter === 'all' || entry.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [entries, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageEntries = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const capturedCount = entries.filter((entry) => entry.status === 'captured').length
  const discoveredCount = entries.filter((entry) => entry.status !== 'undiscovered').length

  function handleSearchChange(event) {
    setSearch(event.target.value)
    setPage(1)
  }

  function handleStatusChange(value) {
    setStatusFilter(value)
    setPage(1)
  }

  if (status === 'loading') {
    return (
      <section className="screen">
        <p className="eyebrow">REGISTRO DE ESPECIES</p><h1>Pokédex</h1>
        <p role="status">Cargando catálogo de PokéAPI...</p>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="screen">
        <p className="eyebrow">REGISTRO DE ESPECIES</p><h1>Pokédex</h1>
        <p role="alert">No se pudo cargar el catálogo desde PokéAPI. {error?.message}</p>
        <button className="btn" type="button" onClick={retry}>Reintentar</button>
      </section>
    )
  }

  return (
    <section className="screen pokedex-screen">
      <p className="eyebrow">REGISTRO DE ESPECIES</p><h1>Pokédex</h1>
      <p className="pokedex-progress">
        {capturedCount} capturados · {discoveredCount} descubiertos · {entries.length} especies totales
      </p>

      <div className="pokedex-controls">
        <input
          type="search"
          placeholder="Buscar por nombre o número..."
          aria-label="Buscar Pokémon por nombre o número"
          value={search}
          onChange={handleSearchChange}
        />
        <div className="pokedex-filters" role="group" aria-label="Filtrar por estado">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={statusFilter === value ? 'filter-btn active' : 'filter-btn'}
              aria-pressed={statusFilter === value}
              onClick={() => handleStatusChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {pageEntries.length === 0 ? (
        <p role="status">No hay Pokémon que coincidan con la búsqueda.</p>
      ) : (
        <div className="pokedex-grid">
          {pageEntries.map((entry) => (
            <PokedexCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      <div className="pagination">
        <button className="btn" type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button className="btn" type="button" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>
          Siguiente
        </button>
      </div>
    </section>
  )
}

export default Pokedex
