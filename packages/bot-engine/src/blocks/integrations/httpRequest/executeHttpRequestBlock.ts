import {
  HttpMethod,
  defaultHttpRequestAttributes,
  defaultTimeout,
  maxTimeout,
} from "@typebot.io/blocks-integrations/httpRequest/constants";
import type {
  ExecutableHttpRequest,
  HttpRequest,
  HttpRequestBlock,
  HttpResponse,
  KeyValue,
} from "@typebot.io/blocks-integrations/httpRequest/schema";
import type { MakeComBlock } from "@typebot.io/blocks-integrations/makeCom/schema";
import type { PabblyConnectBlock } from "@typebot.io/blocks-integrations/pabblyConnect/schema";
import type { ZapierBlock } from "@typebot.io/blocks-integrations/zapier/schema";
import { env } from "@typebot.io/env";
import { JSONParse } from "@typebot.io/lib/JSONParse";
import { isDefined, isEmpty, isNotDefined, omit } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { parseAnswers } from "@typebot.io/results/parseAnswers";
import type { AnswerInSessionState } from "@typebot.io/results/schemas/answers";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";
import ky, { HTTPError, TimeoutError, type Options } from "ky";
import { stringify } from "qs";
import type { ChatLog } from "../../../schemas/api";
import type {
  SessionState,
  TypebotInSession,
} from "../../../schemas/chatSession";
import type { ExecuteIntegrationResponse } from "../../../types";
import { saveDataInResponseVariableMapping } from "./saveDataInResponseVariableMapping";

type ParsedWebhook = ExecutableHttpRequest & {
  basicAuth: { username?: string; password?: string };
  isJson: boolean;
};

export const longReqTimeoutWhitelist = [
  "https://api.openai.com",
  "https://retune.so",
  "https://www.chatbase.co",
  "https://channel-connector.orimon.ai",
  "https://api.anthropic.com",
];

export const webhookSuccessDescription = `Webhook successfuly executed.`;
export const webhookErrorDescription = `Webhook returned an error.`;

type Params = { disableRequestTimeout?: boolean; timeout?: number };

export const executeHttpRequestBlock = async (
  state: SessionState,
  block: HttpRequestBlock | ZapierBlock | MakeComBlock | PabblyConnectBlock,
  params: Params = {},
): Promise<ExecuteIntegrationResponse> => {
  const logs: ChatLog[] = [];
  const webhook =
    block.options?.webhook ??
    ("webhookId" in block
      ? ((await prisma.webhook.findUnique({
          where: { id: block.webhookId },
        })) as HttpRequest | null)
      : null);
  if (!webhook) return { outgoingEdgeId: block.outgoingEdgeId };
  const parsedHttpRequest = await parseWebhookAttributes({
    webhook,
    isCustomBody: block.options?.isCustomBody,
    typebot: state.typebotsQueue[0].typebot,
    answers: state.typebotsQueue[0].answers,
  });
  if (!parsedHttpRequest) {
    logs.push({
      status: "error",
      description: `Couldn't parse webhook attributes`,
    });
    return { outgoingEdgeId: block.outgoingEdgeId, logs };
  }
  if (block.options?.isExecutedOnClient && !state.whatsApp)
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      clientSideActions: [
        {
          type: "httpRequestToExecute",
          httpRequestToExecute: parsedHttpRequest,
          expectsDedicatedReply: true,
        },
      ],
    };
  const {
    response: webhookResponse,
    logs: executeWebhookLogs,
    startTimeShouldBeUpdated,
  } = await executeHttpRequest(parsedHttpRequest, {
    ...params,
    timeout: block.options?.timeout,
  });

  return {
    ...saveDataInResponseVariableMapping({
      state,
      blockType: block.type,
      blockId: block.id,
      responseVariableMapping: block.options?.responseVariableMapping,
      outgoingEdgeId: block.outgoingEdgeId,
      logs: executeWebhookLogs,
      response: webhookResponse,
    }),
    startTimeShouldBeUpdated,
  };
};

const checkIfBodyIsAVariable = (body: string) => /^{{.+}}$/.test(body);

export const parseWebhookAttributes = async ({
  webhook,
  isCustomBody,
  typebot,
  answers,
}: {
  webhook: HttpRequest;
  isCustomBody?: boolean;
  typebot: TypebotInSession;
  answers: AnswerInSessionState[];
}): Promise<ParsedWebhook | undefined> => {
  if (!webhook.url) return;
  const basicAuth: { username?: string; password?: string } = {};
  const basicAuthHeaderIdx = webhook.headers?.findIndex(
    (h) =>
      h.key?.toLowerCase() === "authorization" &&
      h.value?.toLowerCase()?.includes("basic"),
  );
  const isUsernamePasswordBasicAuth =
    basicAuthHeaderIdx !== -1 &&
    isDefined(basicAuthHeaderIdx) &&
    webhook.headers?.at(basicAuthHeaderIdx)?.value?.includes(":");
  if (isUsernamePasswordBasicAuth) {
    const [username, password] =
      webhook.headers?.at(basicAuthHeaderIdx)?.value?.slice(6).split(":") ?? [];
    basicAuth.username = username;
    basicAuth.password = password;
    webhook.headers?.splice(basicAuthHeaderIdx, 1);
  }
  const headers = convertKeyValueTableToObject(
    webhook.headers,
    typebot.variables,
  ) as ExecutableHttpRequest["headers"] | undefined;
  const queryParams = stringify(
    convertKeyValueTableToObject(webhook.queryParams, typebot.variables, true),
    { indices: false },
  );
  const bodyContent = await getBodyContent({
    body: webhook.body,
    answers,
    variables: typebot.variables,
    isCustomBody,
  });
  const method = webhook.method ?? defaultHttpRequestAttributes.method;
  const { data: body, isJson } =
    bodyContent && method !== HttpMethod.GET
      ? safeJsonParse(
          parseVariables(typebot.variables, {
            isInsideJson: !checkIfBodyIsAVariable(bodyContent),
          })(bodyContent),
        )
      : { data: undefined, isJson: false };

  return {
    url: parseVariables(typebot.variables)(
      webhook.url + (queryParams !== "" ? `?${queryParams}` : ""),
    ),
    basicAuth,
    method,
    headers,
    body,
    isJson,
  };
};

