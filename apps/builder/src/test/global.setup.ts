import { test as setup } from "@playwright/test";
import { globalSetup } from "@typebot.io/playwright/globalSetup";

setup("setup db", async () => {
  await globalSetup();
});
