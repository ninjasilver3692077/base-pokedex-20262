// Entrenador chibi original a 16x16, dibujado como bloques SVG (no un
// asset descargado ni una copia del sprite oficial de ningún juego):
// gorra roja con visera, chaqueta azul con sombra lateral, pantalón y
// zapatos. 4 direcciones abstractas, nítido al escalar
// (shapeRendering="crispEdges"). Fácil de reemplazar por un asset real
// más adelante: toda la definición vive en este único archivo.
const SKIN = '#f0c090'
const HAIR = '#2b1d12'
const CAP_RED = '#e3350d'
const CAP_BRIM = '#fdfdfd'
const JACKET = '#2a75bb'
const JACKET_SHADOW = '#1f5a91'
const PANTS = '#26311f'
const SHOE = '#fdfdfd'

const SPRITES = {
  down: [
    [5, 1, 6, 3, CAP_RED],
    [4, 3, 8, 2, CAP_RED],
    [4, 4, 8, 1, CAP_BRIM],
    [5, 5, 6, 3, SKIN],
    [6, 6, 1, 1, HAIR],
    [9, 6, 1, 1, HAIR],
    [4, 8, 8, 5, JACKET],
    [4, 8, 2, 5, JACKET_SHADOW],
    [10, 8, 2, 5, JACKET_SHADOW],
    [5, 13, 2, 2, PANTS],
    [9, 13, 2, 2, PANTS],
    [5, 15, 2, 1, SHOE],
    [9, 15, 2, 1, SHOE],
  ],
  up: [
    [4, 1, 8, 4, CAP_RED],
    [5, 5, 6, 3, HAIR],
    [4, 8, 8, 5, JACKET],
    [4, 8, 2, 5, JACKET_SHADOW],
    [10, 8, 2, 5, JACKET_SHADOW],
    [5, 13, 2, 2, PANTS],
    [9, 13, 2, 2, PANTS],
    [5, 15, 2, 1, SHOE],
    [9, 15, 2, 1, SHOE],
  ],
  left: [
    [4, 1, 7, 3, CAP_RED],
    [3, 3, 2, 2, CAP_RED],
    [5, 5, 5, 3, SKIN],
    [5, 6, 1, 1, HAIR],
    [4, 8, 7, 5, JACKET],
    [4, 8, 2, 5, JACKET_SHADOW],
    [5, 13, 2, 2, PANTS],
    [8, 13, 2, 2, PANTS],
    [5, 15, 2, 1, SHOE],
  ],
  right: [
    [5, 1, 7, 3, CAP_RED],
    [11, 3, 2, 2, CAP_RED],
    [6, 5, 5, 3, SKIN],
    [10, 6, 1, 1, HAIR],
    [5, 8, 7, 5, JACKET],
    [10, 8, 2, 5, JACKET_SHADOW],
    [6, 13, 2, 2, PANTS],
    [9, 13, 2, 2, PANTS],
    [9, 15, 2, 1, SHOE],
  ],
}

function TrainerSprite({ direction }) {
  const blocks = SPRITES[direction] ?? SPRITES.down

  return (
    <svg className="trainer-sprite" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      {blocks.map(([x, y, width, height, fill], index) => (
        <rect key={index} x={x} y={y} width={width} height={height} fill={fill} />
      ))}
    </svg>
  )
}

export default TrainerSprite
