import { useMutation } from "@tanstack/react-query";
import { refreshSessionUser } from "@typebot.io/auth/helpers/refreshSessionUser";
import { orpc } from "@/lib/queryClient";

export const useAcceptTermsMutation = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) =>
  useMutation(
    orpc.userInternal.acceptTerms.mutationOptions({
      onSettled: () => {
        refreshSessionUser();
      },
      onSuccess,
    }),
  );
