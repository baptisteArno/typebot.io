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
  method: "POST"|"GET"|"PUT";
  headers: Array<{[key: string]: any}>;
  queryParams: Array<{[key: string]: any}>;
  returnMap: any;
  typebotId: string;
  url: string;
  body: string;
}

export type VariableForTest = {
  id: string
  variableId?: string
  value?: string
}

export const defaultWebhookOptions: Omit<WebhookOptions, 'webhookId'> = {
  url: "http://octadesk.com",
  body: "",
  headers: [],
  method: "GET",
  queryParams: [],
  returnMap: "",
  typebotId: "0123",
  responseVariableMapping: [],
  variablesForTest: [],
  isAdvancedConfig: false,
  isCustomBody: false,
}