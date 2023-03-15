export const setMultipleRefs =
  (refs: React.MutableRefObject<HTMLDivElement | null>[]) =>
  (elem: HTMLDivElement) =>
    refs.forEach((ref) => (ref.current = elem))
