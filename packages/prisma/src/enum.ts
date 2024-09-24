import {
  CollaborationType,
  GraphNavigation,
  Plan,
  Prisma,
  WorkspaceRole,
} from "@prisma/client";

const JsonNull = Prisma.JsonNull;
const DbNull = Prisma.DbNull;

export {
  WorkspaceRole,
  Plan,
  CollaborationType,
  GraphNavigation,
  JsonNull,
  DbNull,
};
