import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import {
  CreateContactInputStandardSchema,
  handleCreateContact,
} from "./handleCreateContact";
import { getContactInputSchema, handleGetContact } from "./handleGetContact";
import {
  handleListContacts,
  listContactsInputSchema,
} from "./handleListContacts";

export const contactsRouter = {
  list: authenticatedProcedure
    .input(listContactsInputSchema)
    .handler(handleListContacts),
  create: authenticatedProcedure
    .input(CreateContactInputStandardSchema)
    .handler(handleCreateContact),
  get: authenticatedProcedure
    .input(getContactInputSchema)
    .handler(handleGetContact),
};
