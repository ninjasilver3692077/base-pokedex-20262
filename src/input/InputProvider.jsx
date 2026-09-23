import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { CODE_TO_ACTION } from './keyboardBindings.js'

// Dos contextos separados a propósito: `pressed` cambia en cada
// tecla/toque (para que D-pad y botones se iluminen), mientras que
// `press`/`release`/las funciones de registro son estables. Si fueran un
// solo contexto, cada pantalla que solo necesita registrar acciones
// (useConsoleActions) se re-renderizaría en cada pulsación ajena.
const InputPressedContext = createContext(null)
const InputActionsContext = createContext(null)
const InputContextInfoContext = createContext(null)

const NO_HINTS = []

function isTextEntryTarget(target) {
  const tag = target?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA'
}

// Compara contexto + pistas por contenido: las pantallas re-registran en
// cada render con arrays nuevos, y sin esta comparación el setState de
// syncActiveContext no podría descartar los cambios vacíos.
function sameContextInfo(a, b) {
  if (a.context !== b.context) return false
  if (a.hints.length !== b.hints.length) return false
  return a.hints.every((hint, i) => hint.label === b.hints[i].label && String(hint.keys) === String(b.hints[i].keys))
}

// Único listener de teclado de todo el juego. Traduce tecla -> acción
// abstracta y la reparte por dos canales: el set `pressed` (feedback visual,
// igual venga de teclado, mouse o touch) y un stack de handlers por pantalla
// (acciones puntuales tipo ACTION_1..4). El D-pad físico en pantalla llama a
// los mismos press()/release() que el teclado, así que nunca hay dos
// implementaciones de "qué significa moverse" que puedan desincronizarse.
export function InputProvider({ children }) {
  const [pressed, setPressed] = useState(() => new Set())
  const [contextInfo, setContextInfo] = useState({ context: null, hints: NO_HINTS })
  const handlerStackRef = useRef([])
  const rawListenersRef = useRef(new Map())

  const press = useCallback((action) => {
    setPressed((prev) => (prev.has(action) ? prev : new Set(prev).add(action)))
    rawListenersRef.current.get(action)?.forEach((listener) => listener.onPress?.())
    for (let i = handlerStackRef.current.length - 1; i >= 0; i -= 1) {
      const handler = handlerStackRef.current[i].handlers[action]
      if (typeof handler === 'function') {
        handler()
        break
      }
    }
  }, [])

  const release = useCallback((action) => {
    setPressed((prev) => {
      if (!prev.has(action)) return prev
      const next = new Set(prev)
      next.delete(action)
      return next
    })
    rawListenersRef.current.get(action)?.forEach((listener) => listener.onRelease?.())
  }, [])

  // El tope del stack manda: define tanto qué handler recibe cada acción
  // como qué contexto (WORLD, BATTLE, POKEDEX...) y qué pistas muestra la
  // ContextControlBar. Los overlays se montan encima de la pantalla
  // enrutada y por eso interceptan primero, sin prioridad explícita.
  const syncActiveContext = useCallback(() => {
    const top = handlerStackRef.current[handlerStackRef.current.length - 1]
    const next = { context: top?.context ?? null, hints: top?.hints ?? NO_HINTS }
    setContextInfo((prev) => (sameContextInfo(prev, next) ? prev : next))
  }, [])

  // `global: true` entra por el fondo del stack. Hace falta porque los
  // efectos de un hijo corren ANTES que los del padre: sin esto, el
  // registro global de GameConsole quedaba encima de la pantalla montada
  // y le robaba el contexto (la barra de ayudas salía vacía).
  const registerHandlers = useCallback(
    (entry) => {
      if (entry.global) handlerStackRef.current.unshift(entry)
      else handlerStackRef.current.push(entry)
      syncActiveContext()
      return () => {
        handlerStackRef.current = handlerStackRef.current.filter((item) => item !== entry)
        syncActiveContext()
      }
    },
    [syncActiveContext],
  )

  // Canal aparte para el movimiento: necesita saber cuándo una dirección se
  // presiona/suelta (no solo "se presionó una vez") para sostener el
  // intervalo de paso mientras la tecla o el D-pad siguen abajo.
  const registerRawListener = useCallback((action, listener) => {
    if (!rawListenersRef.current.has(action)) rawListenersRef.current.set(action, new Set())
    const set = rawListenersRef.current.get(action)
    set.add(listener)
    return () => set.delete(listener)
  }, [])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.repeat || isTextEntryTarget(event.target)) return
      const action = CODE_TO_ACTION[event.code]
      if (!action) return
      event.preventDefault()
      press(action)
    }
    function handleKeyUp(event) {
      if (isTextEntryTarget(event.target)) return
      const action = CODE_TO_ACTION[event.code]
      if (!action) return
      release(action)
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [press, release])

  const actionsValue = useMemo(
    () => ({ press, release, registerHandlers, registerRawListener }),
    [press, release, registerHandlers, registerRawListener],
  )

  return (
    <InputActionsContext.Provider value={actionsValue}>
      <InputContextInfoContext.Provider value={contextInfo}>
        <InputPressedContext.Provider value={pressed}>{children}</InputPressedContext.Provider>
      </InputContextInfoContext.Provider>
    </InputActionsContext.Provider>
  )
}

function useInputActions() {
  const context = useContext(InputActionsContext)
  if (!context) throw new Error('useInputActions debe usarse dentro de <InputProvider>')
  return context
}

// Para que ConsoleButton/D-pad se iluminen igual si el press vino del
// teclado real o de un toque en pantalla.
export function usePressed(action) {
  const pressed = useContext(InputPressedContext)
  return pressed?.has(action) ?? false
}

export function useInputPress() {
  const { press, release } = useInputActions()
  return { press, release }
}

// Contexto de input activo (TITLE, WORLD, BATTLE, POKEDEX...) y las pistas
// que debe mostrar la barra de controles contextuales.
export function useInputContextInfo() {
  return useContext(InputContextInfoContext) ?? { context: null, hints: NO_HINTS }
}

// Registra, mientras el componente esté montado: qué hace cada acción
// puntual, en qué contexto está el juego y qué pistas se anuncian en
// pantalla. Se re-registra en cada render (barato: push/filter de un array
// pequeño) para que los handlers siempre vean el estado más reciente sin
// necesitar refs manuales en cada pantalla.
// `handlers: null` = no registrar nada. Lo usa una pantalla que delega
// todo en un hijo (la Pokédex cuando muestra una ficha): si registrara un
// mapa vacío, su entrada quedaría por encima de la del hijo —los efectos
// del padre corren después— y le robaría el contexto.
export function useConsoleActions(handlers, { context = null, hints = NO_HINTS, global = false } = {}) {
  const { registerHandlers } = useInputActions()
  useEffect(() => {
    if (!handlers) return undefined
    return registerHandlers({ handlers, context, hints, global })
  })
}

// Para direcciones de movimiento: onPress/onRelease en vez de un disparo
// puntual, así useWorldMovement puede sostener su propio intervalo de paso
// mientras la acción sigue presionada.
export function useRawInputAction(action, handlers) {
  const { registerRawListener } = useInputActions()
  useEffect(() => registerRawListener(action, handlers))
}
