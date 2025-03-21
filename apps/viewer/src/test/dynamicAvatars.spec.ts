import test, { expect } from "@playwright/test";
import { createId } from "@typebot.io/lib/createId";
import { importTypebotInDatabase } from "@typebot.io/playwright/databaseActions";
import { getTestAsset } from "./utils/playwright";

test("should work as expected", async ({ page }) => {
  const typebotId = createId();
  await importTypebotInDatabase(getTestAsset("typebots/dynamicAvatars.json"), {
    id: typebotId,
    publicId: `${typebotId}-public`,
  });
  await page.goto(`/${typebotId}-public`);
  await expect(page.getByRole("img", { name: "Bot avatar" })).toHaveAttribute(
    "src",
    "https://images.unsplash.com/photo-1718563552473-2d97b224e801?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MjU2MDR8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDI1NzIzOTN8&ixlib=rb-4.0.3&q=80&w=1080",
  );
  await page.getByRole("button", { name: "Next" }).click();
  await expect(
    page.getByRole("img", { name: "Bot avatar" }).nth(1),
  ).toHaveAttribute(
    "src",
    "https://images.unsplash.com/photo-1718563552473-2d97b224e801?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MjU2MDR8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDI1NzIzOTN8&ixlib=rb-4.0.3&q=80&w=1080",
  );
  await expect(page.getByText("😅")).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("😅").nth(1)).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Bot avatar" }).nth(2),
  ).toHaveAttribute(
    "src",
    "https://media1.giphy.com/media/CGXnGb7zpsvXD2uwvd/giphy-downsized.gif?cid=fe3852a3wdr6wsbqhljpeqqclihoay1kwtl091k4bjyuwouu&ep=v1_gifs_trending&rid=giphy-downsized.gif&ct=g",
  );
  await page.getByRole("button", { name: "Next" }).click();
  await expect(
    page.getByRole("img", { name: "Bot avatar" }).nth(3),
  ).toHaveAttribute(
    "src",
    "https://media1.giphy.com/media/CGXnGb7zpsvXD2uwvd/giphy-downsized.gif?cid=fe3852a3wdr6wsbqhljpeqqclihoay1kwtl091k4bjyuwouu&ep=v1_gifs_trending&rid=giphy-downsized.gif&ct=g",
  );

  await page.reload();

  await expect(
    page.getByRole("img", { name: "Bot avatar" }).nth(0),
  ).toHaveAttribute(
    "src",
    "https://images.unsplash.com/photo-1718563552473-2d97b224e801?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MjU2MDR8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDI1NzIzOTN8&ixlib=rb-4.0.3&q=80&w=1080",
  );
  await expect(
    page.getByRole("img", { name: "Bot avatar" }).nth(1),
  ).toHaveAttribute(
    "src",
    "https://images.unsplash.com/photo-1718563552473-2d97b224e801?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MjU2MDR8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDI1NzIzOTN8&ixlib=rb-4.0.3&q=80&w=1080",
  );
  await expect(page.getByText("😅").nth(0)).toBeVisible();
  await expect(page.getByText("😅").nth(1)).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Bot avatar" }).nth(2),
  ).toHaveAttribute(
    "src",
    "https://media1.giphy.com/media/CGXnGb7zpsvXD2uwvd/giphy-downsized.gif?cid=fe3852a3wdr6wsbqhljpeqqclihoay1kwtl091k4bjyuwouu&ep=v1_gifs_trending&rid=giphy-downsized.gif&ct=g",
  );
  await expect(
    page.getByRole("img", { name: "Bot avatar" }).nth(3),
  ).toHaveAttribute(
    "src",
    "https://media1.giphy.com/media/CGXnGb7zpsvXD2uwvd/giphy-downsized.gif?cid=fe3852a3wdr6wsbqhljpeqqclihoay1kwtl091k4bjyuwouu&ep=v1_gifs_trending&rid=giphy-downsized.gif&ct=g",
  );
});
