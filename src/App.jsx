import { Routes, Route } from 'react-router-dom'
import NavBar from './components/common/NavBar.jsx'
import Home from './pages/Home/Home.jsx'
import StarterSelection from './pages/StarterSelection/StarterSelection.jsx'
import WorldMap from './pages/WorldMap/WorldMap.jsx'
import Exploration from './pages/Exploration/Exploration.jsx'
import Battle from './pages/Battle/Battle.jsx'
import Pokedex from './pages/Pokedex/Pokedex.jsx'
import PokemonDetails from './pages/PokemonDetails/PokemonDetails.jsx'
import NotFound from './pages/NotFound/NotFound.jsx'

function App() {
  return (
    <>
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/starter" element={<StarterSelection />} />
          <Route path="/map" element={<WorldMap />} />
          <Route path="/explore/:zoneId" element={<Exploration />} />
          <Route path="/battle" element={<Battle />} />
          <Route path="/pokedex" element={<Pokedex />} />
          <Route path="/pokedex/:pokemonId" element={<PokemonDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}

export default App
