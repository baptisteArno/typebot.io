import { useTranslate } from "@tolgee/react";
import { formatPrice } from "@typebot.io/billing/helpers/formatPrice";
import { AlertDialog } from "@typebot.io/ui/components/AlertDialog";
import { Button } from "@typebot.io/ui/components/Button";
import { useRef, useState } from "react";

type Props = {
  isOpen: boolean;
  targetPlan: "STARTER" | "PRO" | undefined;
  amountDue: number;
  currency: "eur" | "usd";
  onConfirm: () => Promise<unknown> | unknown;
  onClose: () => void;
};

export const UpgradeConfirmationDialog = ({
  isOpen,
  targetPlan,
  amountDue,
  currency,
  onConfirm,
  onClose,
}: Props) => {
  const { t } = useTranslate();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

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
      <AlertDialog.Content initialFocus={cancelRef}>
        <AlertDialog.Title>
          {t("billing.upgradeModal.title", { plan: targetPlan })}
        </AlertDialog.Title>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p>
              {t("billing.upgradeModal.description", {
                plan: targetPlan,
              })}
            </p>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span>{t("billing.upgradeModal.amountLabel")}:</span>
              <span>
                {formatPrice(amountDue / 100, {
                  currency,
                  maxFractionDigits: 2,
                })}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {t("billing.upgradeModal.prorationNote")}
            </p>
          </div>
        </div>
        <AlertDialog.Footer>
          <AlertDialog.Cancel variant="secondary" ref={cancelRef}>
            {t("cancel")}
          </AlertDialog.Cancel>
          <Button
            variant="default"
            onClick={onConfirmClick}
            disabled={confirmLoading}
          >
            {t("billing.upgradeModal.confirmButton")}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};
