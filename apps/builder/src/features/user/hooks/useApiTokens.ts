import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/queryClient";

export const useApiTokens = ({
  onError,
}: {
  onError: (error: { message: string }) => void;
}) => {
  const { data, error, refetch } = useQuery(
    orpc.user.listApiTokens.queryOptions(),
  );
  if (error) onError(error);
  return {
    apiTokens: data?.apiTokens,
    isLoading: !error && !data,
    refetch,
  };
};
