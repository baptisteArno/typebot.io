import { router } from "@/helpers/server/trpc";
import { getAccessToken } from "./getAccessToken";
import { getSpreadsheetName } from "./getSpreadsheetName";

export const googleSheetsRouter = router({
  getAccessToken,
  getSpreadsheetName,
});
