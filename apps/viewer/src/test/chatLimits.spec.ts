import { createId } from "@paralleldrive/cuid2";
import test, { expect } from "@playwright/test";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { createTypebots } from "@typebot.io/playwright/databaseActions";
import { parseDefaultGroupWithBlock } from "@typebot.io/playwright/databaseHelpers";
import prisma from "@typebot.io/prisma";

test.describe.configure({ mode: "parallel" });

// Helper function to create results for testing
const createResults = async (
  typebotId: string,
  count: number,
  createdAt?: Date,
) => {
  const results = Array.from({ length: count }, (_, i) => ({
    id: createId(),
    typebotId,
    variables: [],
    isArchived: false,
    hasStarted: true,
    isCompleted: false,
    createdAt: createdAt || new Date(),
  }));

  await prisma.result.createMany({
    data: results,
  });

  return results;
};

test.describe("Chat Limits", () => {
  test.describe("when chat limits are disabled", () => {
    test("should allow starting chat regardless of existing results", async ({
      page,
    }) => {
      const typebotId = createId();

      await createTypebots([
        {
          id: typebotId,
          settings: {
            general: {
              chatLimits: {
                isEnabled: false,
                limit: 1,
                limitType: "total",
              },
            },
          },
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.TEXT,
          }),
        },
      ]);

      // Create 5 existing results (more than the limit)
      await createResults(typebotId, 5);

      const [, response] = await Promise.all([
        page.goto(`/${typebotId}-public`),
        page.waitForResponse(/startChat/),
      ]);

      expect(response.status()).toBe(200);
      const responseData = await response.json();
      expect(responseData.sessionId).toBeDefined();
      expect(responseData.messages).toBeDefined();
    });
  });

  test.describe("when chat limits are enabled", () => {
    test.describe("total limit type", () => {
      test("should allow starting chat when under the limit", async ({
        page,
      }) => {
        const typebotId = createId();

        await createTypebots([
          {
            id: typebotId,
            settings: {
              general: {
                chatLimits: {
                  isEnabled: true,
                  limit: 10,
                  limitType: "total",
                },
              },
            },
            ...parseDefaultGroupWithBlock({
              type: InputBlockType.TEXT,
            }),
          },
        ]);

        // Create 5 existing results (under the limit)
        await createResults(typebotId, 5);

        const [, response] = await Promise.all([
          page.goto(`/${typebotId}-public`),
          page.waitForResponse(/startChat/),
        ]);

        expect(response.status()).toBe(200);
        const responseData = await response.json();
        expect(responseData.sessionId).toBeDefined();
      });

      test("should block starting chat when at the limit", async ({ page }) => {
        const typebotId = createId();

        await createTypebots([
          {
            id: typebotId,
            settings: {
              general: {
                chatLimits: {
                  isEnabled: true,
                  limit: 5,
                  limitType: "total",
                },
              },
            },
            ...parseDefaultGroupWithBlock({
              type: InputBlockType.TEXT,
            }),
          },
        ]);

        // Create exactly 5 results (at the limit)
        await createResults(typebotId, 5);

        await page.goto(`/${typebotId}-public`);
        await expect(page.locator("text=This bot is now closed")).toBeVisible();
      });

      test("should block starting chat when over the limit", async ({
        page,
      }) => {
        const typebotId = createId();

        await createTypebots([
          {
            id: typebotId,
            settings: {
              general: {
                chatLimits: {
                  isEnabled: true,
                  limit: 3,
                  limitType: "total",
                },
              },
            },
            ...parseDefaultGroupWithBlock({
              type: InputBlockType.TEXT,
            }),
          },
        ]);

        // Create 5 results (over the limit)
        await createResults(typebotId, 5);

        await page.goto(`/${typebotId}-public`);
        await expect(page.locator("text=This bot is now closed")).toBeVisible();
      });
    });

    test.describe("daily limit type", () => {
      test("should allow starting chat when under daily limit", async ({
        page,
      }) => {
        const typebotId = createId();

        await createTypebots([
          {
            id: typebotId,
            settings: {
              general: {
                chatLimits: {
                  isEnabled: true,
                  limit: 5,
                  limitType: "daily",
                },
              },
            },
            ...parseDefaultGroupWithBlock({
              type: InputBlockType.TEXT,
            }),
          },
        ]);

        // Create 3 results from today
        const today = new Date();
        today.setHours(10, 0, 0, 0);
        await createResults(typebotId, 3, today);

        // Create 10 results from yesterday (shouldn't count)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(10, 0, 0, 0);
        await createResults(typebotId, 10, yesterday);

        const [, response] = await Promise.all([
          page.goto(`/${typebotId}-public`),
          page.waitForResponse(/startChat/),
        ]);

        expect(response.status()).toBe(200);
      });

      test("should block starting chat when daily limit is reached", async ({
        page,
      }) => {
        const typebotId = createId();

        await createTypebots([
          {
            id: typebotId,
            settings: {
              general: {
                chatLimits: {
                  isEnabled: true,
                  limit: 3,
                  limitType: "daily",
                },
              },
            },
            ...parseDefaultGroupWithBlock({
              type: InputBlockType.TEXT,
            }),
          },
        ]);

        // Create 3 results from today (at the limit)
        const today = new Date();
        today.setHours(10, 0, 0, 0);
        await createResults(typebotId, 3, today);

        await page.goto(`/${typebotId}-public`);
        await expect(page.locator("text=This bot is now closed")).toBeVisible();
      });
    });

    test.describe("weekly limit type", () => {
      test("should allow starting chat when under weekly limit", async ({
        page,
      }) => {
        const typebotId = createId();

        await createTypebots([
          {
            id: typebotId,
            settings: {
              general: {
                chatLimits: {
                  isEnabled: true,
                  limit: 10,
                  limitType: "weekly",
                },
              },
            },
            ...parseDefaultGroupWithBlock({
              type: InputBlockType.TEXT,
            }),
          },
        ]);

        // Create 5 results from this week
        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay() + 1); // Monday
        thisWeek.setHours(10, 0, 0, 0);
        await createResults(typebotId, 5, thisWeek);

        // Create 15 results from last week (shouldn't count)
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - lastWeek.getDay() - 6); // Last Monday
        lastWeek.setHours(10, 0, 0, 0);
        await createResults(typebotId, 15, lastWeek);

        const [, response] = await Promise.all([
          page.goto(`/${typebotId}-public`),
          page.waitForResponse(/startChat/),
        ]);

        expect(response.status()).toBe(200);
      });

      test("should block starting chat when weekly limit is reached", async ({
        page,
      }) => {
        const typebotId = createId();

        await createTypebots([
          {
            id: typebotId,
            settings: {
              general: {
                chatLimits: {
                  isEnabled: true,
                  limit: 7,
                  limitType: "weekly",
                },
              },
            },
            ...parseDefaultGroupWithBlock({
              type: InputBlockType.TEXT,
            }),
          },
        ]);

        // Create 7 results from this week (at the limit)
        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay() + 1); // Monday
        thisWeek.setHours(10, 0, 0, 0);
        await createResults(typebotId, 7, thisWeek);

        await page.goto(`/${typebotId}-public`);
        await expect(page.locator("text=This bot is now closed")).toBeVisible();
      });
    });

    test.describe("monthly limit type", () => {
      test("should allow starting chat when under monthly limit", async ({
        page,
      }) => {
        const typebotId = createId();

        await createTypebots([
          {
            id: typebotId,
            settings: {
              general: {
                chatLimits: {
                  isEnabled: true,
                  limit: 100,
                  limitType: "monthly",
                },
              },
            },
            ...parseDefaultGroupWithBlock({
              type: InputBlockType.TEXT,
            }),
          },
        ]);

        // Create 50 results from this month
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(10, 0, 0, 0);
        await createResults(typebotId, 50, thisMonth);

        // Create 200 results from last month (shouldn't count)
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        lastMonth.setDate(1);
        lastMonth.setHours(10, 0, 0, 0);
        await createResults(typebotId, 200, lastMonth);

        const [, response] = await Promise.all([
          page.goto(`/${typebotId}-public`),
          page.waitForResponse(/startChat/),
        ]);

        expect(response.status()).toBe(200);
      });

      test("should block starting chat when monthly limit is reached", async ({
        page,
      }) => {
        const typebotId = createId();

        await createTypebots([
          {
            id: typebotId,
            settings: {
              general: {
                chatLimits: {
                  isEnabled: true,
                  limit: 30,
                  limitType: "monthly",
                },
              },
            },
            ...parseDefaultGroupWithBlock({
              type: InputBlockType.TEXT,
            }),
          },
        ]);

        // Create 30 results from this month (at the limit)
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(10, 0, 0, 0);
        await createResults(typebotId, 30, thisMonth);

        await page.goto(`/${typebotId}-public`);
        await expect(page.locator("text=This bot is now closed")).toBeVisible();
      });
    });

    test.describe("edge cases", () => {
      test("should allow starting chat when limit is not set", async ({
        page,
      }) => {
        const typebotId = createId();

        await createTypebots([
          {
            id: typebotId,
            settings: {
              general: {
                chatLimits: {
                  isEnabled: true,
                  limitType: "total",
                  // limit is undefined
                },
              },
            },
            ...parseDefaultGroupWithBlock({
              type: InputBlockType.TEXT,
            }),
          },
        ]);

        await createResults(typebotId, 100);

        const [, response] = await Promise.all([
          page.goto(`/${typebotId}-public`),
          page.waitForResponse(/startChat/),
        ]);

        expect(response.status()).toBe(200);
      });

      test("should allow starting chat when limit is 0", async ({ page }) => {
        const typebotId = createId();

        await createTypebots([
          {
            id: typebotId,
            settings: {
              general: {
                chatLimits: {
                  isEnabled: true,
                  limit: 0,
                  limitType: "total",
                },
              },
            },
            ...parseDefaultGroupWithBlock({
              type: InputBlockType.TEXT,
            }),
          },
        ]);

        const [, response] = await Promise.all([
          page.goto(`/${typebotId}-public`),
          page.waitForResponse(/startChat/),
        ]);

        expect(response.status()).toBe(200);
      });

      test("should handle archived results correctly", async ({ page }) => {
        const typebotId = createId();

        await createTypebots([
          {
            id: typebotId,
            settings: {
              general: {
                chatLimits: {
                  isEnabled: true,
                  limit: 5,
                  limitType: "total",
                },
              },
            },
            ...parseDefaultGroupWithBlock({
              type: InputBlockType.TEXT,
            }),
          },
        ]);

        // Create 3 non-archived results
        await createResults(typebotId, 3);

        // Create 10 archived results (should not count)
        const archivedResults = Array.from({ length: 10 }, (_, i) => ({
          id: createId(),
          typebotId,
          variables: [],
          isArchived: true, // These are archived
          hasStarted: true,
          isCompleted: false,
          createdAt: new Date(),
        }));

        await prisma.result.createMany({
          data: archivedResults,
        });

        const [, response] = await Promise.all([
          page.goto(`/${typebotId}-public`),
          page.waitForResponse(/startChat/),
        ]);

        expect(response.status()).toBe(200);
      });

      test("should use custom bot closed message when provided", async ({
        page,
      }) => {
        const typebotId = createId();
        const customMessage = "Custom bot closed message";

        await createTypebots([
          {
            id: typebotId,
            settings: {
              general: {
                chatLimits: {
                  isEnabled: true,
                  limit: 1,
                  limitType: "total",
                },
                systemMessages: {
                  botClosed: customMessage,
                },
              },
            },
            ...parseDefaultGroupWithBlock({
              type: InputBlockType.TEXT,
            }),
          },
        ]);

        // Create 1 result to reach the limit
        await createResults(typebotId, 1);

        await page.goto(`/${typebotId}-public`);
        await expect(page.locator(`text=${customMessage}`)).toBeVisible();
      });
    });
  });
});
