import { describe, expect, it } from "bun:test";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { TypebotInSessionV6 } from "@typebot.io/chat-session/schemas";
import { ComparisonOperators } from "@typebot.io/conditions/constants";
import { EventType } from "@typebot.io/events/constants";
import { SessionStore } from "@typebot.io/runtime-session-store";
import { computeResultTranscript } from "./computeResultTranscript";

const buildTypebotWithSessionVarDisplayCondition = (): TypebotInSessionV6 => ({
  version: "6.1",
  id: "typebot-1",
  variables: [
    {
      id: "session-var-id",
      name: "Page Url",
      isSessionVariable: true,
    },
  ],
  events: [
    {
      id: "start-event",
      type: EventType.START,
      graphCoordinates: { x: 0, y: 0 },
      outgoingEdgeId: "edge-start",
    },
  ],
  edges: [
    {
      id: "edge-start",
      from: { eventId: "start-event" },
      to: { groupId: "group-choice" },
    },
    {
      id: "edge-product",
      from: { blockId: "choice-block", itemId: "item-product" },
      to: { groupId: "group-product" },
    },
    {
      id: "edge-other",
      from: { blockId: "choice-block", itemId: "item-other" },
      to: { groupId: "group-other" },
    },
  ],
  groups: [
    {
      id: "group-choice",
      title: "Choice",
      graphCoordinates: { x: 0, y: 0 },
      blocks: [
        {
          id: "choice-block",
          type: InputBlockType.CHOICE,
          items: [
            {
              id: "item-product",
              content: "Show product page",
              outgoingEdgeId: "edge-product",
              displayCondition: {
                isEnabled: true,
                condition: {
                  comparisons: [
                    {
                      id: "cmp-1",
                      variableId: "session-var-id",
                      comparisonOperator: ComparisonOperators.CONTAINS,
                      value: "/product/",
                    },
                  ],
                },
              },
            },
            {
              id: "item-other",
              content: "Other",
              outgoingEdgeId: "edge-other",
            },
          ],
        },
      ],
    },
    {
      id: "group-product",
      title: "Product",
      graphCoordinates: { x: 0, y: 0 },
      blocks: [],
    },
    {
      id: "group-other",
      title: "Other",
      graphCoordinates: { x: 0, y: 0 },
      blocks: [],
    },
  ],
});

describe("computeResultTranscript", () => {
  it("does not throw when a chosen item's displayCondition relies on an unset session variable", () => {
    const typebot = buildTypebotWithSessionVarDisplayCondition();
    const sessionStore = new SessionStore();

    const transcript = computeResultTranscript({
      typebot,
      answers: [{ blockId: "choice-block", content: "Show product page" }],
      setVariableHistory: [],
      visitedEdges: ["edge-start", "edge-product"],
      sessionStore,
    });

    expect(transcript).toEqual([
      {
        id: "choice-block-0",
        role: "user",
        type: "text",
        text: "Show product page",
      },
    ]);
  });
});
