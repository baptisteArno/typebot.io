import { createInvitation } from "./createInvitation";
import { deleteCollaborator } from "./deleteCollaborator";
import { deleteInvitation } from "./deleteInvitation";
import { getCollaborators } from "./getCollaborators";
import { listInvitations } from "./listInvitations";
import { updateCollaborator } from "./updateCollaborator";
import { updateInvitation } from "./updateInvitation";

export const collaboratorsRouter = {
  getCollaborators,
  updateCollaborator,
  deleteCollaborator,
  listInvitations,
  createInvitation,
  updateInvitation,
  deleteInvitation,
};
