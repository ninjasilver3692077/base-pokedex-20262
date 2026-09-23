import { useInputContextInfo } from '../../input/InputProvider.jsx'

// Glifos de teclas dibujados con CSS (ver .glyph-* en console.css): los
// caracteres ▲▼◀▶ salen deformados en las fuentes pixel.
const ARROW_KEYS = {
  DPAD: ['up', 'down', 'left', 'right'],
  UD: ['up', 'down'],
  LR: ['left', 'right'],
}

function KeyCap({ keyId }) {
  const arrows = ARROW_KEYS[keyId]
  return (
    <span className="context-hint-key">
      {arrows
        ? arrows.map((dir) => <i key={dir} className={`glyph glyph-${dir}`} aria-hidden="true" />)
        : keyId}
    </span>
  )
}

// Única fuente de las ayudas en pantalla: cada pantalla declara sus pistas
// en useConsoleActions y esta barra las dibuja, en vez de repetir textos
// sueltos por cada componente.
function ContextControls() {
  const { context, hints } = useInputContextInfo()

  if (hints.length === 0) return <div className="context-controls" aria-hidden="true" />

  // data-context permite enfatizar la barra donde los comandos son la
  // interacción principal (BATTLE), sin duplicar el texto en la pantalla.
  return (
    <div className="context-controls" data-context={context ?? undefined} role="group" aria-label="Controles disponibles">
      {hints.map(({ keys, label }) => (
        <span className="context-hint" key={`${keys}-${label}`}>
          {[].concat(keys).map((keyId) => (
            <KeyCap key={keyId} keyId={keyId} />
          ))}
          <span className="context-hint-label">{label}</span>
        </span>
      ))}
    </div>
  )
}

export default ContextControls
