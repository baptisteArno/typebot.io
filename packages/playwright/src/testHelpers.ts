import type { Page } from "@playwright/test";
import { Plan } from "@typebot.io/prisma/enum";
import { proWorkspaceId } from "./databaseSetup";

export const mockWorkspaceResponse = async (page: Page) =>
  page.route(`/v1/workspaces/${proWorkspaceId}`, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          workspace: {
            id: proWorkspaceId,
            name: "Pro workspace",
            plan: Plan.PRO,
          },
          currentUserMode: "read",
        }),
      });
    }
    return route.continue();
  });

export const typebotViewer = (page: Page) =>
  page.frameLocator("#typebot-iframe");

export const waitForSuccessfulPutRequest = (page: Page) =>
  page.waitForResponse(
    (resp) => resp.request().method() === "PUT" && resp.status() === 200,
  );

export const waitForSuccessfulPostRequest = (page: Page) =>
  page.waitForResponse(
    (resp) => resp.request().method() === "POST" && resp.status() === 200,
  );

export const waitForSuccessfulDeleteRequest = (page: Page) =>
  page.waitForResponse(
    (resp) => resp.request().method() === "DELETE" && resp.status() === 200,
  );
