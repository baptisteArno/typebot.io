import { Vector2 } from '@use-gesture/react'

type Props = {
  initial: Vector2
  movement: Vector2
}
export const computeSelectBoxDimensions = ({ initial, movement }: Props) => {
  if (movement[0] < 0 && movement[1] < 0)
    return {
      origin: {
        x: initial[0] + movement[0],
        y: initial[1] + movement[1],
      },
      dimension: {
        width: Math.abs(movement[0]),
        height: Math.abs(movement[1]),
      },
    }
  else if (movement[0] < 0)
    return {
      origin: {
        x: initial[0] + movement[0],
        y: initial[1],
      },
      dimension: {
        width: Math.abs(movement[0]),
        height: movement[1],
      },
    }
  else if (movement[1] < 0)
    return {
      origin: {
        x: initial[0],
        y: initial[1] + movement[1],
      },
      dimension: {
        width: movement[0],
        height: Math.abs(movement[1]),
      },
    }
  else
    return {
      origin: {
        x: initial[0],
        y: initial[1],
      },
      dimension: {
        width: movement[0],
        height: movement[1],
      },
    }
}
