import { useMutation } from "@tanstack/react-query";
import { refreshSessionUser } from "@typebot.io/auth/helpers/refreshSessionUser";
import { orpc } from "@/lib/queryClient";

export const useUpdateUserMutation = () =>
  useMutation(
    orpc.user.update.mutationOptions({
      onSettled: () => {
        refreshSessionUser();
      },
    }),
  );
