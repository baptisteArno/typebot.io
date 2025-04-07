import { trpc } from "@/lib/trpc";

export const useFeatureFlags = () => {
  const { data } = trpc.getFeatureFlags.useQuery();

  return data?.flags;
};
