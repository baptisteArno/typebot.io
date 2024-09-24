import * as Typebot from "../../src";

beforeEach(() => {
  document.body.innerHTML = "";
});

it("should have the corresponding custom color", () => {
  expect.assertions(1);
  Typebot.initBubble({
    button: { color: "#222222" },
    url: "https://typebot.io/typebot-id",
  });
  const buttonElement = document.querySelector(
    "#typebot-bubble > button",
  ) as HTMLElement;
  expect(buttonElement.style.backgroundColor).toBe("rgb(34, 34, 34)");
});

it("should have the default svg icon", () => {
  expect.assertions(1);
  Typebot.initBubble({
    url: "https://typebot.io/typebot-id",
  });
  const buttonIconElement = document.querySelector(
    "#typebot-bubble > button > .icon",
  ) as HTMLElement;
  expect(buttonIconElement.tagName).toBe("svg");
});

it("should have the corresponding custom icon", () => {
  expect.assertions(1);
  Typebot.initBubble({
    button: { iconUrl: "https://web.com/icon.png" },
    url: "https://typebot.io/typebot-id",
  });
  const buttonIconElement = document.querySelector(
    "#typebot-bubble > button > .icon",
  ) as HTMLImageElement;
  expect(buttonIconElement.src).toBe("https://web.com/icon.png");
});
