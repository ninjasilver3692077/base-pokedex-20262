import ContextControls from './ContextControls.jsx'

// Viewport fijo de la consola: todo lo que el juego dibuja vive acá dentro
// (ver console.css). El contenido ocupa la parte flexible y la barra de
// controles contextuales reserva una franja inferior estable, así que
// nunca tapa al juego ni lo empuja fuera de la pantalla.
function ConsoleScreen({ children }) {
  return (
    <div className="console-screen">
      <div className="console-screen-viewport">
        <div className="screen-content">{children}</div>
        <ContextControls />
      </div>
    </div>
  )
}

export default ConsoleScreen
