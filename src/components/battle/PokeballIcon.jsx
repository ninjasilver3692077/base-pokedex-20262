// Ícono de Pokéball dibujado en CSS (sin asset de imagen), reutilizable
// para cualquier intento de captura. La animación de lanzamiento/shake la
// decide la clase pokeball-attempt-{result} (ver animations.css).
function PokeballIcon({ result }) {
  return (
    <div className={`pokeball-icon pokeball-attempt-${result}`} aria-hidden="true">
      <span className="pokeball-button" />
    </div>
  )
}

export default PokeballIcon
