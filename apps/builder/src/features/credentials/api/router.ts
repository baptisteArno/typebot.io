import { authorizeOAuth } from "./authorizeOAuth";
import { createCredentials } from "./createCredentials";
import { createOAuthCredentials } from "./createOAuthCredentials";
import { deleteCredentials } from "./deleteCredentials";
import { getCredentials } from "./getCredentials";
import { listCredentials } from "./listCredentials";
import { updateCredentials } from "./updateCredentials";
import { updateOAuthCredentials } from "./updateOAuthCredentials";

export const credentialsRouter = {
  createCredentials,
  createOAuthCredentials,
  updateOAuthCredentials,
  authorizeOAuth,
  listCredentials,
  getCredentials,
  deleteCredentials,
  updateCredentials,
};
