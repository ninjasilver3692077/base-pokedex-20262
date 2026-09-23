import ConsoleButton from './ConsoleButton.jsx'
import { INPUT_ACTIONS } from '../../input/inputActions.js'

// Los cuatro botones físicos nunca cambian de significado a nivel de
// hardware: lo que hacen depende de qué pantalla los registró vía
// useConsoleActions (ver World/Battle/Pokedex/Home/PauseOverlay). La
// pantalla es quien dibuja los soft labels ("1 ATTACK", "1 SELECT", ...).
const BUTTONS = [
  { action: INPUT_ACTIONS.ACTION_1, glyph: '1', className: 'action-btn-1' },
  { action: INPUT_ACTIONS.ACTION_2, glyph: '2', className: 'action-btn-2' },
  { action: INPUT_ACTIONS.ACTION_3, glyph: '3', className: 'action-btn-3' },
  { action: INPUT_ACTIONS.ACTION_4, glyph: '4', className: 'action-btn-4' },
]

function ActionButtons() {
  return (
    <div className="action-cluster" role="group" aria-label="Botones de acción">
      {BUTTONS.map(({ action, glyph, className }) => (
        <ConsoleButton key={action} action={action} glyph={glyph} label={`Botón ${glyph}`} className={className} variant="round" />
      ))}
    </div>
  )
}

export default ActionButtons
