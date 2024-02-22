export const timeFilterValues = [
  'today',
  'last7Days',
  'last30Days',
  'yearToDate',
  'allTime',
] as const

export const timeFilterLabels: Record<
  (typeof timeFilterValues)[number],
  string
> = {
  today: 'Today',
  last7Days: 'Last 7 days',
  last30Days: 'Last 30 days',
  yearToDate: 'Year to date',
  allTime: 'All time',
}

export const defaultTimeFilter = 'today' as const
