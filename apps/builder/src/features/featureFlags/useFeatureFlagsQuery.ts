import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/queryClient";

export const useFeatureFlagsQuery = () => {
  const { data } = useQuery(trpc.getFeatureFlags.queryOptions());

  return data?.flags;
};
