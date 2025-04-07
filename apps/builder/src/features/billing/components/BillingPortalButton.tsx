import { toast } from "@/lib/toast";
import { trpc } from "@/lib/trpc";
import { Button, type ButtonProps, Link } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";

type Props = {
  workspaceId: string;
} & Pick<ButtonProps, "colorScheme">;

export const BillingPortalButton = ({ workspaceId, colorScheme }: Props) => {
  const { t } = useTranslate();
  const { data } = trpc.billing.getBillingPortalUrl.useQuery(
    {
      workspaceId,
    },
    {
      onError: (error) => {
        toast({
          description: error.message,
        });
      },
    },
  );
  return (
    <Button
      as={Link}
      href={data?.billingPortalUrl}
      isLoading={!data}
      colorScheme={colorScheme}
    >
      {t("billing.billingPortalButton.label")}
    </Button>
  );
};
