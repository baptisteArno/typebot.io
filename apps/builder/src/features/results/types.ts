export type HeaderCell = {
  Header: JSX.Element
  accessor: string
}

export type CellValueType = { element?: JSX.Element; plainText: string }

export type TableData = {
  id: Pick<CellValueType, 'plainText'>
} & Record<string, CellValueType>
