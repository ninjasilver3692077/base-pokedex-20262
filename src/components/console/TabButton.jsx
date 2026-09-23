import ConsoleButton from './ConsoleButton.jsx'
import { INPUT_ACTIONS } from '../../input/inputActions.js'

function TabButton() {
  return (
    <ConsoleButton
      action={INPUT_ACTIONS.OPEN_POKEDEX}
      glyph="TAB"
      label="Abrir Pokédex"
      className="pill-btn tab-btn"
      variant="pill"
    />
  )
}

export default TabButton
