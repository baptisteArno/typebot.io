import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { collaboratorSchema } from "@typebot.io/schemas/features/collaborators";
import { z } from "zod";
import {
  createInvitationInputSchema,
  handleCreateInvitation,
} from "./handleCreateInvitation";
import {
  deleteCollaboratorInputSchema,
  handleDeleteCollaborator,
} from "./handleDeleteCollaborator";
import {
  deleteInvitationInputSchema,
  handleDeleteInvitation,
} from "./handleDeleteInvitation";
import {
  getCollaboratorsInputSchema,
  handleGetCollaborators,
} from "./handleGetCollaborators";
import {
  handleListInvitations,
  listInvitationsInputSchema,
} from "./handleListInvitations";
import {
  handleUpdateCollaborator,
  updateCollaboratorInputSchema,
} from "./handleUpdateCollaborator";
import {
  handleUpdateInvitation,
  updateInvitationInputSchema,
} from "./handleUpdateInvitation";

const collaboratorWithUserSchema = collaboratorSchema.extend({
  user: z.object({
    name: z.string().nullable(),
    image: z.string().nullable(),
    email: z.string().nullable(),
  }),
});

export const collaboratorsRouter = {
  getCollaborators: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/typebots/{typebotId}/collaborators",
      summary: "Get collaborators",
      tags: ["Collaborators"],
    })
    .input(getCollaboratorsInputSchema)
    .output(
      z.object({
        collaborators: z.array(collaboratorWithUserSchema),
      }),
    )
    .handler(handleGetCollaborators),
  updateCollaborator: authenticatedProcedure
    .input(updateCollaboratorInputSchema)
    .handler(handleUpdateCollaborator),

  deleteCollaborator: authenticatedProcedure
    .input(deleteCollaboratorInputSchema)
    .handler(handleDeleteCollaborator),

  listInvitations: authenticatedProcedure
    .input(listInvitationsInputSchema)
    .handler(handleListInvitations),

  createInvitation: authenticatedProcedure
    .input(createInvitationInputSchema)
    .handler(handleCreateInvitation),

  updateInvitation: authenticatedProcedure
    .input(updateInvitationInputSchema)
    .handler(handleUpdateInvitation),

  deleteInvitation: authenticatedProcedure
    .input(deleteInvitationInputSchema)
    .handler(handleDeleteInvitation),
};
