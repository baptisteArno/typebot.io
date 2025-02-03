import { fetcher } from "@/helpers/fetcher";
import { env } from "@typebot.io/env";
import useSWR from "swr";
import type { ApiTokenFromServer } from "../types";

type ServerResponse = {
  apiTokens: ApiTokenFromServer[];
};

export const useApiTokens = ({
  userId,
  onError,
}: {
  userId?: string;
  onError: (error: Error) => void;
}) => {
  const { data, error, mutate } = useSWR<ServerResponse, Error>(
    userId ? `/api/users/${userId}/api-tokens` : null,
    fetcher,
    {
      dedupingInterval: env.NEXT_PUBLIC_E2E_TEST ? 0 : undefined,
    },
  );
  if (error) onError(error);
  return {
    apiTokens: data?.apiTokens,
    isLoading: !error && !data,
    mutate,
  };
};
