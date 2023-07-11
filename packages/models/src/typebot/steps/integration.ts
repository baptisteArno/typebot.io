import { Item, ItemBase, ItemType, StepBase } from '.'
import { Variable } from '../variable';

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

export type QueryParameters = {
    id?: string,
    key: string,
    value: string,
    displayValue: string,
    type: string,
    isNew: boolean,
    properties?: Variable
}

export type WebhookOptions = {
  variablesForTest: VariableForTest[]
  responseVariableMapping: ResponseVariableMapping[]
  isAdvancedConfig?: boolean
  isCustomBody?: boolean
  method: "POST"|"GET"|"PUT";
  headers: QueryParameters[];
  parameters: QueryParameters[];
  path: QueryParameters[];
  returnMap: any;
  typebotId: string;
  url: string;
  body: string;
}

export type VariableForTest = {
  id: string
  variableId?: string
  value?: string
  token?: string
}

export const defaultWebhookOptions: Omit<WebhookOptions, 'webhookId'> = {
  url: "",
  body: "",
  headers: [],
  method: "GET",
  parameters: [],
  path: [],
  returnMap: "",
  typebotId: "",
  responseVariableMapping: [],
  variablesForTest: [],
  isAdvancedConfig: false,
  isCustomBody: false,
}
