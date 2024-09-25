import { fetcher } from "@/helpers/fetcher";
import useSWR from "swr";
import type { Collaborator } from "../types";

export const useCollaborators = ({
  typebotId,
  onError,
}: {
  typebotId?: string;
  onError: (error: Error) => void;
}) => {
  const { data, error, mutate } = useSWR<
    { collaborators: Collaborator[] },
    Error
  >(typebotId ? `/api/typebots/${typebotId}/collaborators` : null, fetcher);
  if (error) onError(error);
  return {
    collaborators: data?.collaborators,
    isLoading: !error && !data,
    mutate,
  };
};
