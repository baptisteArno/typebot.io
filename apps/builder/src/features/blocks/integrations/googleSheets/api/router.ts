import { getAccessToken } from "./getAccessToken";
import { getConsentUrl } from "./getConsentUrl";
import { getSheets } from "./getSheets";
import { getSpreadsheetName } from "./getSpreadsheetName";
import { handleCallback } from "./handleCallback";

export const googleSheetsRouter = {
  getAccessToken,
  getSpreadsheetName,
  getConsentUrl,
  handleCallback,
  getSheets,
};
