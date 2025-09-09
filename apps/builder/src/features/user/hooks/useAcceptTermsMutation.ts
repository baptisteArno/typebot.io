import { useMutation } from "@tanstack/react-query";
import { refreshSessionUser } from "@/features/auth/helpers/refreshSessionUser";
import { trpc } from "@/lib/queryClient";

export const useAcceptTermsMutation = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) =>
  useMutation(
    trpc.userInternal.acceptTerms.mutationOptions({
      onSettled: () => {
        refreshSessionUser();
      },
      onSuccess,
    }),
  );
