import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="screen">
      <h1>Pokémon Expedition</h1>
      <p>Explora, descubre y colecciona.</p>
      <Link className="btn" to="/starter">Empezar</Link>
    </section>
  )
}

export default Home
