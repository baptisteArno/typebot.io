export const parseReadableDate = ({
  from,
  to,
  hasTime,
  isRange,
}: {
  from: string;
  to: string;
  hasTime?: boolean;
  isRange?: boolean;
}) => {
  const currentLocale = window.navigator.language;
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: hasTime ? "2-digit" : undefined,
    minute: hasTime ? "2-digit" : undefined,
  };
  const fromReadable = new Date(
    hasTime ? from : from.replace(/-/g, "/"),
  ).toLocaleString(currentLocale, formatOptions);
  const toReadable = new Date(
    hasTime ? to : to.replace(/-/g, "/"),
  ).toLocaleString(currentLocale, formatOptions);
  return `${fromReadable}${isRange ? ` to ${toReadable}` : ""}`;
};
