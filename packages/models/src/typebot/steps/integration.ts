import { Item, ItemBase, ItemType, StepBase } from '.'

export type IntegrationStep = WebhookStep

export type IntegrationStepOptions =
  | WebhookOptions

export enum IntegrationStepType {
  WEBHOOK = 'Webhook'
}

export type WebhookStep = StepBase & {
  type: IntegrationStepType.WEBHOOK;
  options: WebhookOptions;
  items: Array<WebhookItem>;
}

export type WebhookItem = ItemBase & {
  type: ItemType.WEBHOOK,
  content: WebhookContent
};

export type WebhookContent = {
  source: "CURRENT_SESSION",
  matchType: "$eq",
  values: Array<String>,
  referenceProperty: null,
  referenceValue: null,
  subType: null
}

export enum GoogleSheetsAction {
  GET = 'Get data from sheet',
  INSERT_ROW = 'Insert a row',
  UPDATE_ROW = 'Update a row',
}

export type ResponseVariableMapping = {
  id: string
  bodyPath?: string
  variableId?: string
}

export type WebhookOptions = {
  variablesForTest: VariableForTest[]
  responseVariableMapping: ResponseVariableMapping[]
  isAdvancedConfig?: boolean
  isCustomBody?: boolean
}

export type VariableForTest = {
  id: string
  variableId?: string
  value?: string
}

export const defaultWebhookOptions: Omit<WebhookOptions, 'webhookId'> = {
  responseVariableMapping: [],
  variablesForTest: [],
  isAdvancedConfig: false,
  isCustomBody: false,
}