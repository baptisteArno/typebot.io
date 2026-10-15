import { expect, it } from "bun:test";
import { sessionStateSchema } from "./schemas";

it("migrates stored v1 sessions without a version key", () => {
  const storedSession = {
    typebot: {
      id: "typebot",
      version: "5",
      groups: [],
      events: null,
      edges: [],
      variables: [],
    },
    linkedTypebots: { typebots: [], queue: [] },
    currentTypebotId: "typebot",
    result: { id: "result", variables: [], answers: [] },
  };

  expect(sessionStateSchema.parse(storedSession)).toMatchObject({
    version: "3",
    typebotsQueue: [
      { typebot: storedSession.typebot, resultId: "result", answers: [] },
    ],
  });
  expect(
    sessionStateSchema.safeParse({ ...storedSession, version: "unknown" })
      .success,
  ).toBe(false);
});
