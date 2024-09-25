import { getPopupActions, initPopup } from "../src/embedTypes/popup";

describe("initPopup", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should return the popupElement with lazy iframe", () => {
    expect.assertions(2);
    initPopup({ url: "https://typebot.io/typebot-id" });
    const popupElement = document.getElementById("typebot-popup");
    const iframeElement = popupElement?.children[0] as HTMLIFrameElement;
    expect(popupElement).toBeTruthy();
    expect(iframeElement.dataset.src).toBeDefined();
  });

  it("should overwrite if exists", () => {
    expect.assertions(2);
    initPopup({
      url: "https://typebot.io/typebot-id",
      hiddenVariables: { test1: "yo" },
    });
    initPopup({ url: "https://typebot.io/typebot-id2" });
    const elements = document.getElementsByTagName("iframe");
    expect(elements).toHaveLength(1);
    expect(elements[0].dataset.src).toBe("https://typebot.io/typebot-id2");
  });

  it("shouldn't have opened classname if no delay", () => {
    expect.assertions(1);
    initPopup({ url: "https://typebot.io/typebot-id" });
    const popupElement = document.getElementById("typebot-popup");
    expect(popupElement?.classList.contains("opened")).toBe(false);
  });

  it("should have the opened classname after the delay", async () => {
    expect.assertions(2);
    initPopup({ delay: 500, url: "https://typebot.io/typebot-id" });
    const popupElement = document.getElementById("typebot-popup");
    expect(popupElement?.classList.contains("opened")).toBe(false);
    await new Promise((r) => setTimeout(r, 1000));
    expect(popupElement?.classList.contains("opened")).toBe(true);
  });
});

describe("openPopup", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should add opened className and lazy load", () => {
    expect.assertions(5);
    const { open } = initPopup({ url: "https://typebot.io/typebot-id" });
    const popupElement = document.getElementById("typebot-popup");
    expect(popupElement?.children[0].getAttribute("data-src")).toBeTruthy();
    open();
    expect(popupElement?.classList.contains("opened")).toBe(true);
    expect(document.body.style.overflowY).toBe("hidden");
    expect(popupElement?.children[0].getAttribute("data-src")).toBeFalsy();
    expect(open).not.toThrow();
  });

  it("should still work if initializing a second time", () => {
    expect.assertions(2);
    initPopup({ url: "https://typebot.io/typebot-id" });
    const { open } = initPopup({ url: "https://typebot.io/typebot-id" });
    const popupElement = document.getElementById("typebot-popup");
    open();
    expect(popupElement?.classList.contains("opened")).toBe(true);
    expect(document.body.style.overflowY).toBe("hidden");
  });
});

describe("closePopup", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("shouldn remove opened className", () => {
    expect.assertions(2);
    const { close } = initPopup({ url: "https://typebot.io/typebot-id" });
    const popupElement = document.getElementById("typebot-popup");
    close();
    expect(popupElement?.classList.contains("opened")).toBe(false);
    expect(document.body.style.overflowY).toBe("auto");
  });

  it("should still work if initializing a second time", () => {
    expect.assertions(2);
    initPopup({ url: "https://typebot.io/typebot-id" });
    const { close } = initPopup({ url: "https://typebot.io/typebot-id" });
    const popupElement = document.getElementById("typebot-popup");
    close();
    expect(popupElement?.classList.contains("opened")).toBe(false);
    expect(document.body.style.overflowY).toBe("auto");
  });
});

describe("Request commands afterwards", () => {
  it("should return defined commands", () => {
    initPopup({
      url: "https://typebot.io/typebot-id",
    });

    const { close, open } = getPopupActions();
    expect(close).toBeDefined();
    expect(open).toBeDefined();
    open();
    const popup = document.getElementById("typebot-popup") as HTMLDivElement;
    expect(popup.classList.contains("opened")).toBe(true);
  });
});
