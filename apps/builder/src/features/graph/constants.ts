import { Coordinates } from './types'

export const stubLength = 20
export const groupWidth = 300
export const groupAnchorsOffset = {
  left: {
    x: 0,
    y: stubLength,
  },
  top: {
    x: groupWidth / 2,
    y: 0,
  },
  right: {
    x: groupWidth,
    y: stubLength,
  },
}
export const eventWidth = 200

export const graphPositionDefaultValue = (
  firstGroupCoordinates: Coordinates
) => ({
  x: 400 - firstGroupCoordinates.x,
  y: 100 - firstGroupCoordinates.y,
  scale: 1,
})

export const pathRadius = 20
