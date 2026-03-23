let webComponentsLoadPromise: Promise<unknown> | undefined;

export const ensureWebComponentsLoaded = () => {
  if ((import.meta.env?.SSR ?? typeof window === "undefined") === true) return;

  webComponentsLoadPromise ??= import("./web");
  return webComponentsLoadPromise;
};
