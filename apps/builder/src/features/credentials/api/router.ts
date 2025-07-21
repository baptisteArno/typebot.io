import { router } from "@/helpers/server/trpc";
import { createCredentials } from "./createCredentials";
import { createOAuthCredentials } from "./createOAuthCredentials";
import { deleteCredentials } from "./deleteCredentials";
import { getCredentials } from "./getCredentials";
import { listCredentials } from "./listCredentials";
import { updateCredentials } from "./updateCredentials";
import { updateOAuthCredentials } from "./updateOAuthCredentials";

export const credentialsRouter = router({
  createCredentials,
  createOAuthCredentials,
  updateOAuthCredentials,
  listCredentials,
  getCredentials,
  deleteCredentials,
  updateCredentials,
});
