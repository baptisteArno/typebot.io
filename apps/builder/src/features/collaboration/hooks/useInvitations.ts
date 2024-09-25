import { fetcher } from "@/helpers/fetcher";
import { env } from "@typebot.io/env";
import type { Prisma } from "@typebot.io/prisma/types";
import useSWR from "swr";

export const useInvitations = ({
  typebotId,
  onError,
}: {
  typebotId?: string;
  onError: (error: Error) => void;
}) => {
  const { data, error, mutate } = useSWR<
    { invitations: Prisma.Invitation[] },
    Error
  >(typebotId ? `/api/typebots/${typebotId}/invitations` : null, fetcher, {
    dedupingInterval: env.NEXT_PUBLIC_E2E_TEST ? 0 : undefined,
  });
  if (error) onError(error);
  return {
    invitations: data?.invitations,
    isLoading: !error && !data,
    mutate,
  };
};
