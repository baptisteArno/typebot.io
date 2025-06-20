import { refreshSessionUser } from "@/features/auth/helpers/refreshSessionUser";
import { trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";

import { useMutation } from "@tanstack/react-query";

export const useUpdateUserMutation = () =>
  useMutation(
    trpc.user.update.mutationOptions({
      onError: (error) => {
        toast({ description: error.message });
      },
      onSettled: () => {
        refreshSessionUser();
      },
    }),
  );
