import { useMutation } from "@tanstack/react-query";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { Input } from "@typebot.io/ui/components/Input";
import { useRef, useState } from "react";
import { refreshSessionUser } from "@/features/auth/helpers/refreshSessionUser";
import { showHttpRequestErrorToast, trpc } from "@/lib/queryClient";

type Props = {
  isOpen: boolean;
  onClose: (newEmail?: string) => void;
  userEmail: string;
};

export const ChangeEmailDialog = ({ isOpen, onClose, userEmail }: Props) => {
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const { mutate: sendUpdateEmailVerifCodeEmail } = useMutation(
    trpc.auth.sendUpdateEmailVerifCodeEmail.mutationOptions({
      onError: (error) => {
        showHttpRequestErrorToast(error, {
          context: "While sending verification code",
        });
        setVerificationCodeStatus(undefined);
      },
      onSuccess: () => {
        setVerificationCodeStatus("sent");
      },
    }),
  );
  const { mutate: updateUserEmail } = useMutation(
    trpc.auth.updateUserEmail.mutationOptions({
      onSettled: () => {
        setIsUpdatingEmail(false);
      },
      onSuccess: () => {
        refreshSessionUser();
        onClose(newEmail);
      },
    }),
  );
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationCodeStatus, setVerificationCodeStatus] = useState<
    "sending" | "sent"
  >();
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const sendVerificationCode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVerificationCodeStatus("sending");
    sendUpdateEmailVerifCodeEmail({
      newEmail,
    });
  };

  const updateEmailAndClose = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdatingEmail(true);
    updateUserEmail({
      token: verificationCode,
    });
  };

  return (
    <Dialog.Root
      isOpen={isOpen}
      onClose={() => {
        setNewEmail("");
        setVerificationCode("");
        setVerificationCodeStatus(undefined);
        setIsUpdatingEmail(false);
        onClose();
      }}
    >
      <Dialog.Popup initialFocus={initialFocusRef}>
        <Dialog.CloseButton />
        <p>
          Your current email is: <span className="font-bold">{userEmail}</span>
        </p>
        <form className="flex flex-col gap-4" onSubmit={sendVerificationCode}>
          <p>
            Please enter a new email and we will send you a verification code.
          </p>
          <Input
            type="email"
            disabled={verificationCodeStatus === "sent"}
            value={newEmail}
            onValueChange={setNewEmail}
            placeholder="Enter new email"
            ref={initialFocusRef}
          />
          {verificationCodeStatus !== "sent" && (
            <Dialog.Footer>
              <Button
                type="submit"
                disabled={
                  newEmail.length === 0 || verificationCodeStatus === "sending"
                }
              >
                Send verification code
              </Button>
            </Dialog.Footer>
          )}
        </form>
        {verificationCodeStatus === "sent" && (
          <form className="flex flex-col gap-4" onSubmit={updateEmailAndClose}>
            <p>
              We just sent a temporary verification code to{" "}
              <span className="font-bold">{newEmail}</span>.
            </p>
            <Input
              value={verificationCode}
              onValueChange={setVerificationCode}
              placeholder="Enter verification code"
            />
            <Dialog.Footer>
              <Button
                type="submit"
                disabled={verificationCode.length === 0 || isUpdatingEmail}
              >
                Change email
              </Button>
            </Dialog.Footer>
          </form>
        )}
      </Dialog.Popup>
    </Dialog.Root>
  );
};
