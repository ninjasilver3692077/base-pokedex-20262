const DIRECTIONS = [
  { direction: 'up', label: 'Arriba', glyph: '▲', className: 'pad-up' },
  { direction: 'left', label: 'Izquierda', glyph: '◀', className: 'pad-left' },
  { direction: 'right', label: 'Derecha', glyph: '▶', className: 'pad-right' },
  { direction: 'down', label: 'Abajo', glyph: '▼', className: 'pad-down' },
]

// Cruceta en pantalla: mismo `step` que el teclado, para poder jugar sin
// teclado (móvil, tablet) sin duplicar la lógica de movimiento.
function TouchPad({ onStep, disabled }) {
  return (
    <div className="touch-pad hud-panel" role="group" aria-label="Controles de movimiento">
      {DIRECTIONS.map(({ direction, label, glyph, className }) => (
        <button
          key={direction}
          type="button"
          className={`pad-btn ${className}`}
          aria-label={label}
          disabled={disabled}
          onClick={() => onStep(direction)}
        >
          <span aria-hidden="true">{glyph}</span>
        </button>
      ))}
    </div>
  )
}

export default TouchPad
