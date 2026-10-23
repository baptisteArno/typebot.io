import { afterEach, describe, expect, it } from "bun:test";
import type { LogsStore, VariableStore } from "@typebot.io/forge/types";
import { fetchAssistantsHandler } from "./fetchAssistantsHandler";
import { fetchPhoneNumbersHandler } from "./fetchPhoneNumbersHandler";
import { getCallHandler } from "./getCallHandler";
import { startCallHandler } from "./startCallHandler";

const originalFetch = globalThis.fetch;
const apiKey = "fam_test_key";
const assistantId = "11111111-1111-4111-8111-111111111111";
const phoneNumberId = "22222222-2222-4222-8222-222222222222";
const callId = "33333333-3333-4333-8333-333333333333";

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("startCallHandler", () => {
  it("posts the call with a bearer token and saves the returned call id", async () => {
    const requests = mockFamulor({
      "POST /calls": () =>
        Response.json({
          data: { id: callId, status: "queued" },
        }),
    });
    const variables: { id: string; value: unknown }[] = [];
    const logs: unknown[] = [];

    await startCallHandler.server?.({
      credentials: { apiKey },
      options: options({
        assistantId,
        toNumber: "+49 30 123456",
        responseMapping: [
          { item: "Call ID", variableId: "call-id" },
          { item: "Status", variableId: "call-status" },
        ],
      }),
      variables: createVariablesStore(variables),
      logs: createLogsStore(logs),
      sessionStore: Object.create(null),
    });

    expect(requests).toEqual([
      {
        method: "POST",
        url: "https://app.famulor.io/api/v1/calls",
        authorization: `Bearer ${apiKey}`,
        body: {
          assistant_id: assistantId,
          to_number: "+4930123456",
        },
      },
    ]);
    expect(variables).toEqual([
      { id: "call-id", value: callId },
      { id: "call-status", value: "queued" },
    ]);
    expect(logs).toEqual([
      {
        status: "success",
        description: `Famulor call queued (${callId}).`,
      },
    ]);
  });

  it("sends the optional caller id and lead on a white-label origin", async () => {
    const requests = mockFamulor({
      "POST /calls": () =>
        Response.json({ data: { id: callId, status: "queued" } }),
    });

    await startCallHandler.server?.({
      credentials: { apiKey, baseUrl: "https://example.com" },
      options: options({
        assistantId,
        toNumber: "+4930123456",
        phoneNumberId,
        leadName: "Ada",
        leadEmail: " ada@example.com ",
        leadPhone: "",
        leadCompany: "Analytical Engines",
      }),
      variables: createVariablesStore([]),
      logs: createLogsStore([]),
      sessionStore: Object.create(null),
    });

    expect(requests).toEqual([
      {
        method: "POST",
        url: "https://example.com/api/v1/calls",
        authorization: `Bearer ${apiKey}`,
        body: {
          assistant_id: assistantId,
          to_number: "+4930123456",
          phone_number_id: phoneNumberId,
          lead: {
            name: "Ada",
            email: "ada@example.com",
            company: "Analytical Engines",
          },
        },
      },
    ]);
  });

  it("does not call Famulor when the destination or host is invalid", async () => {
    const requests = mockFamulor({});
    const logs: unknown[] = [];

    await startCallHandler.server?.({
      credentials: { apiKey, baseUrl: "https://app.famulor.de" },
      options: options({ assistantId, toNumber: "+4930123456" }),
      variables: createVariablesStore([]),
      logs: createLogsStore(logs),
      sessionStore: Object.create(null),
    });
    await startCallHandler.server?.({
      credentials: { apiKey, baseUrl: "https://127.0.0.1" },
      options: options({ assistantId, toNumber: "030123456" }),
      variables: createVariablesStore([]),
      logs: createLogsStore(logs),
      sessionStore: Object.create(null),
    });

    expect(requests).toEqual([]);
    expect(logs).toEqual([
      "The legacy Famulor host is not supported. Use https://app.famulor.io or a white-label host.",
      "Enter a destination phone number in E.164 format, for example +4930123456.",
    ]);
  });

  it("blocks a private white-label host before sending the call", async () => {
    const requests = mockFamulor({});
    const logs: unknown[] = [];

    await startCallHandler.server?.({
      credentials: { apiKey, baseUrl: "https://127.0.0.1" },
      options: options({ assistantId, toNumber: "+4930123456" }),
      variables: createVariablesStore([]),
      logs: createLogsStore(logs),
      sessionStore: Object.create(null),
    });

    expect(requests).toEqual([]);
    expect(JSON.stringify(logs)).toContain("loopback");
  });

  it("surfaces the Famulor error message", async () => {
    mockFamulor({
      "POST /calls": () =>
        Response.json(
          {
            error: {
              code: "invalid_request",
              message: "A destination phone number is required.",
            },
          },
          { status: 422 },
        ),
    });
    const logs: unknown[] = [];

    await startCallHandler.server?.({
      credentials: { apiKey },
      options: options({ assistantId, toNumber: "+4930123456" }),
      variables: createVariablesStore([]),
      logs: createLogsStore(logs),
      sessionStore: Object.create(null),
    });

    expect(logs[0]).toMatchObject({
      context: "While starting a Famulor call",
      description: "A destination phone number is required. (invalid_request)",
    });
  });
});

