import test, { expect } from "@playwright/test";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import { createId } from "@typebot.io/lib/createId";
import { createTypebots } from "@typebot.io/playwright/databaseActions";
import { parseDefaultGroupWithBlock } from "@typebot.io/playwright/databaseHelpers";

test("Embed bubble blocks unsafe URLs from prefilled variables", async ({
  page,
}) => {
  const typebotId = createId();
  await createTypebots([
    {
      id: typebotId,
      variables: [{ id: "embed-url", name: "Embed URL" }],
      ...parseDefaultGroupWithBlock({
        type: BubbleBlockType.EMBED,
        content: { url: "{{Embed URL}}" },
      }),
    },
  ]);

  const unsafeUrl =
    "javascript:void(window.parent.document.documentElement.dataset.embedBubbleXss='true')";
  const prefilledVariables = new URLSearchParams({ "Embed URL": unsafeUrl });
  const [, startChatResponse] = await Promise.all([
    page.goto(`/${typebotId}-public?${prefilledVariables}`),
    page.waitForResponse(/startChat/),
  ]);

  expect(await startChatResponse.json()).toMatchObject({
    messages: [
      {
        type: BubbleBlockType.EMBED,
        content: { url: unsafeUrl },
      },
    ],
  });

  await expect(page.getByTitle("Embedded content")).toHaveAttribute(
    "src",
    "about:blank",
  );
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-embed-bubble-xss",
    "true",
  );
});
