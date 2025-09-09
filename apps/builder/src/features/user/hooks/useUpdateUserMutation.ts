import { useMutation } from "@tanstack/react-query";
import { refreshSessionUser } from "@/features/auth/helpers/refreshSessionUser";
import { trpc } from "@/lib/queryClient";

export const useUpdateUserMutation = () =>
  useMutation(
    trpc.user.update.mutationOptions({
      onSettled: () => {
        refreshSessionUser();
      },
    }),
  );
