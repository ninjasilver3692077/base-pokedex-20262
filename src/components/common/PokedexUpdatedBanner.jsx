import { capitalize } from '../../utils/text.js'

function PokedexUpdatedBanner({ pokemonName, onDismiss }) {
  return (
    <div className="pokedex-updated-banner" role="status">
      <div>
        <strong>POKÉDEX UPDATED!</strong>
        <p>{capitalize(pokemonName)} se registró en tu Pokédex.</p>
      </div>
      <button type="button" className="pokedex-updated-close" onClick={onDismiss} aria-label="Cerrar notificación">
        ×
      </button>
    </div>
  )
}

export default PokedexUpdatedBanner
