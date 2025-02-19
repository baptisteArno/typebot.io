export type WithoutVariables<T> = {
  [K in keyof T]: T[K] extends number | `{{${string}}}` | undefined
    ? Exclude<T[K], `{{${string}}}`>
    : T[K] extends object
      ? WithoutVariables<T[K]>
      : T[K];
};
