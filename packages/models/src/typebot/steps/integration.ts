import { ItemBase, ItemType, StepBase } from '.';
import { Variable } from '../variable';

export type IntegrationStep = WebhookStep

export type IntegrationStepOptions =
  | WebhookOptions

export enum IntegrationStepType {
  WEBHOOK = 'Webhook',
  ExternalEvent = "ExternalEvent"
}

export enum HttpMethodsWebhook {
  POST = 'POST',
  GET = 'GET',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
}

export type WebhookStep = StepBase & {
  type: IntegrationStepType.WEBHOOK;
  options: WebhookOptions;
  items: Array<WebhookItem>;
}

export declare type ExternalEventStep = StepBase & {
  type: IntegrationStepType.ExternalEvent;
  options: ExternalEventOptions;
  items: Array<ExternalEventItem>;
};

export type WebhookItem = ItemBase & {
  type: ItemType.WEBHOOK,
  content: WebhookContent
};

export type ExternalEventItem = ItemBase & {
  type: ItemType.ExternalEvent,
  content: ExternalEventContent
};

export type WebhookContent = {
  source: "CURRENT_SESSION",
  matchType: "$eq",
  values: Array<String>,
  referenceProperty: null,
  referenceValue: null,
  subType: null
}

export type ExternalEventContent = {
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
  method: HttpMethodsWebhook;
  headers: QueryParameters[];
  parameters: QueryParameters[];
  path: string;
  returnMap: any;
  typebotId: string;
  url: string;
  body: string;
}

export type ExternalEventOptions = {
  variablesForTest: VariableForTest[]
  responseVariableMapping: ResponseVariableMapping[]
  isAdvancedConfig?: boolean
  isCustomBody?: boolean
  method: HttpMethodsWebhook;
  headers: QueryParameters[];
  parameters: QueryParameters[];
  path: string;
  returnMap: any;
  typebotId: string;
  url: string;
  body: string;
}

export type VariableForTest = {
  id: string
  variableId?: string
  value?: string
  token: string
}

export const defaultWebhookOptions: Omit<WebhookOptions, 'webhookId'> = {
  url: "",
  body: "",
  headers: [],
  method: HttpMethodsWebhook.GET,
  parameters: [],
  path: '',
  returnMap: "",
  typebotId: "",
  responseVariableMapping: [],
  variablesForTest: [],
  isAdvancedConfig: false,
  isCustomBody: false,
}
