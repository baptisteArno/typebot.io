import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { ButtonLink, type ButtonLinkProps } from "@/components/ButtonLink";
import { orpc } from "@/lib/queryClient";

type Props = {
  workspaceId: string;
} & Pick<ButtonLinkProps, "variant">;

export const BillingPortalButton = ({ workspaceId, variant }: Props) => {
  const { t } = useTranslate();
  const { data } = useQuery(
    orpc.billing.getBillingPortalUrl.queryOptions({
      input: {
        workspaceId,
      },
      meta: {
        errorContext: "Error getting billing portal url",
      },
    }),
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
