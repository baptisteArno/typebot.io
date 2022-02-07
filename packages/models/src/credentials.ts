import { Credentials as CredentialsFromPrisma } from 'db'

export type Credentials = SmtpCredentials | GoogleSheetsCredentials

export type CredentialsBase = Omit<CredentialsFromPrisma, 'data' | 'type'>

export enum CredentialsType {
  GOOGLE_SHEETS = 'google sheets',
  SMTP = 'smtp',
}

export type SmtpCredentials = CredentialsBase & {
  type: CredentialsType.SMTP
  data: SmtpCredentialsData
}

export type GoogleSheetsCredentials = CredentialsBase & {
  type: CredentialsType.GOOGLE_SHEETS
  data: GoogleSheetsCredentialsData
}

export type GoogleSheetsCredentialsData = {
  refresh_token?: string | null
  expiry_date?: number | null
  access_token?: string | null
  token_type?: string | null
  id_token?: string | null
  scope?: string
}

export type SmtpCredentialsData = {
  host?: string
  username?: string
  password?: string
  isTlsEnabled?: boolean
  port: number
  from: { email?: string; name?: string }
}
