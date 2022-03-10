import * as Typebot from "../../src";

describe("initBubble", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should initialize a bubble embed", () => {
    expect.assertions(2);
    Typebot.initBubble({ publishId: "typebot-id" });
    const bubbleElement = document.getElementById("typebot-bubble");
    const frame = document.getElementsByTagName("iframe")[0];
    expect(frame).toBeDefined();
    expect(bubbleElement).toBeDefined();
  });

  it("should overwrite bubble if exists", () => {
    expect.assertions(2);
    Typebot.initBubble({
      publishId: "typebot-id",
      hiddenVariables: { var1: "test" },
    });
    Typebot.initBubble({ publishId: "typebot-id2" });
    const frames = document.getElementsByTagName("iframe");
    expect(frames).toHaveLength(1);
    expect(frames[0].dataset.src).toBe(
      "https://typebot-viewer.vercel.app/typebot-id2?hn=localhost"
    );
  });
});
