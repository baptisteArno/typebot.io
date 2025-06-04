import { UploadButton } from "@/components/ImageUploadContent/UploadButton";
import { UploadIcon } from "@/components/icons";
import { TextInput } from "@/components/inputs/TextInput";
import { refreshSessionUser } from "@/features/auth/helpers/refreshSessionUser";
import { toast } from "@/lib/toast";
import { trpc } from "@/lib/trpc";
import {
  Avatar,
  Button,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type React from "react";
import { useState } from "react";
import { useUser } from "../hooks/useUser";
import { ApiTokensList } from "./ApiTokensList";

export const MyAccountForm = () => {
  const { t } = useTranslate();
  const { user, updateUser, updateLocalUserEmail } = useUser();
  const [name, setName] = useState(user?.name ?? "");
  const [isChangeEmailModalOpen, setIsChangeEmailModalOpen] = useState(false);

  const handleFileUploaded = async (url: string) => {
    updateUser({ image: url });
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    updateUser({ name: newName });
  };

  return (
    <Stack spacing="6" w="full" overflowY="auto">
      <HStack spacing={6}>
        <Avatar
          size="lg"
          src={user?.image ?? undefined}
          name={user?.name ?? undefined}
        />
        <Stack>
          {user?.id && (
            <UploadButton
              size="sm"
              fileType="image"
              filePathProps={{
                userId: user.id,
                fileName: "avatar",
              }}
              leftIcon={<UploadIcon />}
              onFileUploaded={handleFileUploaded}
            >
              {t("account.myAccount.changePhotoButton.label")}
            </UploadButton>
          )}
          <Text color="gray.500" fontSize="sm">
            {t("account.myAccount.changePhotoButton.specification")}
          </Text>
        </Stack>
      </HStack>

      <TextInput
        defaultValue={name}
        onChange={handleNameChange}
        label={t("account.myAccount.nameInput.label")}
        withVariableButton={false}
        debounceTimeout={0}
      />
      {user && (
        <HStack justifyContent="space-between">
          <Stack>
            <Text>{t("account.myAccount.emailInput.label")}</Text>
            <Text size="sm" color="gray.500">
              {user?.email}
            </Text>
          </Stack>
          <Button onClick={() => setIsChangeEmailModalOpen(true)}>
            Change email
          </Button>
          <ChangeEmailModal
            isOpen={isChangeEmailModalOpen}
            onClose={(newEmail) => {
              setIsChangeEmailModalOpen(false);
              if (newEmail) updateLocalUserEmail(newEmail);
            }}
            userEmail={user?.email ?? ""}
          />
        </HStack>
      )}
      {user && <ApiTokensList user={user} />}
    </Stack>
  );
};

const ChangeEmailModal = ({
  isOpen,
  onClose,
  userEmail,
}: {
  isOpen: boolean;
  onClose: (newEmail?: string) => void;
  userEmail: string;
}) => {
  const { mutate: sendUpdateEmailVerifCodeEmail } =
    trpc.auth.sendUpdateEmailVerifCodeEmail.useMutation({
      onError: (error) => {
        toast({
          description: error.message,
        });
        setVerificationCodeStatus(undefined);
      },
      onSuccess: () => {
        setVerificationCodeStatus("sent");
      },
    });
  const { mutate: updateUserEmail } = trpc.auth.updateUserEmail.useMutation({
    onSettled: () => {
      setIsUpdatingEmail(false);
    },
    onError: (error) => {
      toast({
        description: error.message,
      });
    },
    onSuccess: () => {
      refreshSessionUser();
      onClose(newEmail);
    },
  });
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationCodeStatus, setVerificationCodeStatus] = useState<
    "sending" | "sent"
  >();
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const sendVerificationCode = (e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    setVerificationCodeStatus("sending");
    sendUpdateEmailVerifCodeEmail({
      newEmail,
    });
  };

  const updateEmailAndClose = (e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsUpdatingEmail(true);
    updateUserEmail({
      token: verificationCode,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setNewEmail("");
        setVerificationCode("");
        setVerificationCodeStatus(undefined);
        setIsUpdatingEmail(false);
        onClose();
      }}
      isCentered
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalBody py={6} gap={4} as={Stack}>
          <Text>
            Your current email is:{" "}
            <Text as="span" fontWeight="bold">
              {userEmail}
            </Text>
          </Text>
          <Stack as="form" onSubmit={sendVerificationCode}>
            <Text>
              Please enter a new email and we will send you a verification code.
            </Text>
            <Input
              type="email"
              isDisabled={verificationCodeStatus === "sent"}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email"
            />
            {verificationCodeStatus !== "sent" && (
              <Button
                type="submit"
                colorScheme="orange"
                isDisabled={newEmail.length === 0}
                isLoading={verificationCodeStatus === "sending"}
              >
                Send verification code
              </Button>
            )}
          </Stack>
          {verificationCodeStatus === "sent" && (
            <Stack as="form" onSubmit={updateEmailAndClose}>
              <Text>
                We just sent a temporary verification code to{" "}
                <Text as="span" fontWeight="bold">
                  {newEmail}
                </Text>
                .
              </Text>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter verification code"
              />
              <Button
                type="submit"
                colorScheme="orange"
                isDisabled={verificationCode.length === 0}
                isLoading={isUpdatingEmail}
              >
                Change email
              </Button>
            </Stack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
