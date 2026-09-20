import { Link } from 'react-router-dom'

function Pokedex() {
  return (
    <section className="screen">
      <h1>Pokédex</h1>
      <p>(Catálogo pendiente de implementar)</p>
      <Link className="btn" to="/pokedex/1">Ver ejemplo de detalle</Link>
    </section>
  )
}

export default Pokedex
