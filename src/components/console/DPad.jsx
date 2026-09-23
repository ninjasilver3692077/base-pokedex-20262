import ConsoleButton from './ConsoleButton.jsx'
import { INPUT_ACTIONS } from '../../input/inputActions.js'

// Cruceta física: cuatro ConsoleButton en cruz (ver console.css .dpad-*),
// cada uno atado a la misma acción MOVE_* que ArrowUp/WASD producen desde
// el teclado (InputProvider), así que caminar es idéntico venga de donde
// venga la pulsación.
function DPad() {
  return (
    <div className="dpad" role="group" aria-label="Movimiento">
      <ConsoleButton action={INPUT_ACTIONS.MOVE_UP} glyph={<i className="glyph glyph-up" />} label="Mover arriba" className="dpad-up" variant="dpad" />
      <ConsoleButton action={INPUT_ACTIONS.MOVE_LEFT} glyph={<i className="glyph glyph-left" />} label="Mover izquierda" className="dpad-left" variant="dpad" />
      <span className="dpad-center" aria-hidden="true" />
      <ConsoleButton action={INPUT_ACTIONS.MOVE_RIGHT} glyph={<i className="glyph glyph-right" />} label="Mover derecha" className="dpad-right" variant="dpad" />
      <ConsoleButton action={INPUT_ACTIONS.MOVE_DOWN} glyph={<i className="glyph glyph-down" />} label="Mover abajo" className="dpad-down" variant="dpad" />
    </div>
  )
}

export default DPad