describe("getCallHandler", () => {
  it("reads status and the structured transcript with the bearer token", async () => {
    const requests = mockFamulor({
      [`GET /calls/${callId}`]: () =>
        Response.json({
          data: {
            id: callId,
            status: "completed",
            structured_transcript: "ai: Hello\nhuman: Hi",
            summary: "Booked a demo",
            duration_sec: 42,
            recording_url: "https://example.com/recording",
            transcript: { items: [{ role: "user", content: "ignored" }] },
          },
        }),
    });
    const variables: { id: string; value: unknown }[] = [];

    await getCallHandler.server?.({
      credentials: { apiKey },
      options: options({
        callId,
        responseMapping: [
          { item: "Status", variableId: "status" },
          { item: "Transcript", variableId: "transcript" },
          { item: "Summary", variableId: "summary" },
          { item: "Duration (seconds)", variableId: "duration" },
          { item: "Recording URL", variableId: "recording" },
        ],
      }),
      variables: createVariablesStore(variables),
      logs: createLogsStore([]),
      sessionStore: Object.create(null),
    });

    expect(requests).toEqual([
      {
        method: "GET",
        url: `https://app.famulor.io/api/v1/calls/${callId}`,
        authorization: `Bearer ${apiKey}`,
        body: undefined,
      },
    ]);
    expect(variables).toEqual([
      { id: "status", value: "completed" },
      { id: "transcript", value: "ai: Hello\nhuman: Hi" },
      { id: "summary", value: "Booked a demo" },
      { id: "duration", value: 42 },
      { id: "recording", value: "https://example.com/recording" },
    ]);
  });

  it("flattens transcript items when no structured transcript is present", async () => {
    mockFamulor({
      [`GET /calls/${callId}`]: () =>
        Response.json({
          data: {
            id: callId,
            status: "completed",
            transcript: {
              items: [
                {
                  type: "message",
                  role: "assistant",
                  content: [{ text: "Hello" }],
                },
                { type: "message", role: "user", content: "Hi there" },
                { type: "function_call", name: "lookup", arguments: "{}" },
              ],
            },
          },
        }),
    });
    const variables: { id: string; value: unknown }[] = [];

    await getCallHandler.server?.({
      credentials: { apiKey },
      options: options({
        callId,
        responseMapping: [{ item: "Transcript", variableId: "transcript" }],
      }),
      variables: createVariablesStore(variables),
      logs: createLogsStore([]),
      sessionStore: Object.create(null),
    });

    expect(variables).toEqual([
      { id: "transcript", value: "ai: Hello\nhuman: Hi there" },
    ]);
  });
});

