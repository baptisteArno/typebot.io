import { afterEach, describe, expect, it, spyOn } from "bun:test";
import type { LogsStore, VariableStore } from "@typebot.io/forge/types";
import type {
  ResponseCreateAndStreamParams,
  ResponseStream,
  ResponseStreamParams,
} from "openai/lib/responses/ResponseStream";
import {
  type ResponseOutputItem,
  Responses,
} from "openai/resources/responses/responses";
import { maxToolCalls } from "../constants";

process.env.SKIP_ENV_CHECK = "true";

const { askModelHandler } = await import("./askModelHandler");

const streamSpies: { mockRestore: () => void }[] = [];

afterEach(() => {
  for (const streamSpy of streamSpies.splice(0)) streamSpy.mockRestore();
});

describe("askModelHandler", () => {
  it("answers the function calls left at the limit before saving the response id", async () => {
    const requests = mockResponsesApiAlwaysCallingFunctions();
    const variables = new Map<string, unknown>();
    const logs: Parameters<LogsStore["add"]>[0][] = [];

    await askModelHandler.server?.({
      credentials: { apiKey: "sk-test" },
      options: Object.assign(Object.create(null), {
        model: "gpt-test",
        message: "Find me a free slot",
        functions: [{ name: "search_slots" }],
        responseMapping: [
          { item: "Message", variableId: "answer" },
          { item: "Response ID", variableId: "response-id" },
        ],
      }),
      variables: createVariablesStore(variables),
      logs: { add: (log) => logs.push(log) },
      sessionStore: Object.create(null),
    });

    expect(requests).toHaveLength(maxToolCalls + 2);
    const lastRequest = requests.at(-1);
    expect(lastRequest?.tool_choice).toBe("none");
    expect(lastRequest?.previous_response_id).toBe(`resp_${maxToolCalls + 1}`);
    expect(lastRequest?.input).toEqual([
      {
        type: "function_call_output",
        call_id: `call_${maxToolCalls + 1}`,
        output: expect.stringContaining("limit reached"),
      },
    ]);
    expect(variables.get("response-id")).toBe(`resp_${maxToolCalls + 2}`);
    expect(variables.get("answer")).toBe("Done");
    expect(logs).toEqual([expect.stringContaining(`limit of ${maxToolCalls}`)]);
  });
});

// Every response asks for another function call, unless the request disables tools.
const mockResponsesApiAlwaysCallingFunctions = () => {
  const requests: ResponseCreateAndStreamParams[] = [];
  const streamSpy = spyOn(Responses.prototype, "stream");
  streamSpy.mockImplementation(
    <Params extends ResponseStreamParams, ParsedT>(
      params: Params,
    ): ResponseStream<ParsedT> => {
      if (!("input" in params)) throw new Error("Unexpected stream by id");
      requests.push(params);
      const id = `resp_${requests.length}`;
      if (params.tool_choice === "none")
        return createFakeResponseStream(id, "Done", [
          {
            type: "message",
            id: `msg_${requests.length}`,
            role: "assistant",
            status: "completed",
            content: [{ type: "output_text", text: "Done", annotations: [] }],
          },
        ]);
      return createFakeResponseStream(id, undefined, [
        {
          type: "function_call",
          call_id: `call_${requests.length}`,
          name: "search_slots",
          arguments: "{}",
        },
      ]);
    },
  );
  streamSpies.push(streamSpy);
  return requests;
};

const createFakeResponseStream = (
  id: string,
  text: string | undefined,
  output: ResponseOutputItem[],
) =>
  Object.assign(Object.create(null), {
    async *[Symbol.asyncIterator]() {
      if (text) yield { type: "response.output_text.delta", delta: text };
    },
    finalResponse: async () => ({ id, output }),
  });

const createVariablesStore = (
  variables: Map<string, unknown>,
): VariableStore => ({
  get: () => undefined,
  set: (newVariables) => {
    for (const { id, value } of newVariables) variables.set(id, value);
  },
  parse: (value) => value,
  list: () => [],
});
