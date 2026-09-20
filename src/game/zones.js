// Reglas propias del juego: qué tipos de Pokémon pueden aparecer en cada
// zona. Son reglas internas de diseño, no una clasificación oficial de
// PokéAPI. Se usan (Fase 6) para filtrar especies candidatas a partir del
// recurso /type de PokéAPI.
export const ZONES = [
  {
    id: 'forest',
    name: 'Forest',
    description: 'Un bosque denso donde abundan las plantas y los insectos.',
    types: ['grass', 'bug', 'poison'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Aguas abiertas, frías y profundas.',
    types: ['water', 'ice'],
  },
  {
    id: 'volcano',
    name: 'Volcano',
    description: 'Tierra volcánica ardiente y rocosa.',
    types: ['fire', 'rock', 'ground'],
  },
  {
    id: 'power-plant',
    name: 'Power Plant',
    description: 'Una instalación abandonada llena de maquinaria eléctrica.',
    types: ['electric', 'steel'],
  },
  {
    id: 'mountain',
    name: 'Mountain',
    description: 'Picos escarpados azotados por el viento.',
    types: ['rock', 'flying', 'fighting'],
  },
  {
    id: 'dark-cave',
    name: 'Dark Cave',
    description: 'Túneles sin luz donde acechan criaturas sombrías.',
    types: ['ghost', 'dark', 'rock'],
  },
  {
    id: 'frozen-lands',
    name: 'Frozen Lands',
    description: 'Un páramo helado cubierto de nieve permanente.',
    types: ['ice', 'water'],
  },
  {
    id: 'desert',
    name: 'Desert',
    description: 'Dunas interminables bajo un sol abrasador.',
    types: ['ground', 'rock', 'fire'],
  },
]

export function getZoneById(id) {
  return ZONES.find((zone) => zone.id === id) ?? null
}
