import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePokedex } from '../../hooks/usePokedex.js'
import PokedexCard from '../../components/pokedex/PokedexCard.jsx'
import PokemonDetail from '../../components/pokedex/PokemonDetail.jsx'
import { playSound } from '../../audio/sounds.js'
import { useConsoleActions } from '../../input/InputProvider.jsx'
import { INPUT_ACTIONS } from '../../input/inputActions.js'
import { useEquip } from '../../hooks/useEquip.js'

// Página fija: la rejilla entra entera en la pantalla de la consola, así
// que la Pokédex se navega paginando (D-pad) en vez de haciendo scroll.
const PAGE_SIZE = 12
const STATUS_FILTERS = ['all', 'captured', 'discovered', 'undiscovered']
const STATUS_LABELS = { all: 'TODOS', captured: 'CAPTURADOS', discovered: 'VISTOS', undiscovered: 'SIN VER' }

// Cuántas columnas dibuja de verdad la rejilla ahora mismo: se lee del
// layout (no se asume), para que arriba/abajo salten una fila real en
// cualquier breakpoint.
function useGridColumns(gridRef, deps) {
  const [columns, setColumns] = useState(4)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return undefined
    const read = () => {
      const template = getComputedStyle(grid).gridTemplateColumns
      const count = template.split(' ').filter(Boolean).length
      setColumns(count > 0 ? count : 1)
    }
    read()
    const observer = new ResizeObserver(read)
    observer.observe(grid)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return columns
}

