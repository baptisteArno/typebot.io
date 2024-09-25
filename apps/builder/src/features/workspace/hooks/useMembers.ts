import { fetcher } from "@/helpers/fetcher";
import { env } from "@typebot.io/env";
import type { Prisma } from "@typebot.io/prisma/types";
import useSWR from "swr";
import type { Member } from "../types";

export const useMembers = ({ workspaceId }: { workspaceId?: string }) => {
  const { data, error, mutate } = useSWR<
    { members: Member[]; invitations: Prisma.WorkspaceInvitation[] },
    Error
  >(workspaceId ? `/api/workspaces/${workspaceId}/members` : null, fetcher, {
    dedupingInterval: env.NEXT_PUBLIC_E2E_TEST ? 0 : undefined,
  });
  return {
    members: data?.members ?? [],
    invitations: data?.invitations ?? [],
    isLoading: !error && !data,
    mutate,
  };
};
