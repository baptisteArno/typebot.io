import {
  ChatProvider,
  CollaborationType,
  GraphNavigation,
  Plan,
  Prisma,
  WorkspaceRole,
} from "@prisma/client";

const JsonNull = Prisma.JsonNull;
const DbNull = Prisma.DbNull;

const PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;

export {
  ChatProvider,
  CollaborationType,
  DbNull,
  GraphNavigation,
  JsonNull,
  Plan,
  PrismaClientKnownRequestError,
  WorkspaceRole,
};