export const executeHttpRequest = async (
  webhook: ParsedWebhook,
  params: Params = {},
): Promise<{
  response: HttpResponse;
  logs?: ChatLog[];
  startTimeShouldBeUpdated?: boolean;
}> => {
  const logs: ChatLog[] = [];

  const { headers, url, method, basicAuth, isJson } = webhook;
  const contentType = headers ? headers["Content-Type"] : undefined;

  const isLongRequest = params.disableRequestTimeout
    ? true
    : longReqTimeoutWhitelist.some((whiteListedUrl) =>
        url?.includes(whiteListedUrl),
      );

  const isFormData = contentType?.includes("x-www-form-urlencoded");

  let body = webhook.body;

  if (isFormData && isJson) body = parseFormDataBody(body as object);

  const baseRequest = {
    url,
    method,
    headers: headers ?? {},
    ...(basicAuth ?? {}),
    timeout: isNotDefined(env.CHAT_API_TIMEOUT)
      ? false
      : params.timeout && params.timeout !== defaultTimeout
        ? Math.min(params.timeout, maxTimeout) * 1000
        : isLongRequest
          ? maxTimeout * 1000
          : defaultTimeout * 1000,
  } satisfies Options & { url: string };

  const request = body
    ? !isFormData && isJson
      ? { ...baseRequest, json: body }
      : { ...baseRequest, body }
    : baseRequest;

  try {
    const response = await ky(request.url, omit(request, "url"));
    const body = response.headers.get("content-type")?.includes("json")
      ? await response.json()
      : await response.text();
    logs.push({
      status: "success",
      description: webhookSuccessDescription,
      details: {
        statusCode: response.status,
        response: typeof body === "string" ? safeJsonParse(body).data : body,
        request,
      },
    });
    return {
      response: {
        statusCode: response.status,
        data: typeof body === "string" ? safeJsonParse(body).data : body,
      },
      logs,
      startTimeShouldBeUpdated: true,
    };
  } catch (error) {
    if (error instanceof HTTPError) {
      const responseBody = error.response.headers
        .get("content-type")
        ?.includes("json")
        ? await error.response.json()
        : await error.response.text();
      const response = {
        statusCode: error.response.status,
        data:
          typeof responseBody === "string"
            ? safeJsonParse(responseBody).data
            : responseBody,
      };
      logs.push({
        status: "error",
        description: webhookErrorDescription,
        details: {
          statusCode: error.response.status,
          request,
          response,
        },
      });
      return { response, logs, startTimeShouldBeUpdated: true };
    }
    if (error instanceof TimeoutError) {
      const response = {
        statusCode: 408,
        data: {
          message: `Request timed out. (${
            (request.timeout ? request.timeout : 0) / 1000
          }ms)`,
        },
      };
      logs.push({
        status: "error",
        description: `Webhook request timed out. (${
          (request.timeout ? request.timeout : 0) / 1000
        }s)`,
        details: {
          response,
          request,
        },
      });
      return { response, logs, startTimeShouldBeUpdated: true };
    }
    const response = {
      statusCode: 500,
      data: { message: `Error from Typebot server: ${error}` },
    };
    console.error(error);
    logs.push({
      status: "error",
      description: `Webhook failed to execute.`,
      details: {
        response,
        request,
      },
    });
    return { response, logs, startTimeShouldBeUpdated: true };
  }
};

const getBodyContent = async ({
  body,
  answers,
  variables,
  isCustomBody,
}: {
  body?: string | null;
  answers: AnswerInSessionState[];
  variables: Variable[];
  isCustomBody?: boolean;
}): Promise<string | undefined> => {
  return body === "{{state}}" || isEmpty(body) || isCustomBody !== true
    ? JSON.stringify(
        parseAnswers({
          answers,
          variables,
        }),
      )
    : (body ?? undefined);
};

export const convertKeyValueTableToObject = (
  keyValues: KeyValue[] | undefined,
  variables: Variable[],
  concatDuplicateInArray = false,
) => {
  if (!keyValues) return;
  return keyValues.reduce<Record<string, string | string[]>>((object, item) => {
    const key = parseVariables(variables)(item.key);
    const value = parseVariables(variables)(item.value);
    if (isEmpty(key) || isEmpty(value)) return object;
    if (object[key] && concatDuplicateInArray) {
      if (Array.isArray(object[key])) (object[key] as string[]).push(value);
      else object[key] = [object[key] as string, value];
    } else object[key] = value;
    return object;
  }, {});
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeJsonParse = (json: unknown): { data: any; isJson: boolean } => {
  try {
    return { data: JSONParse(json as string), isJson: true };
  } catch (err) {
    return { data: json, isJson: false };
  }
};

const parseFormDataBody = (body: object) => {
  const searchParams = new URLSearchParams();
  Object.entries(body as object).forEach(([key, value]) => {
    searchParams.set(key, value);
  });
  return searchParams;
};
