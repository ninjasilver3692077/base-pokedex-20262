import { Link } from 'react-router-dom'

const placeholderZones = ['forest', 'ocean', 'volcano']

function WorldMap() {
  return (
    <section className="screen">
      <h1>Mapa del mundo</h1>
      <ul className="zone-list">
        {placeholderZones.map((zoneId) => (
          <li key={zoneId}>
            <Link className="btn" to={`/explore/${zoneId}`}>{zoneId}</Link>
          </li>
        ))}
      </ul>
      <Link to="/pokedex">Ver Pokédex</Link>
    </section>
  )
}

export default WorldMap
