import { orpcClient } from "@/lib/queryClient";

export const isPublicDomainAvailableQuery = (publicId: string) =>
  orpcClient.typebot.isPublicIdAvailable({ publicId });
