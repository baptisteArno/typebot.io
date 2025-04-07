export const shortenLogDetails = (details?: string): string | undefined => {
  if (!details) return;
  if (details.length < 1000) return details;
  return details.substring(0, 1000) + "...";
};