describe("Famulor fetchers", () => {
  it("loads assistants with the bearer token and marks inactive ones", async () => {
    const requests = mockFamulor({
      "GET /assistants": ({ url }) => {
        const offset = new URL(url).searchParams.get("offset");
        if (offset === "0") {
          return Response.json({
            data: Array.from({ length: 200 }, (_, index) => ({
              id: assistantUuid(index),
              name: `Agent ${index}`,
              is_active: true,
            })),
            meta: { pagination: { limit: 200, offset: 0, total: 201 } },
          });
        }
        return Response.json({
          data: [
            {
              id: assistantId,
              name: "After hours",
              is_active: false,
            },
          ],
          meta: { pagination: { limit: 200, offset: 200, total: 201 } },
        });
      },
    });

    const result = await fetchAssistantsHandler.fetch({
      credentials: { apiKey },
      options: options({}),
    });

    expect(requests.map((request) => request.url)).toEqual([
      "https://app.famulor.io/api/v1/assistants?limit=200&offset=0",
      "https://app.famulor.io/api/v1/assistants?limit=200&offset=200",
    ]);
    expect(
      requests.every((request) => request.authorization === `Bearer ${apiKey}`),
    ).toBe(true);
    expect(requests.every((request) => request.method === "GET")).toBe(true);
    expect(result.data).toHaveLength(201);
    expect(result.data?.at(-1)).toEqual({
      value: assistantId,
      label: "After hours (inactive)",
    });
  });

  it("lists outbound phone numbers and skips inbound-only numbers", async () => {
    mockFamulor({
      "GET /phone-numbers": () =>
        Response.json({
          data: [
            {
              id: phoneNumberId,
              number: "+4930123456",
              direction_outbound: true,
            },
            {
              id: "44444444-4444-4444-8444-444444444444",
              number: "+4930765432",
              direction_outbound: false,
            },
          ],
          meta: { pagination: { total: 2 } },
        }),
    });

    const result = await fetchPhoneNumbersHandler.fetch({
      credentials: { apiKey },
      options: options({}),
    });

    expect(result.data).toEqual([
      { value: phoneNumberId, label: "+4930123456" },
    ]);
  });
});

type RouteResponder = (request: { url: string }) => Response;

const mockFamulor = (routes: Record<string, RouteResponder>) => {
  const requests: {
    method: string;
    url: string;
    authorization: string | null;
    body: unknown;
  }[] = [];

  globalThis.fetch = Object.assign(
    async (input: string | URL | Request, init?: RequestInit) => {
      const url = input instanceof Request ? input.url : input.toString();
      const method = (
        init?.method ?? (input instanceof Request ? input.method : "GET")
      ).toUpperCase();
      const headers = new Headers(
        init?.headers ?? (input instanceof Request ? input.headers : undefined),
      );
      const body = await readBody(init?.body ?? null);
      requests.push({
        method,
        url,
        authorization: headers.get("authorization"),
        body,
      });
      const path = new URL(url).pathname.replace(/\/api\/v1/, "");
      const responder = routes[`${method} ${path}`];
      if (!responder) return Response.json({ data: [] });
      return responder({ url });
    },
    { preconnect: originalFetch.preconnect },
  );

  return requests;
};

const readBody = async (body: BodyInit | null) => {
  if (body == null) return undefined;
  const text =
    typeof body === "string"
      ? body
      : body instanceof URLSearchParams
        ? body.toString()
        : new TextDecoder().decode(
            body instanceof ArrayBuffer
              ? body
              : ArrayBuffer.isView(body)
                ? body
                : await new Response(body).arrayBuffer(),
          );
  if (!text) return undefined;
  const parsed: unknown = JSON.parse(text);
  return parsed;
};

const options = <T extends Record<string, unknown>>(value: T) =>
  Object.assign(Object.create(null), value);

const createVariablesStore = (
  setVariables: { id: string; value: unknown }[],
): VariableStore => ({
  get: () => undefined,
  set: (variables) => {
    setVariables.push(...variables);
  },
  parse: (value) => value,
  list: () => [],
});

const createLogsStore = (logs: unknown[]): LogsStore => ({
  add: (log) => {
    logs.push(log);
  },
});

const assistantUuid = (index: number) =>
  `00000000-0000-4000-8000-${index.toString(16).padStart(12, "0")}`;
