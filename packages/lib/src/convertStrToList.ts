export const convertStrToList = (str: string): string[] => {
  const splittedBreakLines = str.split("\n");
  const splittedCommas = str.split(",");
  const isPastingMultipleItems =
    str.length > 1 &&
    (splittedBreakLines.length >= 2 || splittedCommas.length >= 2);
  if (isPastingMultipleItems) {
    const values =
      splittedBreakLines.length >= 2 ? splittedBreakLines : splittedCommas;
    return values.map((v) => v.trim());
  }
  return [str.trim()];
};
