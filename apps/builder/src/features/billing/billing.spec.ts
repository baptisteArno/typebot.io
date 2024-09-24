import {
  addSubscriptionToWorkspace,
  cancelSubscription,
  createClaimableCustomPlan,
} from "@/test/utils/databaseActions";
import { createId } from "@paralleldrive/cuid2";
import test, { expect } from "@playwright/test";
import { env } from "@typebot.io/env";
import {
  createTypebots,
  createWorkspaces,
  deleteWorkspaces,
  injectFakeResults,
} from "@typebot.io/playwright/databaseActions";
import { Plan } from "@typebot.io/prisma/enum";

const usageWorkspaceId = createId();
const usageTypebotId = createId();
const planChangeWorkspaceId = createId();
const enterpriseWorkspaceId = createId();

test.beforeAll(async () => {
  await createWorkspaces([
    {
      id: usageWorkspaceId,
      name: "Usage Workspace",
      plan: Plan.STARTER,
    },
    {
      id: planChangeWorkspaceId,
      name: "Plan Change Workspace",
    },
    {
      id: enterpriseWorkspaceId,
      name: "Enterprise Workspace",
    },
  ]);
  await createTypebots([{ id: usageTypebotId, workspaceId: usageWorkspaceId }]);
});

test.afterAll(async () => {
  await deleteWorkspaces([
    usageWorkspaceId,
    planChangeWorkspaceId,
    enterpriseWorkspaceId,
  ]);
});

