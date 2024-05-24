export type ListTableRecordsResponse = {
  list: Array<Record<string, any>>
  pageInfo: {
    totalRows: number
    page: number
    pageSize: number
    isFirstPage: boolean
    isLastPage: boolean
  }
}
