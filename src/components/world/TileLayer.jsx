import { useMemo } from 'react'
import { getTileDef } from '../../game/tiles.js'

// Grid estático de tiles. Memoizado por map.id: no se re-renderiza cuando
// se mueve la cámara o el jugador, solo cuando cambia el mapa.
function TileLayer({ map }) {
  const rows = useMemo(
    () =>
      map.tiles.map((row, y) =>
        row.map((tileType, x) => ({
          key: `${x}-${y}`,
          className: getTileDef(tileType).className,
        })),
      ),
    [map],
  )

  return (
    <div
      className="tile-layer"
      style={{ gridTemplateColumns: `repeat(${map.width}, var(--tile-size))` }}
    >
      {rows.flat().map((cell) => (
        <div key={cell.key} className={`tile ${cell.className}`} />
      ))}
    </div>
  )
}

export default TileLayer
