import { useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext.jsx'
import { GAME_ACTIONS } from '../context/gameReducer.js'
import { resolveStep } from '../game/movement.js'

const STEP_INTERVAL_MS = 160

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
export function useWorldMovement(map, active) {
  const { state, dispatch } = useGame()
  const positionRef = useRef(state.playerPosition)
  const heldDirections = useRef([])
  const intervalRef = useRef(null)

  useEffect(() => {
    positionRef.current = state.playerPosition
  }, [state.playerPosition])

  useEffect(() => {
    if (!active) return undefined

    function step() {
      const direction = heldDirections.current[0]
      if (!direction) return

      const result = resolveStep(positionRef.current, direction, map)
      positionRef.current = result.position
      dispatch({
        type: GAME_ACTIONS.MOVE_PLAYER,
        x: result.position.x,
        y: result.position.y,
        direction,
      })
    }

    function handleKeyDown(event) {
      const direction = KEY_DIRECTIONS[event.code]
      if (!direction) return
      event.preventDefault()

      if (!heldDirections.current.includes(direction)) {
        heldDirections.current = [direction, ...heldDirections.current]
      }
      if (!intervalRef.current) {
        step()
        intervalRef.current = setInterval(step, STEP_INTERVAL_MS)
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
    }
  }, [active, map, dispatch])
}
