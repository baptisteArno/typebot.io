import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import { describe, expect, it } from "vitest";
import { parseMultipleChoiceReply } from "./parseMultipleChoiceReply";

const createMockItem = (
  id: string,
  content: string,
): ChoiceInputBlock["items"][number] => ({
  id,
  content,
  outgoingEdgeId: "edge1",
});

describe("parseMultipleChoiceReply", () => {
  it("should return fail if no items match", () => {
    const result = parseMultipleChoiceReply("test", {
      items: [createMockItem("id1", "item 1"), createMockItem("id2", "item 2")],
    });
    expect(result).toEqual({ status: "fail" });
  });

  it("should match with hybrid content and index", () => {
    const result = parseMultipleChoiceReply("1 and second item, id3", {
      items: [
        createMockItem("id1", "item"),
        createMockItem("id2", "second item"),
        createMockItem("id3", "third item"),
      ],
    });
    expect(result).toEqual({
      status: "success",
      content: "item, second item, third item",
    });
  });

  it("should be order independent", () => {
    const result = parseMultipleChoiceReply("2 and item", {
      items: [
        createMockItem("id1", "item"),
        createMockItem("id2", "second item"),
      ],
    });
    expect(result).toEqual({ status: "success", content: "item, second item" });
  });

  it("should work when the choices are overlapping", () => {
    const result = parseMultipleChoiceReply("item and second item", {
      items: [
        createMockItem("id1", "item"),
        createMockItem("id2", "second item"),
      ],
    });
    expect(result).toEqual({ status: "success", content: "item, second item" });
  });

  it("should work with dirty values / input", () => {
    const result = parseMultipleChoiceReply("item and second item", {
      items: [
        createMockItem("id1", "item\n"),
        createMockItem("id2", " second item "),
      ],
    });
    expect(result).toEqual({ status: "success", content: "item, second item" });

    const result2 = parseMultipleChoiceReply(" item and second item \n", {
      items: [
        createMockItem("id1", "item"),
        createMockItem("id2", "second item"),
      ],
    });
    expect(result2).toEqual({
      status: "success",
      content: "item, second item",
    });
  });

  it("should not work when the choice is inside a longer word", () => {
    const result = parseMultipleChoiceReply("tests", {
      items: [createMockItem("id1", "Just a few tests")],
    });
    expect(result).toEqual({ status: "fail" });
  });

  it("should work with korean characters", () => {
    const result = parseMultipleChoiceReply("아이템", {
      items: [createMockItem("id1", "아이템")],
    });
    expect(result).toEqual({ status: "success", content: "아이템" });
  });
});