test("should display valid usage", async ({ page }) => {
  await page.goto("/typebots");
  await page.click("text=Settings & Members");
  await page.click("text=Billing & Usage");
  await expect(page.locator('text="/ 10,000"')).toBeVisible();
  await page.getByText("Members", { exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Members (1/5)" }),
  ).toBeVisible();
  await page.click("text=Pro workspace", { force: true });

  await page.click("text=Pro workspace");
  await page.click('text="Custom workspace"');
  await page.click("text=Settings & Members");
  await page.click("text=Billing & Usage");
  await expect(page.locator('text="/ 100,000"')).toBeVisible();
  await expect(page.getByText("Upgrade to Starter")).toBeHidden();
  await expect(page.getByText("Upgrade to Pro")).toBeHidden();
  await expect(page.getByText("Need custom limits?")).toBeHidden();
  await page.getByText("Members", { exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Members (1/20)" }),
  ).toBeVisible();
  await page.click("text=Custom workspace", { force: true });

  await page.click("text=Custom workspace");
  await page.click('text="Free workspace"');
  await page.click("text=Settings & Members");
  await page.click("text=Billing & Usage");
  await expect(page.locator('text="/ 200"')).toBeVisible();
  await page.getByText("Members", { exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Members (1/1)" }),
  ).toBeVisible();
  await page.click("text=Free workspace", { force: true });

  await injectFakeResults({
    count: 10,
    typebotId: usageTypebotId,
  });
  await page.click("text=Free workspace");
  await page.click('text="Usage Workspace"');
  await page.click("text=Settings & Members");
  await page.click("text=Billing & Usage");
  await expect(page.locator('text="/ 2,000"')).toBeVisible();
  await expect(page.locator('text="10" >> nth=0')).toBeVisible();
  await expect(page.locator('[role="progressbar"] >> nth=0')).toHaveAttribute(
    "aria-valuenow",
    "1",
  );

  await injectFakeResults({
    typebotId: usageTypebotId,
    count: 1090,
  });
  await page.click('text="Settings"');
  await page.click('text="Billing & Usage"');
  await expect(page.locator('text="/ 2,000"')).toBeVisible();
  await expect(page.locator('text="1,100"')).toBeVisible();
  await expect(page.locator('[aria-valuenow="55"]')).toBeVisible();
});

test("plan changes should work", async ({ page }) => {
  test.setTimeout(80000);
  // Upgrade to STARTER
  await page.goto("/typebots");
  await page.click("text=Pro workspace");
  await page.click("text=Plan Change Workspace");
  await page.click("text=Settings & Members");
  await page.click("text=Billing & Usage");
  await expect(page.locator('text="$39"')).toBeVisible();
  await page.click("button >> text=Upgrade >> nth=0");
  await page.getByLabel("Company name").fill("Company LLC");
  await page.getByRole("button", { name: "Go to checkout" }).click();
  await page.waitForNavigation();
  expect(page.url()).toContain("https://checkout.stripe.com");
  await expect(page.locator("text=$39 >> nth=0")).toBeVisible();
  const stripeId = await addSubscriptionToWorkspace(
    planChangeWorkspaceId,
    [
      {
        price: env.STRIPE_STARTER_PRICE_ID,
        quantity: 1,
      },
      {
        price: env.STRIPE_STARTER_CHATS_PRICE_ID,
      },
    ],
    { plan: Plan.STARTER },
  );

  // Update plan with additional quotas
  await page.goto("/typebots");
  await page.click("text=Settings & Members");
  await page.click("text=Billing & Usage");
  await expect(page.locator('text="/ 2,000"')).toBeVisible();
  await expect(page.getByText("/ 2,000")).toBeVisible();

  // Upgrade to PRO
  await expect(page.locator('text="$89"')).toBeVisible();
  await page.click("button >> text=Upgrade");
  await expect(
    page.locator('text="Workspace PRO plan successfully updated" >> nth=0'),
  ).toBeVisible();

  // Go to customer portal
  await Promise.all([
    page.waitForNavigation(),
    page.click('text="Billing portal"'),
  ]);
  await expect(page.getByText("$39.00")).toBeVisible({
    timeout: 10000,
  });
  await expect(page.getByText("$50.00")).toBeVisible({
    timeout: 10000,
  });
  await expect(page.locator('text="Add payment method"')).toBeVisible();
  await cancelSubscription(stripeId);

  // Cancel subscription
  await page.goto("/typebots");
  await page.click("text=Settings & Members");
  await page.click("text=Billing & Usage");
  await expect(
    page.getByTestId("current-subscription").getByTestId("pro-plan-tag"),
  ).toBeVisible();
  await expect(page.getByText("Will be cancelled on")).toBeVisible();
});

test("should display invoices", async ({ page }) => {
  await page.goto("/typebots");
  await page.click("text=Settings & Members");
  await page.click("text=Billing & Usage");
  await expect(page.locator('text="Invoices"')).toBeHidden();
  await page.click("text=Pro workspace", { force: true });

  await page.click("text=Pro workspace");
  await page.click("text=Plan Change Workspace");
  await page.click("text=Settings & Members");
  await page.click("text=Billing & Usage");
  await expect(page.locator('text="Invoices"')).toBeVisible();
  await expect(page.locator("tr")).toHaveCount(4);
  await expect(page.getByText("$39.00")).toBeVisible();
  await expect(page.getByText("$50.00")).toBeVisible();
});

test("custom plans should work", async ({ page }) => {
  await page.goto("/typebots");
  await page.click("text=Pro workspace");
  await page.click("text=Enterprise Workspace");
  await page.click("text=Settings & Members");
  await page.click("text=Billing & Usage");
  await expect(page.getByTestId("current-subscription")).toHaveText(
    "Current workspace subscription: Free",
  );
  await createClaimableCustomPlan({
    currency: "usd",
    price: 239,
    workspaceId: enterpriseWorkspaceId,
    chatsLimit: 100000,
    storageLimit: 50,
    seatsLimit: 10,
    name: "Acme custom plan",
    description: "Description of the deal",
  });

  await page.goto("/typebots?claimCustomPlan=true");

  await expect(page.getByRole("list").getByText("$239.00")).toBeVisible();
  await expect(page.getByText("Subscribe to Acme custom plan")).toBeVisible();
});
