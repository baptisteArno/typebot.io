export const evaluateIsHidden = (
  isHidden: boolean | ((obj: any) => boolean) | undefined,
  obj: any
): boolean => {
  if (typeof isHidden === 'function') {
    return isHidden(obj)
  }
  return isHidden ?? false
}
