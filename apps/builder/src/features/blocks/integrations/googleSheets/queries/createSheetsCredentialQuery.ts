import { sendRequest } from "@typebot.io/lib/utils";
import { stringify } from "qs";

export const createSheetsCredentialQuery = async (code: string) => {
  const queryParams = stringify({ code });
  return sendRequest({
    url: `/api/credentials/google-sheets/callback?${queryParams}`,
    method: "GET",
  });
};
