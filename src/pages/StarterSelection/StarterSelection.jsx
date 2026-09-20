import { Link } from 'react-router-dom'

function StarterSelection() {
  return (
    <section className="screen">
      <h1>Elige tu Pokémon inicial</h1>
      <p>(Selección de starter pendiente de implementar)</p>
      <Link className="btn" to="/map">Continuar al mapa</Link>
    </section>
  )
}

export default StarterSelection