// Overlay de la Pokédex: montado por GameConsole encima de la pantalla
// enrutada, nunca como ruta propia, para que abrirla desde Battle no
// pierda el combate en curso. Todo el catálogo de PokéAPI sigue siendo
// visible, buscable y consultable, esté descubierto o no.
function Pokedex({ initialFocusId, onClose }) {
  const { status, entries, error, retry } = usePokedex()
  const [search, setSearch] = useState('')
  const [statusFilterIndex, setStatusFilterIndex] = useState(0)
  const [page, setPage] = useState(1)
  const [focusIndex, setFocusIndex] = useState(0)
  const [detailId, setDetailId] = useState(initialFocusId ?? null)
  const [searchActive, setSearchActive] = useState(false)
  const searchInputRef = useRef(null)
  const gridRef = useRef(null)
  const { activeId, canEquip, equip, justEquipped } = useEquip()

  const statusFilter = STATUS_FILTERS[statusFilterIndex]

  useEffect(() => {
    playSound('pokeMenu')
  }, [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return entries.filter((entry) => {
      const matchesSearch =
        query === '' || entry.name.includes(query) || String(entry.id).padStart(3, '0').includes(query) || String(entry.id).includes(query)
      const matchesStatus = statusFilter === 'all' || entry.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [entries, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageEntries = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const capturedCount = entries.filter((entry) => entry.status === 'captured').length
  const discoveredCount = entries.filter((entry) => entry.status !== 'undiscovered').length
  const columns = useGridColumns(gridRef, [status, pageEntries.length])

  useEffect(() => {
    setFocusIndex(0)
  }, [currentPage, statusFilter, search])

  // `resolveFocus(size)` decide dónde cae el cursor en la página destino,
  // que puede tener menos celdas que una página completa.
  const goToPage = useCallback(
    (nextPage, resolveFocus) => {
      const clamped = Math.min(Math.max(1, nextPage), totalPages)
      if (clamped === currentPage) return
      const size = Math.min(PAGE_SIZE, filtered.length - (clamped - 1) * PAGE_SIZE)
      setPage(clamped)
      setFocusIndex(Math.min(Math.max(0, resolveFocus(size)), Math.max(0, size - 1)))
    },
    [currentPage, totalPages, filtered.length],
  )

  // Navegación de rejilla: al salirse por un borde se pasa de página en
  // vez de quedarse atascado, que es lo que hace una Pokédex real.
  const moveFocus = useCallback(
    (delta) => {
      const next = focusIndex + delta
      if (next >= 0 && next < pageEntries.length) {
        setFocusIndex(next)
        return
      }

      const column = ((focusIndex % columns) + columns) % columns
      const verticalStep = Math.abs(delta) === columns

      if (next < 0) {
        // Arriba/izquierda desde el borde: página anterior, manteniendo la
        // columna si el salto era vertical.
        goToPage(currentPage - 1, (size) => {
          if (!verticalStep) return size - 1
          const lastRowStart = Math.floor((size - 1) / columns) * columns
          return Math.min(lastRowStart + column, size - 1)
        })
        return
      }

      goToPage(currentPage + 1, () => (verticalStep ? column : 0))
    },
    [focusIndex, pageEntries.length, columns, currentPage, goToPage],
  )

  const openDetail = useCallback((id) => setDetailId(id), [])

  const activateSearch = useCallback(() => {
    setSearchActive(true)
    searchInputRef.current?.focus()
    searchInputRef.current?.select()
  }, [])

  const inDetail = detailId != null
  const focusedEntry = pageEntries[focusIndex]
  // Botón 3 es EQUIP cuando la tarjeta enfocada está capturada y no es ya
  // el compañero; en cualquier otra tarjeta sigue ciclando el filtro.
  const focusedEquippable = focusedEntry != null && canEquip(focusedEntry.id)

  const gridHandlers = {
    [INPUT_ACTIONS.MOVE_LEFT]: () => moveFocus(-1),
    [INPUT_ACTIONS.MOVE_RIGHT]: () => moveFocus(1),
    [INPUT_ACTIONS.MOVE_UP]: () => moveFocus(-columns),
    [INPUT_ACTIONS.MOVE_DOWN]: () => moveFocus(columns),
    [INPUT_ACTIONS.ACTION_1]: () => {
      const entry = pageEntries[focusIndex]
      if (entry) openDetail(entry.id)
    },
    [INPUT_ACTIONS.ACTION_2]: onClose,
    [INPUT_ACTIONS.ACTION_3]: () => {
      if (focusedEquippable) equip(focusedEntry.id)
      else setStatusFilterIndex((i) => (i + 1) % STATUS_FILTERS.length)
    },
    [INPUT_ACTIONS.ACTION_4]: activateSearch,
    [INPUT_ACTIONS.OPEN_POKEDEX]: onClose,
    [INPUT_ACTIONS.TOGGLE_PAUSE]: onClose,
  }

  // Con la ficha abierta no registra nada: manda PokemonDetail.
  useConsoleActions(inDetail ? null : gridHandlers, {
    context: searchActive ? 'POKEDEX_SEARCH' : 'POKEDEX',
    hints: searchActive
      ? [
          { keys: '2', label: 'SALIR DE BÚSQUEDA' },
          { keys: 'PAUSE', label: 'CERRAR' },
        ]
      : [
          { keys: 'DPAD', label: 'NAVEGAR' },
          { keys: '1', label: 'ABRIR' },
          { keys: '2', label: 'CERRAR' },
          { keys: '3', label: focusedEquippable ? 'EQUIP' : STATUS_LABELS[statusFilter] },
          { keys: '4', label: 'BUSCAR' },
        ],
  })

  if (status === 'loading') {
    return (
      <div className="pokedex-shell">
        <p className="pokedex-empty" role="status">
          Cargando catálogo de PokéAPI...
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="pokedex-shell">
        <p className="pokedex-empty" role="alert">
          No se pudo cargar el catálogo. {error?.message}
        </p>
        <button className="btn" type="button" onClick={retry}>
          Reintentar
        </button>
      </div>
    )
  }

  if (inDetail) {
    return (
      <PokemonDetail
        id={detailId}
        onBack={() => (initialFocusId != null ? onClose() : setDetailId(null))}
        onClose={onClose}
        onPrev={() => setDetailId((current) => Math.max(1, current - 1))}
        onNext={() => setDetailId((current) => current + 1)}
      />
    )
  }

  return (
    <div className="pokedex-shell">
      <header className="pokedex-header">
        <div className="pokedex-titles">
          <h1>Pokédex{justEquipped && <span className="equip-toast"> POKÉMON EQUIPPED!</span>}</h1>
          <p className="pokedex-progress">
            {capturedCount} capturados · {discoveredCount} vistos · {entries.length} especies
          </p>
        </div>
        <div className="pokedex-pager">
          <button
            className="pager-btn"
            type="button"
            aria-label="Página anterior"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1, 0)}
          >
            <i className="glyph glyph-left" aria-hidden="true" />
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            className="pager-btn"
            type="button"
            aria-label="Página siguiente"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1, 0)}
          >
            <i className="glyph glyph-right" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="pokedex-controls">
        <input
          ref={searchInputRef}
          type="search"
          placeholder="Buscar nombre o número"
          aria-label="Buscar Pokémon por nombre o número"
          value={search}
          onFocus={() => setSearchActive(true)}
          onBlur={() => setSearchActive(false)}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') event.currentTarget.blur()
          }}
        />
        <div className="pokedex-filters" role="group" aria-label="Filtrar por estado">
          {STATUS_FILTERS.map((value, index) => (
            <button
              key={value}
              type="button"
              className={statusFilterIndex === index ? 'filter-btn active' : 'filter-btn'}
              aria-pressed={statusFilterIndex === index}
              onClick={() => {
                setStatusFilterIndex(index)
                setPage(1)
              }}
            >
              {STATUS_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      {pageEntries.length === 0 ? (
        <p className="pokedex-empty" role="status">
          Ningún Pokémon coincide con la búsqueda.
        </p>
      ) : (
        <div className="pokedex-grid" ref={gridRef}>
          {pageEntries.map((entry, index) => (
            <button
              key={entry.id}
              type="button"
              className={index === focusIndex ? 'pokedex-card-btn focused' : 'pokedex-card-btn'}
              onClick={() => {
                setFocusIndex(index)
                openDetail(entry.id)
              }}
            >
              <PokedexCard entry={entry} isActive={entry.id === activeId} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Pokedex
