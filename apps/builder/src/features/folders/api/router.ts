import { createFolder } from "./createFolder";
import { deleteFolder } from "./deleteFolder";
import { getFolder } from "./getFolder";
import { listFolders } from "./listFolders";
import { updateFolder } from "./updateFolder";

export const folderRouter = {
  getFolder,
  createFolder,
  updateFolder,
  deleteFolder,
  listFolders,
};
