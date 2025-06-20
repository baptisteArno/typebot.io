import { trpc } from "@/lib/queryClient";
import { Button, type ButtonProps, Link } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";

type Props = {
  workspaceId: string;
} & Pick<ButtonProps, "colorScheme">;

export const BillingPortalButton = ({ workspaceId, colorScheme }: Props) => {
  const { t } = useTranslate();
  const { data } = useQuery(
    trpc.billing.getBillingPortalUrl.queryOptions(
      {
        workspaceId,
      },
      {
        meta: {
          errorContext: "Error getting billing portal url",
        },
      },
    ),
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
