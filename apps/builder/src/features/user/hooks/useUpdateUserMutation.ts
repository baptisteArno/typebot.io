import { refreshSessionUser } from "@/features/auth/helpers/refreshSessionUser";
import { toast } from "@/lib/toast";
import { trpc } from "@/lib/trpc";

export const useUpdateUserMutation = () =>
  trpc.user.update.useMutation({
    onError: (error) => {
      toast({ description: error.message });
    },
    onSettled: () => {
      refreshSessionUser();
    },
  });
