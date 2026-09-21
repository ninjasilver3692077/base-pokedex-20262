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

  // El suelo del bioma se pinta una sola vez como fondo repetido de la
  // grilla: así un árbol, una roca o una señal pueden ser transparentes
  // y apoyarse sobre arena, nieve o basalto según el mapa, en vez de
  // llevar un cuadro de pasto pegado (que era lo que dejaba parches
  // verdes en el océano y el volcán).
  return (
    <div
      className={`tile-layer ${getTileDef(map.baseTile ?? 'grass').className}`}
      style={{
        gridTemplateColumns: `repeat(${map.width}, var(--tile-size))`,
        // Tamaño explícito: sin esto el elemento mide lo que el
        // viewport y su fondo (el suelo del bioma) no llega a cubrir
        // toda la grilla, dejando ver el fondo del marco.
        width: `calc(var(--tile-size) * ${map.width})`,
        height: `calc(var(--tile-size) * ${map.height})`,
      }}
    >
      {rows.flat().map((cell) => (
        <div key={cell.key} className={`tile ${cell.className}`} />
      ))}
    </div>
  )
}

export default TileLayer
