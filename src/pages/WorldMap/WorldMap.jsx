import { Link } from 'react-router-dom'
import GameViewport from '../../components/world/GameViewport.jsx'
import { CENTRAL_TOWN_MAP } from '../../game/maps/central-town.js'

// Fase 11C: primer montaje del viewport de tiles/cámara, foco estático en
// el spawn. El movimiento real del jugador y el resto de zonas como
// regiones jugables llegan en 11D/11E; el listado de zonas como tarjetas
// se retira entonces. Por ahora esto solo valida render + clamping.
function WorldMap() {
  return (
    <section className="screen pokedex-screen">
      <h1>Mapa del mundo</h1>
      <p>Vista previa del viewport del mundo (Fase 11C) — movimiento en la próxima fase.</p>

      <GameViewport map={CENTRAL_TOWN_MAP} focus={CENTRAL_TOWN_MAP.spawn} />

      <Link to="/pokedex" className="text-link">Ver Pokédex</Link>
    </section>
  )
}

export default WorldMap
