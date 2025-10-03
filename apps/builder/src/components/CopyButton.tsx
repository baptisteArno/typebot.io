import { useTranslate } from "@tolgee/react";
import { Button, type ButtonProps } from "@typebot.io/ui/components/Button";
import { useCopyToClipboard } from "@typebot.io/ui/hooks/useCopyToClipboard";

interface CopyButtonProps extends ButtonProps {
  textToCopy: string;
  onCopied?: () => void;
  text?: {
    copy: string;
    copied: string;
  };
}

export const CopyButton = ({
  textToCopy,
  onCopied,
  text,
  ...buttonProps
}: CopyButtonProps) => {
  const { copied, copy } = useCopyToClipboard();
  const { t } = useTranslate();

  return (
    <Button
      disabled={copied}
      onClick={() => {
        copy(textToCopy);
        if (onCopied) onCopied();
      }}
      variant="secondary"
      size="xs"
      {...buttonProps}
    >
      {!copied ? (text?.copy ?? t("copy")) : (text?.copied ?? t("copied"))}
    </Button>
  );
};
