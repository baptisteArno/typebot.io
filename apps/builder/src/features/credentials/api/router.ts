import { router } from "@/helpers/server/trpc";
import { createCredentials } from "./createCredentials";
import { deleteCredentials } from "./deleteCredentials";
import { getCredentials } from "./getCredentials";
import { listCredentials } from "./listCredentials";
import { updateCredentials } from "./updateCredentials";

export const credentialsRouter = router({
  createCredentials,
  listCredentials,
  getCredentials,
  deleteCredentials,
  updateCredentials,
});
