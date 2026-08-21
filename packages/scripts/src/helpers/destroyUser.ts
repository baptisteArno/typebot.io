import { writeFileSync } from "node:fs";
import {
  removeObjectsFromUser,
  removeObjectsFromWorkspace,
} from "@typebot.io/lib/s3/removeObjectsRecursively";
import prisma from "@typebot.io/prisma";
import { confirmAction, getRequiredInput } from "../cli";
import {
  type DestroyUserDependencies,
  destroyUserWithDependencies,
} from "./destroyUserWithDependencies";

export const destroyUser = async (userEmail?: string) =>
  destroyUserWithDependencies(
    userEmail ??
      (await getRequiredInput({
        message: "User email?",
        name: "email",
      })),
    productionDependencies,
  );

const productionDependencies: DestroyUserDependencies = {
  confirm: (message) => confirmAction({ message }),
  deleteResults: (ids) =>
    prisma.result.deleteMany({ where: { id: { in: [...ids] } } }),
  deleteUserByEmail: (email) => prisma.user.delete({ where: { email } }),
  deleteUserById: async (id) => {
    await prisma.user.delete({ where: { id } });
  },
  deleteWorkspace: async (id) => {
    await prisma.workspace.delete({ where: { id } });
  },
  findUser: (email) =>
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
  findWorkspaces: (email) =>
    prisma.workspace.findMany({
      where: {
        members: { some: { user: { email } } },
      },
      include: {
        members: {
          select: { user: { select: { email: true } }, role: true },
        },
        typebots: {
          select: {
            results: {
              select: { id: true },
            },
          },
        },
      },
    }),
  removeObjectsFromUser,
  removeObjectsFromWorkspace,
  writeWorkspacesIssue: (contents) =>
    writeFileSync("logs/workspaces-issue.json", contents),
};
