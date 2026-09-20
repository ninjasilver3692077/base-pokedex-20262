import { Link } from 'react-router-dom'

function Battle() {
  return (
    <section className="screen">
      <h1>Batalla</h1>
      <p>(Sistema de combate pendiente de implementar)</p>
      <Link className="btn" to="/map">Volver al mapa</Link>
    </section>
  )
}

export default Battle
