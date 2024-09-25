export const isSingleVariable = (value: string | undefined): boolean =>
  !!value &&
  value.startsWith("{{") &&
  value.endsWith("}}") &&
  value.split("{{").length === 2;
