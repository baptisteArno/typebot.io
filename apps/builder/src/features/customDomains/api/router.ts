import { createCustomDomain } from "./createCustomDomain";
import { deleteCustomDomain } from "./deleteCustomDomain";
import { listCustomDomains } from "./listCustomDomains";
import { verifyCustomDomain } from "./verifyCustomDomain";

export const customDomainsRouter = {
  createCustomDomain,
  deleteCustomDomain,
  listCustomDomains,
  verifyCustomDomain,
};
