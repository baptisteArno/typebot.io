import { z } from 'zod'

export const errorTypeEnum = z.enum([
  'invalidGroups',
  'invalidTextBeforeClaudia',
  'brokenLinks',
  'outgoingEdgeIds',
])

export type ErrorTypeName = z.infer<typeof errorTypeEnum>

export class InvalidGroupsError {
  name: string = 'invalidGroups'
  message: string
  constructor(message: string) {
    this.message = message
  }
}

export class OutgoingEdgeIdsError {
  name: string = 'outgoingEdgeIds'
  message: string
  constructor(message: string) {
    this.message = message
  }
}

export class InvalidTextBeforeClaudiaError {
  name: string = 'invalidTextBeforeClaudia'
  message: string
  constructor(message: string) {
    this.message = message
  }
}

export class BrokenLinksError {
  name: string = 'brokenLinks'
  message: string
  groupName: string
  typebotName: string
  constructor(message: string, groupName: string, typebotName: string) {
    this.message = message
    this.groupName = groupName
    this.typebotName = typebotName
  }
}

export type ValidationErrorItem =
  | InvalidGroupsError
  | BrokenLinksError
  | InvalidTextBeforeClaudiaError
  | OutgoingEdgeIdsError

export type ValidationError = {
  isValid: boolean
  errors: ValidationErrorItem[]
}
