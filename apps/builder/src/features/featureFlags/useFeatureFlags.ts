import { trpc } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export const useFeatureFlags = () => {
  const { data } = useQuery(trpc.getFeatureFlags.queryOptions());

  return data?.flags;
};
