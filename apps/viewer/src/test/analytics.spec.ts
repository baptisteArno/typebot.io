import test, { expect } from "@playwright/test";
import { env } from "@typebot.io/env";
import { createId } from "@typebot.io/lib/createId";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { getTestAsset } from "./utils/playwright";

test("should work as expected", async ({ page: botPage, context }) => {
  const typebotId = createId();
  await importTypebotInDatabase(getTestAsset("typebots/analytics.json"), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  });
  const analyticsPage = await context.newPage();
  await analyticsPage.goto(
    `${env.NEXTAUTH_URL}/typebots/${typebotId}/results/analytics`,
  );
  await expect(analyticsPage.getByTestId("dropoff-edge-1")).toBeHidden();
  await botPage.goto(`/${typebotId}-public`);
  await analyticsPage.reload();
  await expect(analyticsPage.getByTestId("dropoff-edge-1")).toHaveText(
    "100%1 user",
  );
  const reloadAndDezoom = async (times: number) => {
    await analyticsPage.reload();
    for (let i = 0; i < times; i++) {
      await analyticsPage.getByRole("button", { name: "Zoom out" }).click();
    }
  };
  await botPage
    .getByRole("button", { name: "I have a feature request ✨" })
    .click();
  await reloadAndDezoom(2);
  await expect(analyticsPage.getByTestId("dropoff-edge-1")).toHaveText(
    "0%0 user",
  );
  await expect(analyticsPage.getByTestId("dropoff-edge-2")).toHaveText(
    "100%1 user",
  );

  await botPage.getByRole("button", { name: "Restart" }).click();
  await reloadAndDezoom(2);
  await expect(analyticsPage.getByTestId("dropoff-edge-1")).toHaveText(
    "50%1 user",
  );
  await expect(analyticsPage.getByTestId("dropoff-edge-2")).toHaveText(
    "0%0 user",
  );

  await botPage.getByRole("button", { name: "There is a bug 🐛" }).click();
  await reloadAndDezoom(3);
  await expect(analyticsPage.getByTestId("dropoff-edge-1")).toHaveText(
    "0%0 user",
  );
  await expect(analyticsPage.getByTestId("dropoff-edge-2")).toHaveText(
    "0%0 user",
  );
  await expect(analyticsPage.getByTestId("dropoff-edge-3")).toHaveText(
    "100%1 user",
  );

  await botPage.getByTestId("textarea").fill("This is a test");
  await botPage.getByRole("button", { name: "Send" }).click();
  await reloadAndDezoom(4);
  await expect(analyticsPage.getByTestId("dropoff-edge-3")).toHaveText(
    "0%0 user",
  );
  await expect(analyticsPage.getByTestId("dropoff-edge-4")).toHaveText(
    "100%1 user",
  );

  await botPage
    .getByRole("textbox", { name: "Type your email..." })
    .fill("test@test.com");
  await botPage.getByRole("button", { name: "Send" }).click();
  await reloadAndDezoom(5);
  await expect(analyticsPage.getByTestId("dropoff-edge-4")).toHaveText(
    "0%0 user",
  );
  await expect(analyticsPage.getByTestId("dropoff-edge-5")).toHaveText(
    "100%1 user",
  );

  await botPage.getByRole("button", { name: "Restart" }).click();
  await reloadAndDezoom(5);
  await expect(analyticsPage.getByTestId("dropoff-edge-5")).toHaveText(
    "0%0 user",
  );
  await expect(analyticsPage.getByTestId("dropoff-edge-1")).toHaveText(
    "33%1 user",
  );
});
