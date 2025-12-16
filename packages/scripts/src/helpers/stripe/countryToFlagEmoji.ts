export function countryToFlagEmoji(countryCode?: string | null) {
  if (!countryCode) return;
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
}
