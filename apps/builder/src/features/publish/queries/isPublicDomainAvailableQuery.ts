import { sendRequest } from "@typebot.io/lib/utils";

export const isPublicDomainAvailableQuery = (publicId: string) =>
  sendRequest<{ isAvailable: boolean }>({
    method: "GET",
    url: `/api/publicIdAvailable?publicId=${publicId}`,
  });
