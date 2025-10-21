import type { Prisma } from "@typebot.io/prisma/types";
import useSWR from "swr";
import { fetcher } from "@/helpers/fetcher";

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
    dedupingInterval: undefined,
  });
  if (error) onError(error);
  return {
    invitations: data?.invitations,
    isLoading: !error && !data,
    mutate,
  };
};
