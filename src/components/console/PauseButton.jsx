import ConsoleButton from './ConsoleButton.jsx'
import { INPUT_ACTIONS } from '../../input/inputActions.js'

function PauseButton() {
  return (
    <ConsoleButton
      action={INPUT_ACTIONS.TOGGLE_PAUSE}
      glyph="PAUSE"
      label="Pausar juego"
      className="pill-btn pause-btn"
      variant="pill"
    />
  )
}

export default PauseButton
