export const convertDateToReadable = (date: Date): string =>
  date.toDateString().split(' ').slice(1, 3).join(' ') +
  ', ' +
  date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
