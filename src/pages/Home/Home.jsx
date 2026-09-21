import { Link } from 'react-router-dom'
import { useGame } from '../../context/GameContext.jsx'
import { GAME_ACTIONS } from '../../context/gameReducer.js'

function Home() {
  const { state, dispatch } = useGame()
  const hasProgress = state.starterPokemonId != null

  function handleReset() {
    // window.confirm es suficiente: es destructivo pero el botón ni
    // siquiera se muestra sin progreso, no amerita un modal propio.
    const confirmed = window.confirm(
      '¿Reiniciar la expedición? Perderás tu starter, tu Pokédex y tu posición en el mundo.',
    )
    if (!confirmed) return
    dispatch({ type: GAME_ACTIONS.RESET_GAME })
  }

  return (
    <section className="home-screen">
      <div className="home-copy">
        <p className="eyebrow">REGIÓN AURORA · 01</p>
        <h1>
          Pokémon
          <br />
          <span>Expedition</span>
        </h1>
        <p className="home-tagline">
          Un mundo vivo espera
          <br />
          al otro lado del sendero.
        </p>
        <Link className="btn btn-primary" to="/starter">
          Nueva expedición <span className="btn-arrow" aria-hidden="true" />
        </Link>
        <Link className="home-secondary" to="/pokedex">Abrir Pokédex</Link>
        {hasProgress && (
          <button type="button" className="home-reset" onClick={handleReset}>
            Reiniciar expedición
          </button>
        )}
      </div>
      <div className="home-landscape" aria-hidden="true">
        <div className="sun" />
        <div className="mountain mountain-back" />
        <div className="mountain mountain-front" />
        <div className="home-tree tree-one" />
        <div className="home-tree tree-two" />
        <div className="home-path" />
      </div>
    </section>
  )
}

export default Home
