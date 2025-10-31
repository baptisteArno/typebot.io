import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { Input } from "@typebot.io/ui/components/Input";
import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { CopyInput } from "@/components/inputs/CopyInput";
import { trpc } from "@/lib/queryClient";

type Props = {
  isOpen: boolean;
  onNewToken: () => void;
  onClose: () => void;
};

const ANIMATION_DURATION = 150;

export const CreateApiTokenDialog = ({
  isOpen,
  onClose,
  onNewToken,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslate();
  const [name, setName] = useState("");
  const [newTokenValue, setNewTokenValue] = useState<string>();

  const { mutate: createToken, isPending: isSubmitting } = useMutation(
    trpc.user.createApiToken.mutationOptions({
      onSuccess: (data) => {
        setNewTokenValue(data.apiToken.token);
        onNewToken();
      },
    }),
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createToken({ name });
  };

  const handleClose = () => {
    setTimeout(() => {
      setNewTokenValue(undefined);
      setName("");
    }, ANIMATION_DURATION);
    onClose();
  };

  return (
    <Dialog.Root isOpen={isOpen} onClose={handleClose}>
      <Dialog.Popup
        render={<form onSubmit={handleSubmit} />}
        initialFocus={inputRef}
      >
        <Dialog.Title>
          {newTokenValue
            ? t("account.apiTokens.createModal.createdHeading")
            : t("account.apiTokens.createModal.createHeading")}
        </Dialog.Title>
        <Dialog.CloseButton />
        {newTokenValue ? (
          <>
            <p>
              {t("account.apiTokens.createModal.copyInstruction")}{" "}
              <strong>
                {t("account.apiTokens.createModal.securityWarning")}
              </strong>
            </p>
            <CopyInput value={newTokenValue} />
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <p>{t("account.apiTokens.createModal.nameInput.label")}</p>
            <Input
              ref={inputRef}
              placeholder={t(
                "account.apiTokens.createModal.nameInput.placeholder",
              )}
              onValueChange={setName}
            />
          </div>
        )}

        <Dialog.Footer>
          {newTokenValue ? null : (
            <Button
              disabled={name.length === 0 || isSubmitting}
              onClick={handleSubmit}
              type="submit"
            >
              {t("account.apiTokens.createModal.createButton.label")}
            </Button>
          )}
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
