import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/queryClient";

export const useFeatureFlagsQuery = () => {
  const { data } = useQuery(orpc.getFeatureFlags.queryOptions());

  return data?.flags;
};
