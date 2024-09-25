import type { Page } from "@playwright/test";

export const mockSessionResponsesToOtherUser = async (page: Page) =>
  page.route("/api/auth/session", (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({
        status: 200,
        body: '{"user":{"id":"otherUserId","name":"James Doe","email":"other-user@email.com","emailVerified":null,"image":"https://avatars.githubusercontent.com/u/16015833?v=4","stripeId":null,"graphNavigation": "TRACKPAD"}}',
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
