// Audio del juego sobre HTMLAudioElement nativo: los archivos viven en
// public/sounds y se piden por BASE_URL para que la ruta siga siendo
// válida bajo el subdirectorio de GitHub Pages.
const SFX_FILES = {
  attack: 'Attack.wav',
  hardAttack: 'Hard_Attack.wav',
  captured: 'Captured.wav',
  pokeMenu: 'Poke_Menu.wav',
  select: 'Select.wav',
}

// Niveles calibrados a oído contra los archivos reales: los .wav de
// efectos vienen bastante más calientes que el mp3 de música, así que no
// comparten volumen.
const SFX_VOLUME = 0.55
const MUSIC_VOLUME = 0.18

const MUTE_KEY = 'pokemon-expedition:muted'

function url(file) {
  return `${import.meta.env.BASE_URL}sounds/${file}`
}

let muted = false
try {
  muted = localStorage.getItem(MUTE_KEY) === 'true'
} catch {
  // Safari en modo privado lanza al tocar localStorage: arrancar con sonido.
}

// Un elemento "plantilla" por efecto, solo para que el navegador cachee el
// archivo; cada reproducción usa un clon, de modo que dos efectos seguidos
// (golpe + grito de captura) suenen superpuestos en vez de cortarse.
const templates = {}
for (const [name, file] of Object.entries(SFX_FILES)) {
  const audio = new Audio(url(file))
  audio.preload = 'auto'
  templates[name] = audio
}

const music = new Audio(url('Music.mp3'))
music.loop = true
music.volume = MUSIC_VOLUME
music.preload = 'auto'

// Dos disparos del MISMO efecto en el mismo instante no suenan como dos
// golpes, solo suben el volumen del golpe: se descartan. Pasa de verdad
// con StrictMode, que monta y remonta cada componente en desarrollo y
// duplicaría el sonido de abrir la Pokédex.
const MIN_REPEAT_MS = 80
const lastPlayedAt = {}

export function playSound(name) {
  if (muted) return
  const template = templates[name]
  if (!template) return

  const now = performance.now()
  if (now - (lastPlayedAt[name] ?? -Infinity) < MIN_REPEAT_MS) return
  lastPlayedAt[name] = now

  const sound = template.cloneNode()
  sound.volume = SFX_VOLUME
  // Sin gesto previo del usuario el navegador rechaza la promesa; no es un
  // fallo que el jugador deba ver, el siguiente efecto ya sonará.
  sound.play().catch(() => {})
}

export function isMuted() {
  return muted
}

export function toggleMute() {
  muted = !muted
  try {
    localStorage.setItem(MUTE_KEY, String(muted))
  } catch {
    // Sin persistencia el mute sigue valiendo para esta sesión.
  }

  if (muted) music.pause()
  else music.play().catch(() => {})

  return muted
}

// Las políticas de autoplay bloquean el audio hasta que el usuario
// interactúa con la página, así que la música arranca en el primer clic o
// tecla y el listener se retira solo.
export function startMusicOnFirstGesture() {
  function start() {
    if (!muted) music.play().catch(() => {})
    window.removeEventListener('pointerdown', start)
    window.removeEventListener('keydown', start)
  }

  window.addEventListener('pointerdown', start)
  window.addEventListener('keydown', start)
}

// Sonido de selección para toda la interfaz desde un solo listener
// delegado, en vez de un onClick repetido en cada botón de cada página.
// Los controles con su propio sonido (las acciones de combate) se marcan
// con data-sfx="off" y quedan fuera.
export function initUiSelectSound() {
  document.addEventListener('click', (event) => {
    // `button` ya cubre filter-btn/starter-row/menu-option/pokedex-card-btn/
    // los botones de la consola (todos son <button>); solo hace falta listar
    // los <a> que no lo son.
    const control = event.target.closest('button, a.btn')
    if (!control || control.disabled) return
    if (control.closest('[data-sfx="off"]')) return
    playSound('select')
  })
}
