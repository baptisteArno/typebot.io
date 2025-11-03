import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/queryClient";

export const useApiTokens = ({
  onError,
}: {
  onError: (error: { message: string }) => void;
}) => {
  const { data, error, refetch } = useQuery(
    trpc.user.listApiTokens.queryOptions(),
  );
  if (error) onError(error);
  return {
    apiTokens: data?.apiTokens,
    isLoading: !error && !data,
    refetch,
  };
};
