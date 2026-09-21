import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../context/GameContext.jsx'
import { GAME_ACTIONS } from '../../context/gameReducer.js'
import { usePokemon } from '../../hooks/usePokemon.js'
import { capitalize } from '../../utils/text.js'

const STARTERS = [1, 4, 7]

function StarterCard({ id, selected, onSelect }) {
  const { status, pokemon } = usePokemon(id)
  return <button className={`starter-card ${selected ? 'selected' : ''}`} type="button" onClick={() => onSelect(id)} disabled={status !== 'ready'}>
    <div className="starter-sprite">{pokemon?.sprites?.front_default ? <img src={pokemon.sprites.front_default} alt={pokemon.name} /> : '…'}</div>
    <strong>{pokemon ? capitalize(pokemon.name) : 'Cargando'}</strong>
    <span>{pokemon ? pokemon.types.map(({ type }) => capitalize(type.name)).join(' · ') : 'PokéAPI'}</span>
  </button>
}

function StarterSelection() {
  const [selected, setSelected] = useState(null)
  const { dispatch } = useGame()
  const navigate = useNavigate()
  function confirm() {
    if (!selected) return
    dispatch({ type: GAME_ACTIONS.SET_STARTER, id: selected })
    dispatch({ type: GAME_ACTIONS.DISCOVER_POKEMON, id: selected })
    dispatch({ type: GAME_ACTIONS.CAPTURE_POKEMON, id: selected })
    navigate('/map')
  }
  return (
    <section className="screen starter-screen">
      <p className="eyebrow">PRIMERA EXPEDICIÓN</p>
      <h1>Elige tu compañero</h1>
      <p className="screen-lead">Tu aventura empieza con una decisión. Consulta los datos de PokéAPI y elige el estilo que te acompañará.</p>
      <div className="starter-grid">{STARTERS.map((id) => <StarterCard key={id} id={id} selected={selected === id} onSelect={setSelected} />)}</div>
      <button className="btn btn-primary" type="button" disabled={!selected} onClick={confirm}>
      Comenzar expedición <span className="btn-arrow" aria-hidden="true" /></button>
    </section>
  )
}

export default StarterSelection
