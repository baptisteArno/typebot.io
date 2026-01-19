import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { z } from "zod";
import {
  getAccessTokenInputSchema,
  handleGetAccessToken,
} from "./handleGetAccessToken";
import {
  getConsentUrlInputSchema,
  handleGetConsentUrl,
} from "./handleGetConsentUrl";
import { getSheetsInputSchema, handleGetSheets } from "./handleGetSheets";
import {
  getSpreadsheetNameInputSchema,
  handleGetSpreadsheetName,
} from "./handleGetSpreadsheetName";
import {
  handleCallbackInputSchema,
  handleHandleCallback,
} from "./handleHandleCallback";

export const googleSheetsRouter = {
  getAccessToken: authenticatedProcedure
    .input(getAccessTokenInputSchema)
    .handler(handleGetAccessToken),

  getSpreadsheetName: authenticatedProcedure
    .input(getSpreadsheetNameInputSchema)
    .handler(handleGetSpreadsheetName),

  getConsentUrl: authenticatedProcedure
    .route({
      method: "GET",
      path: "/credentials/google-sheets/consent-url",
      successStatus: 301,
      outputStructure: "detailed",
    })
    .input(getConsentUrlInputSchema)
    .output(
      z.object({
        headers: z.object({
          location: z.string(),
        }),
      }),
    )
    .handler(handleGetConsentUrl),

  handleCallback: authenticatedProcedure
    .route({
      method: "GET",
      path: "/credentials/google-sheets/callback",
      successStatus: 302,
      outputStructure: "detailed",
    })
    .input(handleCallbackInputSchema)
    .output(
      z.object({
        headers: z.object({
          location: z.string(),
        }),
      }),
    )
    .handler(handleHandleCallback),

  getSheets: authenticatedProcedure
    .input(getSheetsInputSchema)
    .handler(handleGetSheets),
};
