import { router } from "@/helpers/server/trpc";
import { createFolder } from "./createFolder";
import { deleteFolder } from "./deleteFolder";
import { getFolder } from "./getFolder";
import { listFolders } from "./listFolders";
import { updateFolder } from "./updateFolder";

export const folderRouter = router({
  getFolder,
  createFolder,
  updateFolder,
  deleteFolder,
  listFolders,
});
