import { refreshSessionUser } from "@/features/auth/helpers/refreshSessionUser";
import { toast } from "@/lib/toast";
import { trpc } from "@/lib/trpc";

export const useAcceptTermsMutation = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) =>
  trpc.userInternal.acceptTerms.useMutation({
    onError: (error) => {
      toast({ description: error.message });
    },
    onSettled: () => {
      refreshSessionUser();
    },
    onSuccess,
  });
