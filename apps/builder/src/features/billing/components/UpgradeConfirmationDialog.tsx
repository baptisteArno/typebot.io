import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { formatPrice } from "@typebot.io/billing/helpers/formatPrice";
import { isDefined } from "@typebot.io/lib/utils";
import { AlertDialog } from "@typebot.io/ui/components/AlertDialog";
import { Button } from "@typebot.io/ui/components/Button";
import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
import { useRef, useState } from "react";
import { trpc } from "@/lib/queryClient";

type Props = {
  isOpen: boolean;
  workspaceId: string;
  targetPlan: "STARTER" | "PRO" | undefined;
  onConfirm: () => Promise<unknown> | unknown;
  onClose: () => void;
};

export const UpgradeConfirmationDialog = ({
  isOpen,
  workspaceId,
  targetPlan,
  onConfirm,
  onClose,
}: Props) => {
  const { t } = useTranslate();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  const { data: preview, isLoading: isLoadingPreview } = useQuery(
    trpc.billing.getSubscriptionPreview.queryOptions(
      {
        workspaceId,
        plan: targetPlan!,
      },
      {
        enabled: isOpen && isDefined(targetPlan),
      },
    ),
  );

  const onConfirmClick = async () => {
    setConfirmLoading(true);
    try {
      await onConfirm();
    } catch (_e) {
      setConfirmLoading(false);
      return;
    }
    setConfirmLoading(false);
    onClose();
  };

  return (
    <AlertDialog.Root isOpen={isOpen} onClose={onClose}>
      <AlertDialog.Popup initialFocus={cancelRef}>
        <AlertDialog.Title>
          {t("billing.upgradeModal.title", { plan: targetPlan })}
        </AlertDialog.Title>
        <div className="flex flex-col gap-4">
          {isLoadingPreview ? (
            <div className="flex items-center gap-2">
              <LoaderCircleIcon className="animate-spin" />
              <p>{t("billing.upgradeModal.loading")}</p>
            </div>
          ) : preview ? (
            <div className="flex flex-col gap-2">
              <p>
                {t("billing.upgradeModal.description", {
                  plan: targetPlan,
                })}
              </p>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <span>{t("billing.upgradeModal.amountLabel")}:</span>
                <span>
                  {formatPrice(preview.amountDue / 100, {
                    currency: preview.currency,
                    maxFractionDigits: 2,
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {t("billing.upgradeModal.prorationNote")}
              </p>
            </div>
          ) : null}
        </div>
        <AlertDialog.Footer>
          <AlertDialog.CloseButton variant="secondary" ref={cancelRef}>
            {t("cancel")}
          </AlertDialog.CloseButton>
          <Button
            variant="default"
            onClick={onConfirmClick}
            disabled={confirmLoading || isLoadingPreview}
          >
            {t("billing.upgradeModal.confirmButton")}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog.Popup>
    </AlertDialog.Root>
  );
};
