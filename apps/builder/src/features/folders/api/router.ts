import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { folderSchema } from "@typebot.io/schemas/features/folder";
import { z } from "zod";
import {
  createFolderInputSchema,
  handleCreateFolder,
} from "./handleCreateFolder";
import {
  deleteFolderInputSchema,
  handleDeleteFolder,
} from "./handleDeleteFolder";
import { getFolderInputSchema, handleGetFolder } from "./handleGetFolder";
import { handleListFolders, listFoldersInputSchema } from "./handleListFolders";
import {
  handleUpdateFolder,
  updateFolderInputSchema,
} from "./handleUpdateFolder";

export const folderRouter = {
  getFolder: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/folders/{folderId}",
      summary: "Get folder",
      tags: ["Folder"],
    })
    .input(getFolderInputSchema)
    .output(
      z.object({
        folder: folderSchema,
      }),
    )
    .handler(handleGetFolder),

  createFolder: authenticatedProcedure
    .route({
      method: "POST",
      path: "/v1/folders",
      summary: "Create a folder",
      tags: ["Folder"],
    })
    .input(createFolderInputSchema)
    .output(
      z.object({
        folder: folderSchema,
      }),
    )
    .handler(handleCreateFolder),

  updateFolder: authenticatedProcedure
    .route({
      method: "PATCH",
      path: "/v1/folders/{folderId}",
      summary: "Update a folder",
      tags: ["Folder"],
    })
    .input(updateFolderInputSchema)
    .output(
      z.object({
        folder: folderSchema,
      }),
    )
    .handler(handleUpdateFolder),

  deleteFolder: authenticatedProcedure
    .route({
      method: "DELETE",
      path: "/v1/folders/{folderId}",
      summary: "Delete a folder",
      tags: ["Folder"],
    })
    .input(deleteFolderInputSchema)
    .output(
      z.object({
        folder: folderSchema,
      }),
    )
    .handler(handleDeleteFolder),

  listFolders: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/folders",
      summary: "List folders",
      tags: ["Folder"],
    })
    .input(listFoldersInputSchema)
    .output(
      z.object({
        folders: z.array(folderSchema),
      }),
    )
    .handler(handleListFolders),
};
