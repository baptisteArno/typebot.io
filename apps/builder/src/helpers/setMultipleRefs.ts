export function setMultipleRefs<T>(refs: (React.Ref<T> | undefined)[]) {
  return (elem: T) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(elem);
      } else {
        (ref as React.MutableRefObject<T | null>).current = elem;
      }
    });
  };
}
