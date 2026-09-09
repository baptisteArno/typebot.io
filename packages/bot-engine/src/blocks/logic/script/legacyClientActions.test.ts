import { expect, mock, test } from "bun:test";
import { scriptBlockSchema } from "@typebot.io/blocks-logic/script/schema";
import { setVariableBlockSchema } from "@typebot.io/blocks-logic/setVariable/schema";
import { clientSideActionSchema } from "@typebot.io/chat-api/clientSideAction";
import { sessionStateSchema } from "@typebot.io/chat-session/schemas";
import { withSessionStore } from "@typebot.io/runtime-session-store";

process.env.SKIP_ENV_CHECK = "true";
// Client actions must not invoke the native server-side VM.
mock.module("@typebot.io/variables/executeFunction", () => ({
  executeFunction: () => {
    throw new Error("Unexpected server execution");
  },
}));
mock.module("@typebot.io/variables/evaluateSetVariableExpression", () => ({
  evaluateSetVariableExpression: () => {
    throw new Error("Unexpected server execution");
  },
}));
const { executeScript } = await import("./executeScript");
const { executeSetVariable } = await import(
  "../setVariable/executeSetVariable"
);

for (const isUnsafe of [undefined, false, true])
  test(`keeps legacy sandbox selection for Code and Set Variable with stored flag ${isUnsafe}`, async () => {
    const state = sessionStateSchema.parse({
      version: "3",
      workspaceId: "workspace",
      typebotsQueue: [
        {
          answers: [],
          typebot: {
            id: "bot",
            version: "6.1",
            groups: [],
            events: [
              { id: "start", type: "start", graphCoordinates: { x: 0, y: 0 } },
            ],
            edges: [],
            variables: [{ id: "answer", name: "answer" }],
          },
        },
      ],
    });
    await withSessionStore("legacy-client-test", async (sessionStore) => {
      const code = await executeScript(
        scriptBlockSchema.parse({
          id: "code",
          type: "Code",
          options: {
            content: "return 'ok'",
            isExecutedOnClient: true,
            isUnsafe,
          },
        }),
        { state, sessionStore },
      );
      const variable = await executeSetVariable(
        setVariableBlockSchema.parse({
          id: "variable",
          type: "Set variable",
          options: {
            variableId: "answer",
            expressionToEvaluate: "return 'ok'",
            isCode: true,
            isExecutedOnClient: true,
            isUnsafe,
          },
        }),
        { state, sessionStore, setVariableHistory: [], visitedEdges: [] },
      );
      expect(code.clientSideActions).toHaveLength(1);
      expect(variable.clientSideActions).toHaveLength(1);
      for (const action of [
        ...(code.clientSideActions ?? []),
        ...(variable.clientSideActions ?? []),
      ]) {
        // Validate the serialized API contract, not only the engine object.
        const parsed = clientSideActionSchema.parse(
          JSON.parse(JSON.stringify(action)),
        );
        if (parsed.type === "scriptToExecute")
          expect(parsed.scriptToExecute.isUnsafe).toBe(true);
        else if (parsed.type === "setVariable")
          expect(parsed.setVariable.scriptToExecute.isUnsafe).toBe(true);
        else throw new Error("Unexpected action");
      }
    });
  });
