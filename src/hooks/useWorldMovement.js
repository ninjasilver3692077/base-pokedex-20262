import { useCallback, useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext.jsx'
import { GAME_ACTIONS } from '../context/gameReducer.js'
import { resolveStep } from '../game/movement.js'

const STEP_INTERVAL_MS = 150

const KEY_DIRECTIONS = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
}

// Movimiento por pasos discretos (no por frame): mientras haya una tecla
// de dirección presionada, despacha un MOVE_PLAYER cada
// STEP_INTERVAL_MS. La posición se lee de un ref (no del estado
// reactivo) para que los listeners/el intervalo no se reinstalen en cada
// paso — si dependieran de state.playerPosition, React desmontaría y
// recrearía el efecto en cada movimiento y el setInterval nunca llegaría
// a disparar dos veces mientras la tecla sigue apretada.
//
// `onStep(tileType, position)` se invoca en cada paso EFECTIVO (no
// bloqueado) con el tile pisado: es el enganche del mundo con los
// encuentros y los portales. Vive en un ref por el mismo motivo que la
// posición: que cambie no debe reinstalar los listeners.
export function useWorldMovement(map, active, onStep) {
  const { state, dispatch } = useGame()
  const positionRef = useRef(state.playerPosition)
  const heldDirections = useRef([])
  const intervalRef = useRef(null)
  const onStepRef = useRef(onStep)

  useEffect(() => {
    positionRef.current = state.playerPosition
  }, [state.playerPosition])

  useEffect(() => {
    onStepRef.current = onStep
  }, [onStep])

  // Un paso en una dirección. Vive fuera del efecto para poder
  // exponerlo a los controles táctiles (la cruceta en pantalla), que
  // deben mover exactamente igual que el teclado.
  const step = useCallback(
    (direction) => {
      if (!direction) return

      const result = resolveStep(positionRef.current, direction, map)
      positionRef.current = result.position
      dispatch({
        type: GAME_ACTIONS.MOVE_PLAYER,
        x: result.position.x,
        y: result.position.y,
        direction,
      })

      if (!result.blocked) {
        const tileType = map.tiles[result.position.y][result.position.x]
        onStepRef.current?.(tileType, result.position)
      }
    },
    [map, dispatch],
  )

  useEffect(() => {
    if (!active) return undefined

    function stepHeld() {
      step(heldDirections.current[0])
    }

    function handleKeyDown(event) {
      const direction = KEY_DIRECTIONS[event.code]
      if (!direction) return
      // Solo se secuestran las flechas/WASD, y solo cuando el foco no
      // está en un control de texto (buscador de la Pokédex, etc.).
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      event.preventDefault()

      if (!heldDirections.current.includes(direction)) {
        heldDirections.current = [direction, ...heldDirections.current]
      }
      if (!intervalRef.current) {
        stepHeld()
        intervalRef.current = setInterval(stepHeld, STEP_INTERVAL_MS)
      }
    }

    function handleKeyUp(event) {
      const direction = KEY_DIRECTIONS[event.code]
      if (!direction) return

      heldDirections.current = heldDirections.current.filter((held) => held !== direction)
      if (heldDirections.current.length === 0 && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      // Al desactivarse (entrar a batalla/abrir un overlay) las teclas
      // retenidas se olvidan: al volver al mundo no queda un paso
      // "pegado" de una tecla que ya se soltó fuera del listener.
      heldDirections.current = []
    }
  }, [active, step])

  return step
}
