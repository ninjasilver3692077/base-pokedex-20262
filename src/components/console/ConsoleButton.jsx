import { useInputPress, usePressed } from '../../input/InputProvider.jsx'

const ACTIVATE_KEYS = new Set(['Enter', ' '])

// Botón físico de la consola: mismo canal press()/release() para
// pointerdown/up (mouse/touch), Enter/Espacio (teclado, foco en el propio
// botón) y para las teclas reales del juego (via InputProvider). El estado
// `.is-pressed` refleja cualquiera de esas fuentes por igual, por eso W
// enciende la ▲ del D-pad aunque el foco esté en otro lado.
function ConsoleButton({ action, glyph, label, className = '', variant = 'action', disabled = false }) {
  const { press, release } = useInputPress()
  const isPressed = usePressed(action)

  function handlePointerDown(event) {
    if (disabled) return
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    press(action)
  }

  function handlePointerUp(event) {
    if (disabled) return
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    release(action)
  }

  function handleKeyDown(event) {
    if (disabled || event.repeat || !ACTIVATE_KEYS.has(event.key)) return
    event.preventDefault()
    press(action)
  }

  function handleKeyUp(event) {
    if (disabled || !ACTIVATE_KEYS.has(event.key)) return
    release(action)
  }

  return (
    <button
      type="button"
      className={`console-btn console-btn-${variant} ${isPressed ? 'is-pressed' : ''} ${className}`}
      aria-label={label}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <span aria-hidden="true">{glyph}</span>
    </button>
  )
}

export default ConsoleButton
