import { useCallback, useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext.jsx'
import { GAME_ACTIONS } from '../context/gameReducer.js'
import { resolveStep } from '../game/movement.js'
import { useRawInputAction } from '../input/InputProvider.jsx'
import { INPUT_ACTIONS } from '../input/inputActions.js'

const STEP_INTERVAL_MS = 150

// Movimiento por pasos discretos (no por frame): mientras haya una
// dirección presionada, despacha un MOVE_PLAYER cada STEP_INTERVAL_MS. La
// posición se lee de un ref (no del estado reactivo) para que el intervalo
// no se reinstale en cada paso — si dependiera de state.playerPosition,
// React desmontaría y recrearía el efecto en cada movimiento y el
// setInterval nunca llegaría a disparar dos veces mientras la dirección
// sigue apretada.
//
// Las direcciones llegan por useRawInputAction (InputProvider): el mismo
// canal que usa el D-pad en pantalla, así que teclado y D-pad mueven
// exactamente igual sin dos implementaciones separadas.
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
  const activeRef = useRef(active)

  useEffect(() => {
    positionRef.current = state.playerPosition
  }, [state.playerPosition])

  useEffect(() => {
    onStepRef.current = onStep
  }, [onStep])

  useEffect(() => {
    activeRef.current = active
    if (!active) {
      // Al desactivarse (entrar a batalla, pausar) las direcciones
      // retenidas se olvidan: al reactivarse no queda un paso "pegado" de
      // una tecla/botón que ya se soltó mientras estaba inactivo.
      heldDirections.current = []
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [active])

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

  const stepHeld = useCallback(() => {
    step(heldDirections.current[0])
  }, [step])

  function holdDirection(direction) {
    if (!activeRef.current) return
    if (!heldDirections.current.includes(direction)) {
      heldDirections.current = [direction, ...heldDirections.current]
    }
    if (!intervalRef.current) {
      stepHeld()
      intervalRef.current = setInterval(stepHeld, STEP_INTERVAL_MS)
    }
  }

  function releaseDirection(direction) {
    heldDirections.current = heldDirections.current.filter((held) => held !== direction)
    if (heldDirections.current.length === 0 && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useRawInputAction(INPUT_ACTIONS.MOVE_UP, {
    onPress: () => holdDirection('up'),
    onRelease: () => releaseDirection('up'),
  })
  useRawInputAction(INPUT_ACTIONS.MOVE_DOWN, {
    onPress: () => holdDirection('down'),
    onRelease: () => releaseDirection('down'),
  })
  useRawInputAction(INPUT_ACTIONS.MOVE_LEFT, {
    onPress: () => holdDirection('left'),
    onRelease: () => releaseDirection('left'),
  })
  useRawInputAction(INPUT_ACTIONS.MOVE_RIGHT, {
    onPress: () => holdDirection('right'),
    onRelease: () => releaseDirection('right'),
  })
}
