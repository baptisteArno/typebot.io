import { createTypebot } from "./createTypebot";
import { deleteTypebot } from "./deleteTypebot";
import { getPublishedTypebot } from "./getPublishedTypebot";
import { getTypebot } from "./getTypebot";
import { getTypebotBlocks } from "./getTypebotBlocks";
import { importTypebot } from "./importTypebot";
import { isPublicIdAvailable } from "./isPublicIdAvailable";
import { listTypebots } from "./listTypebots";
import { publishTypebot } from "./publishTypebot";
import { unpublishTypebot } from "./unpublishTypebot";
import { updateTypebot } from "./updateTypebot";

export const typebotRouter = {
  createTypebot,
  updateTypebot,
  getTypebot,
  getTypebotBlocks,
  getPublishedTypebot,
  publishTypebot,
  unpublishTypebot,
  listTypebots,
  deleteTypebot,
  importTypebot,
  isPublicIdAvailable,
};
