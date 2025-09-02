import { refreshSessionUser } from "@/features/auth/helpers/refreshSessionUser";
import { trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";

import { useMutation } from "@tanstack/react-query";

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
