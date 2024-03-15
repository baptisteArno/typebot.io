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

export type CreateTableRecordResponse = Array<{ Id: string }>

export type UpdateTableRecordResponse = Array<{ Id: string }>

export type DeleteTableRecordsResponse = Array<{ Id: string }>

export type ReadTableRecordResponse = Array<Record<string, any>>

export type CountTableRecordsResponse = { count: number }

export type ListLinkedRecordsResponse = {
  list: Array<Record<string, any>>
  pageInfo: {
    totalRows: number
    page: number
    pageSize: number
    isFirstPage: boolean
    isLastPage: boolean
  }
}

export type LinkRecordsResponse = boolean

export type UnlinkRecordsResponse = boolean
