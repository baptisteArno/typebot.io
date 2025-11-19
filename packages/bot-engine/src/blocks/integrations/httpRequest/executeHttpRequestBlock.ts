import {
  defaultHttpRequestAttributes,
  defaultTimeout,
  HttpMethod,
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
import type {
  SessionState,
  TypebotInSession,
} from "@typebot.io/chat-session/schemas";
import { decrypt } from "@typebot.io/credentials/decrypt";
import { getCredentials } from "@typebot.io/credentials/getCredentials";
import { httpProxyCredentialsSchema } from "@typebot.io/credentials/schemas";
import { env } from "@typebot.io/env";
import { JSONParse } from "@typebot.io/lib/JSONParse";
import {
  validateHttpReqHeaders,
  validateHttpReqUrl,
} from "@typebot.io/lib/ssrf/validateHttpReqUrl";
import { isDefined, isEmpty, isNotDefined, omit } from "@typebot.io/lib/utils";
import type { LogInSession } from "@typebot.io/logs/schemas";
import prisma from "@typebot.io/prisma";
import { parseAnswers } from "@typebot.io/results/parseAnswers";
import type { AnswerInSessionState } from "@typebot.io/results/schemas/answers";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";
import ky, { HTTPError, type Options, TimeoutError } from "ky";
import { stringify } from "qs";
import { ProxyAgent } from "undici";
import type { ExecuteIntegrationResponse } from "../../../types";
import { saveDataInResponseVariableMapping } from "./saveDataInResponseVariableMapping";

type ParsedHttpRequest = ExecutableHttpRequest & {
  basicAuth: { username?: string; password?: string };
  isJson: boolean;
  proxyUrl?: string;
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
  block: HttpRequestBlock | ZapierBlock | MakeComBlock | PabblyConnectBlock,
  {
    state,
    sessionStore,
    ...params
  }: {
    state: SessionState;
    sessionStore: SessionStore;
  } & Params,
): Promise<ExecuteIntegrationResponse> => {
  const logs: LogInSession[] = [];
  const httpRequest =
    block.options?.webhook ??
    ("webhookId" in block
      ? ((await prisma.webhook.findUnique({
          where: { id: block.webhookId },
        })) as HttpRequest | null)
      : null);
  if (!httpRequest) return { outgoingEdgeId: block.outgoingEdgeId };
  const parsedHttpRequest = await parseHttpRequestAttributes({
    httpRequest,
    isCustomBody: block.options?.isCustomBody,
    variables: state.typebotsQueue[0].typebot.variables,
    answers: state.typebotsQueue[0].answers,
    sessionStore,
    proxy: block.options?.proxyCredentialsId
      ? {
          credentialsId: block.options.proxyCredentialsId,
          workspaceId: state.workspaceId,
        }
      : undefined,
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
    response: httpRequestResponse,
    logs: httpRequestLogs,
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
      logs: httpRequestLogs,
      response: httpRequestResponse,
      sessionStore,
    }),
    startTimeShouldBeUpdated,
  };
};

const checkIfBodyIsAVariable = (body: string) => /^{{.+}}$/.test(body);

export const parseHttpRequestAttributes = async ({
  httpRequest,
  isCustomBody,
  variables,
  answers,
  sessionStore,
  proxy,
}: {
  httpRequest: HttpRequest;
  isCustomBody?: boolean;
  variables: TypebotInSession["variables"];
  answers: AnswerInSessionState[];
  sessionStore: SessionStore;
  proxy?: {
    credentialsId: string;
    workspaceId: string;
  };
}): Promise<ParsedHttpRequest | undefined> => {
  if (!httpRequest.url) return;
  const basicAuth: { username?: string; password?: string } = {};
  const basicAuthHeaderIdx = httpRequest.headers?.findIndex(
    (h) =>
      h.key?.toLowerCase() === "authorization" &&
      h.value?.toLowerCase()?.includes("basic"),
  );
  const isUsernamePasswordBasicAuth =
    basicAuthHeaderIdx !== -1 &&
    isDefined(basicAuthHeaderIdx) &&
    httpRequest.headers?.at(basicAuthHeaderIdx)?.value?.includes(":");
  if (isUsernamePasswordBasicAuth) {
    const [username, password] =
      httpRequest.headers?.at(basicAuthHeaderIdx)?.value?.slice(6).split(":") ??
      [];
    basicAuth.username = username;
    basicAuth.password = password;
    httpRequest.headers?.splice(basicAuthHeaderIdx, 1);
  }
  const headers = convertKeyValueTableToObject({
    keyValues: httpRequest.headers,
    variables,
    sessionStore,
  }) as ExecutableHttpRequest["headers"] | undefined;
  const queryParams = stringify(
    convertKeyValueTableToObject({
      keyValues: httpRequest.queryParams,
      variables,
      concatDuplicateInArray: true,
      sessionStore,
    }),
    { indices: false },
  );
  const bodyContent = await getBodyContent({
    body: httpRequest.body,
    answers,
    variables,
    isCustomBody,
  });
  const method = httpRequest.method ?? defaultHttpRequestAttributes.method;
  const { data: body, isJson } =
    bodyContent && method !== HttpMethod.GET
      ? safeJsonParse(
          parseVariables(bodyContent, {
            variables,
            sessionStore,
            isInsideJson: !checkIfBodyIsAVariable(bodyContent),
          }),
        )
      : { data: undefined, isJson: false };

  const proxyCredentials = proxy
    ? await getCredentials(proxy.credentialsId, proxy.workspaceId)
    : undefined;
  const proxyUrl = proxyCredentials
    ? httpProxyCredentialsSchema.shape.data.parse(
        await decrypt(proxyCredentials.data, proxyCredentials.iv),
      ).url
    : undefined;
  return {
    url: parseVariables(
      httpRequest.url + (queryParams !== "" ? `?${queryParams}` : ""),
      { variables, sessionStore },
    ),
    basicAuth,
    method,
    headers,
    body,
    isJson,
    proxyUrl,
  };
};

