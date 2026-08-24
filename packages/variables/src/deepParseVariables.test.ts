import { describe, expect, test } from "bun:test";
import { SessionStore } from "@typebot.io/runtime-session-store";
import { deepParseVariables } from "./deepParseVariables";

const variables = [
  {
    id: "vector-store-id",
    name: "Vector store ID",
    value: "vs_123",
  },
  {
    id: "vector-store-ids",
    name: "Vector store IDs",
    value: ["vs_123", "vs_456"],
  },
];

describe("deepParseVariables", () => {
  test("parses variables in object fields at any depth", () => {
    expect(
      deepParseVariables(
        {
          directValue: "Store {{Vector store ID}}",
          nestedObject: {
            directValue: "{{Vector store ID}}",
          },
        },
        { variables, sessionStore: new SessionStore() },
      ),
    ).toEqual({
      directValue: "Store vs_123",
      nestedObject: {
        directValue: "vs_123",
      },
    });
  });

  test("parses variables in direct array strings", () => {
    expect(
      deepParseVariables(
        { fileSearchVectorStoreIds: ["{{Vector store ID}}"] },
        { variables, sessionStore: new SessionStore() },
      ),
    ).toEqual({ fileSearchVectorStoreIds: ["vs_123"] });
  });

  test("parses variables in nested array strings", () => {
    expect(
      deepParseVariables(
        { nestedValues: [["{{Vector store ID}}"]] },
        { variables, sessionStore: new SessionStore() },
      ),
    ).toEqual({ nestedValues: [["vs_123"]] });
  });

  test("parses variables when the root value is an array", () => {
    expect(
      deepParseVariables(
        ["{{Vector store ID}}", ["Store {{Vector store ID}}"]],
        { variables, sessionStore: new SessionStore() },
      ),
    ).toEqual(["vs_123", ["Store vs_123"]]);
  });

  test("parses array object fields and preserves non-string values", () => {
    expect(
      deepParseVariables(
        {
          tools: [
            {
              id: "{{Vector store ID}}",
              nestedIds: ["{{Vector store ID}}"],
              enabled: true,
              maxResults: 10,
              optional: null,
            },
          ],
        },
        { variables, sessionStore: new SessionStore() },
      ),
    ).toEqual({
      tools: [
        {
          id: "vs_123",
          nestedIds: ["vs_123"],
          enabled: true,
          maxResults: 10,
          optional: null,
        },
      ],
    });
  });

  test("keeps primitive root values unchanged", () => {
    expect(
      deepParseVariables("{{Vector store ID}}", {
        variables,
        sessionStore: new SessionStore(),
      }),
    ).toBe("{{Vector store ID}}");
    expect(
      deepParseVariables(42, {
        variables,
        sessionStore: new SessionStore(),
      }),
    ).toBe(42);
    expect(
      deepParseVariables(null, {
        variables,
        sessionStore: new SessionStore(),
      }),
    ).toBeNull();
  });

  test("guesses parsed string types recursively when requested", () => {
    expect<unknown>(
      deepParseVariables(
        {
          values: ["42", "true", "null", '{"enabled":true}', "text"],
          nested: { value: "false" },
        },
        {
          variables,
          guessCorrectTypes: true,
          sessionStore: new SessionStore(),
        },
      ),
    ).toEqual({
      values: [42, true, null, { enabled: true }, "text"],
      nested: { value: false },
    });
  });

  test("keeps parsed values as strings by default", () => {
    expect(
      deepParseVariables(
        { values: ["42", "true", "null", '{"enabled":true}'] },
        { variables, sessionStore: new SessionStore() },
      ),
    ).toEqual({
      values: ["42", "true", "null", '{"enabled":true}'],
    });
  });

  test("removes empty object fields recursively when requested", () => {
    expect<unknown>(
      deepParseVariables(
        {
          empty: "",
          missingVariable: "{{Missing variable}}",
          nested: {
            empty: "",
            value: "{{Vector store ID}}",
          },
        },
        {
          variables,
          removeEmptyStrings: true,
          sessionStore: new SessionStore(),
        },
      ),
    ).toEqual({
      nested: {
        value: "vs_123",
      },
    });
  });

  test("forwards variable parsing options to array strings", () => {
    expect(
      deepParseVariables(
        {
          latestValue: ["{{Vector store IDs}}"],
        },
        {
          variables,
          sessionStore: new SessionStore(),
          takeLatestIfList: true,
        },
      ),
    ).toEqual({ latestValue: ["vs_456"] });

    expect(
      deepParseVariables(
        {
          variableId: ["{{Vector store ID}}"],
        },
        {
          variables,
          fieldToParse: "id",
          sessionStore: new SessionStore(),
        },
      ),
    ).toEqual({ variableId: ["vector-store-id"] });
  });

  test("does not mutate input objects or arrays", () => {
    const input = {
      directValue: "{{Vector store ID}}",
      values: ["{{Vector store ID}}"],
    };

    const result = deepParseVariables(input, {
      variables,
      sessionStore: new SessionStore(),
    });

    expect(input).toEqual({
      directValue: "{{Vector store ID}}",
      values: ["{{Vector store ID}}"],
    });
    expect(result).not.toBe(input);
    expect(result.values).not.toBe(input.values);
  });
});
