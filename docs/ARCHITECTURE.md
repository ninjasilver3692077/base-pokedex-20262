# Pokémon Expedition — Fase 0: Arquitectura

## Estado de partida
Repo vacío (solo `README.md`). No hay código previo que adaptar.

## MVP
Elegir starter → explorar zonas → encontrar Pokémon salvaje → batalla simple → intentar
captura → Pokédex con progreso persistente. Sin backend, sin cuentas de usuario.

## Flujo de usuario
`Home → Starter Selection → World Map → Exploration → Battle → (vuelta a World Map)`,
con `Pokedex` y `Pokemon Details` accesibles en cualquier momento. Progreso persiste
entre recargas vía `localStorage`.

## Stack
React + Vite + React Router + Context API + `useReducer` + CSS + `localStorage`.
Sin backend, sin librerías de estado o animación adicionales (según lo acordado).

## Modelo de especies vs. variantes
`pokemon-species` es el catálogo de progreso (una entrada = una especie descubrible).
`pokemon` da stats/tipos/sprites de combate. Formas alternativas/regionales/Mega no
cuentan como especies nuevas: siempre se resuelve la especie base antes de actualizar
el progreso.

## Endpoints de PokéAPI usados
- `GET /pokemon-species?limit&offset` — catálogo ligero (id, nombre, url) + `count` total dinámico.
- `GET /pokemon-species/{id|name}` — datos de especie (capture_rate, flavor text, etc.).
- `GET /pokemon/{id|name}` — stats, tipos, habilidades, sprites para combate/detalle.
- `GET /type/{name}` — especies candidatas por tipo, cruzadas con las reglas de zona.

## Estrategia de carga y cache
- Al iniciar: solo el catálogo ligero (una página o el listado completo id+nombre, sin detalles).
- Detalles de un Pokémon se piden bajo demanda (encuentro, apertura de detalle).
- Cache en memoria por id (`Map`) para no repetir peticiones dentro de la sesión.
- Nunca `Promise.all` sobre todo el catálogo.

## Modelo de estado persistido (localStorage)
```js
{
  version: 1,
  starterPokemonId: null,
  discoveredPokemonIds: [],
  capturedPokemonIds: [],
  selectedPokemonId: null,
  teamPokemonIds: []
}
```
Los arrays se tratan como sets (sin depender del orden). Lectura defensiva: si falta la
clave, es JSON inválido, o `version` no coincide, se cae a estado inicial en lugar de
romper la app.

## Reglas de juego (resumen operativo)
- Zona → tipos permitidos (regla propia del juego, no de PokéAPI) → especies candidatas
  → selección aleatoria → encuentro.
- Estados de Pokédex: `undiscovered → discovered → captured`, nunca retrocede.
- Primer avistamiento de una especie = `discovered` inmediato y persistente, incluso si
  el combate se pierde/huye/falla la captura.
- Batalla: HP jugador/enemigo, acciones `Attack / Special / Pokéball / Run`, lógica en
  `game/battle.js` separada de los componentes.
- Captura: probabilidad crece cuando baja el HP enemigo, usando `capture_rate` como
  factor; fórmula simple y explicable en `game/capture.js`.

## Estructura de carpetas
Se adopta la estructura de referencia del brief (`src/api`, `src/components`,
`src/pages`, `src/context`, `src/hooks`, `src/game`, `src/styles`, `src/utils`) al
crear el proyecto en Fase 1, ya que no hay organización previa que conservar.

## Criterios de aceptación de esta fase
- [x] Fuente de datos única: PokéAPI (sin datos hardcodeados de Pokémon).
- [x] Total de especies siempre dinámico (nunca una constante como 151).
- [x] Estrategia de carga bajo demanda + cache definida antes de escribir código.
- [x] Modelo de estado y persistencia definidos y versionados.
- [ ] Código — empieza en Fase 1.
