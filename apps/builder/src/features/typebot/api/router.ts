import { router } from "@/helpers/server/trpc";
import { createTypebot } from "./createTypebot";
import { deleteTypebot } from "./deleteTypebot";
import { getPublishedTypebot } from "./getPublishedTypebot";
import { getTypebot } from "./getTypebot";
import { importTypebot } from "./importTypebot";
import { listTypebots } from "./listTypebots";
import { publishTypebot } from "./publishTypebot";
import { unpublishTypebot } from "./unpublishTypebot";
import { updateTypebot } from "./updateTypebot";

export const typebotRouter = router({
  createTypebot,
  updateTypebot,
  getTypebot,
  getPublishedTypebot,
  publishTypebot,
  unpublishTypebot,
  listTypebots,
  deleteTypebot,
  importTypebot,
});
