import { Link, useParams } from 'react-router-dom'

function PokemonDetails() {
  const { pokemonId } = useParams()

  return (
    <section className="screen">
      <h1>Detalle del Pokémon #{pokemonId}</h1>
      <p>(Datos de PokéAPI pendientes de integrar)</p>
      <Link className="btn" to="/pokedex">Volver a la Pokédex</Link>
    </section>
  )
}

export default PokemonDetails
