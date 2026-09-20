import { Link, useParams } from 'react-router-dom'
import { getZoneById } from '../../game/zones.js'
import { capitalize } from '../../utils/text.js'

function Exploration() {
  const { zoneId } = useParams()
  const zone = getZoneById(zoneId)

  if (!zone) {
    return (
      <section className="screen">
        <h1>Zona desconocida</h1>
        <p>No existe una zona llamada "{zoneId}".</p>
        <Link className="btn" to="/map">Volver al mapa</Link>
      </section>
    )
  }

  return (
    <section className="screen">
      <h1>{zone.name}</h1>
      <p>{zone.description}</p>
      <div className="type-badges">
        {zone.types.map((type) => (
          <span key={type} className={`type-badge type-${type}`}>{capitalize(type)}</span>
        ))}
      </div>
      <p>(Sistema de encuentros pendiente de implementar)</p>
      <Link className="btn" to="/battle">Simular encuentro</Link>
    </section>
  )
}

export default Exploration
