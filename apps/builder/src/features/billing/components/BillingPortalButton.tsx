import { ButtonLink, type ButtonLinkProps } from "@/components/ButtonLink";
import { trpc } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";

type Props = {
  workspaceId: string;
} & Pick<ButtonLinkProps, "variant">;

export const BillingPortalButton = ({ workspaceId, variant }: Props) => {
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
    <ButtonLink
      href={data?.billingPortalUrl}
      disabled={!data}
      variant={variant}
    >
      {t("billing.billingPortalButton.label")}
    </ButtonLink>
  );
};
