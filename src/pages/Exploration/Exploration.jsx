import { Link, useParams } from 'react-router-dom'

function Exploration() {
  const { zoneId } = useParams()

  return (
    <section className="screen">
      <h1>Explorando: {zoneId}</h1>
      <p>(Sistema de encuentros pendiente de implementar)</p>
      <Link className="btn" to="/battle">Simular encuentro</Link>
    </section>
  )
}

export default Exploration
