export const hexToRgb = (hex: string): [r: number, g: number, b: number] => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, (_m, r, g, b) => {
    return r + r + g + g + b + b
  })

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0]
}

export const isLight = (hexColor: string) =>
  (([r, g, b]) => (r * 299 + g * 587 + b * 114) / 1000 > 155)(
    hexToRgb(hexColor)
  )
