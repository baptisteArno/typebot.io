import { timeFilterValues } from '../constants'

export const parseDateFromTimeFilter = (
  timeFilter: (typeof timeFilterValues)[number]
): Date | undefined => {
  switch (timeFilter) {
    case 'today':
      return new Date(new Date().setHours(0, 0, 0, 0))
    case 'last7Days':
      return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    case 'last30Days':
      return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    case 'yearToDate':
      return new Date(new Date().getFullYear(), 0, 1)
    case 'allTime':
      return
  }
}