export const executeHttpRequest = async (
  httpRequest: ParsedHttpRequest,
  params: Params = {},
): Promise<{
  response: HttpResponse;
  logs?: LogInSession[];
  startTimeShouldBeUpdated?: boolean;
}> => {
  const logs: LogInSession[] = [];

  const { headers, url, method, basicAuth, isJson } = httpRequest;

  try {
    validateHttpReqUrl(url);
    validateHttpReqHeaders(headers);
  } catch (error) {
    logs.push({
      status: "error",
      description: `Security validation failed: ${
        error instanceof Error ? error.message : "Invalid configuration"
      }`,
    });
    return {
      response: {
        statusCode: 400,
        data: {
          message: `Security validation failed: ${
            error instanceof Error ? error.message : "Invalid configuration"
          }`,
        },
      },
      logs,
      startTimeShouldBeUpdated: true,
    };
  }

  const contentType = headers ? headers["Content-Type"] : undefined;

  const isLongRequest = params.disableRequestTimeout
    ? true
    : longReqTimeoutWhitelist.some((whiteListedUrl) =>
        url?.includes(whiteListedUrl),
      );

  const isFormData = contentType?.includes("x-www-form-urlencoded");

  let body = httpRequest.body;

  if (isFormData && isJson) body = parseFormDataBody(body as object);

  const baseRequest = {
    url,
    method,
    headers: headers ?? {},
    ...(basicAuth ?? {}),
    fetch: httpRequest.proxyUrl
      ? (url, options) =>
          fetch(url, {
            ...options,
            // @ts-expect-error: undici init type excluded to make it compatible with browser fetch
            dispatcher: new ProxyAgent(httpRequest.proxyUrl!),
          })
      : undefined,
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
    const body = await response.text();
    logs.push({
      status: "success",
      description: webhookSuccessDescription,
      details: JSON.stringify({
        statusCode: response.status,
        response: body,
        request,
      }),
    });
    return {
      response: {
        statusCode: response.status,
        data: safeJsonParse(body).data,
      },
      logs,
      startTimeShouldBeUpdated: true,
    };
  } catch (error) {
    if (error instanceof HTTPError) {
      const response = {
        statusCode: error.response.status,
        data: safeJsonParse(await error.response.text()).data,
      };
      logs.push({
        status: "error",
        description: webhookErrorDescription,
        details: JSON.stringify({
          statusCode: error.response.status,
          request,
          response,
        }),
      });
      return { response, logs, startTimeShouldBeUpdated: true };
    }
    if (error instanceof TimeoutError) {
      const response = {
        statusCode: 408,
        data: {
          message: `Request timed out. (${
            (request.timeout ? request.timeout : 0) / 1000
          }s)`,
        },
      };
      logs.push({
        status: "error",
        description: `Webhook request timed out. (${
          (request.timeout ? request.timeout : 0) / 1000
        }s)`,
        details: JSON.stringify({
          response,
          request,
        }),
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
      details: JSON.stringify({
        response,
        request,
      }),
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

export const convertKeyValueTableToObject = ({
  keyValues,
  variables,
  sessionStore,
  concatDuplicateInArray = false,
}: {
  keyValues: KeyValue[] | undefined;
  variables: Variable[];
  sessionStore: SessionStore;
  concatDuplicateInArray?: boolean;
}) => {
  if (!keyValues) return;
  return keyValues.reduce<Record<string, string | string[]>>((object, item) => {
    const key = parseVariables(item.key, { variables, sessionStore });
    const value = parseVariables(item.value, { variables, sessionStore });
    if (isEmpty(key) || isEmpty(value)) return object;
    if (object[key] && concatDuplicateInArray) {
      if (Array.isArray(object[key])) (object[key] as string[]).push(value);
      else object[key] = [object[key] as string, value];
    } else object[key] = value;
    return object;
  }, {});
};

const safeJsonParse = (json: unknown): { data: any; isJson: boolean } => {
  try {
    return { data: JSONParse(json as string), isJson: true };
  } catch (_err) {
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
