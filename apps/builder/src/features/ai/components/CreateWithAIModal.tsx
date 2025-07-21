import {
  BlockClarificationStep,
  BlockPreviewStep,
  ImageUploadStep,
  useAIGeneration,
} from "@/features/ai";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import {
  Circle,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Progress,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useCallback } from "react";

interface CreateWithAIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = ["Upload", "Clarification", "Preview", "Generation"];

export const CreateWithAIModal = ({
  isOpen,
  onClose,
}: CreateWithAIModalProps) => {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const {
    currentState,
    isLoading,
    handleImageUpload,
    handleClarificationChoiceChange,
    handlePreviewChoiceChange,
    handleContinueToPreview,
    handleGenerate,
    reset,
    elementsNeedingClarification,
  } = useAIGeneration();

  const { mutate: importTypebot } = useMutation(
    trpc.typebot.importTypebot.mutationOptions({
      onSuccess: (data) => {
        router.push(`/typebots/${data.typebot.id}/edit`);
      },
    }),
  );

  const activeStepIndex = steps.findIndex(
    (step) => step.toLowerCase() === currentState.step,
  );
  const progressValue = ((activeStepIndex + 1) / steps.length) * 100;

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGenerateAndImport = useCallback(async () => {
    const typebot = await handleGenerate();
    if (typebot && workspace) {
      try {
        const folderId = router.query.folderId?.toString() ?? null;
        importTypebot({
          workspaceId: workspace.id,
          typebot: {
            ...typebot,
            folderId,
          },
        });
      } catch (error) {
        console.error("Failed to import generated typebot:", error);
      }
    }
  }, [handleGenerate, workspace, router.query.folderId, importTypebot]);

  // No auto-trigger needed anymore - users must go through preview step

  const activeColor = useColorModeValue("blue.500", "blue.300");
  const inactiveColor = useColorModeValue("gray.300", "gray.600");

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack spacing={4} align="stretch">
            <Text>Create Typebot with AI</Text>

            <VStack spacing={3}>
              <HStack spacing={4} justify="center">
                {steps.map((step, index) => (
                  <HStack key={step} spacing={2}>
                    <Circle
                      size="8"
                      bg={
                        index <= activeStepIndex ? activeColor : inactiveColor
                      }
                      color="white"
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      {index + 1}
                    </Circle>
                    <Text
                      fontSize="sm"
                      color={
                        index <= activeStepIndex ? activeColor : inactiveColor
                      }
                      fontWeight={index === activeStepIndex ? "bold" : "normal"}
                    >
                      {step}
                    </Text>
                    {index < steps.length - 1 && (
                      <Text color={inactiveColor}>→</Text>
                    )}
                  </HStack>
                ))}
              </HStack>

              <Progress
                value={progressValue}
                colorScheme="blue"
                size="sm"
                width="full"
                borderRadius="full"
              />
            </VStack>
          </VStack>
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody pb={6}>
          {currentState.step === "upload" && (
            <ImageUploadStep
              onImageSelect={handleImageUpload}
              isLoading={isLoading}
              hasOpenAICredentials={currentState.hasOpenAICredentials}
            />
          )}

          {currentState.step === "clarification" &&
            currentState.analysisResult && (
              <BlockClarificationStep
                elements={currentState.analysisResult}
                clarificationChoices={currentState.clarificationChoices}
                onClarificationChange={handleClarificationChoiceChange}
                onGenerate={handleContinueToPreview}
                isLoading={isLoading}
              />
            )}

          {currentState.step === "preview" && currentState.analysisResult && (
            <BlockPreviewStep
              elements={currentState.analysisResult}
              clarificationChoices={currentState.clarificationChoices}
              previewChoices={currentState.previewChoices}
              onPreviewChoiceChange={handlePreviewChoiceChange}
              onGenerate={handleGenerateAndImport}
              isLoading={isLoading}
            />
          )}

          {currentState.step === "generation" && (
            <VStack spacing={6}>
              <Text fontSize="lg" fontWeight="medium">
                Generating your typebot...
              </Text>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                AI is creating your typebot based on the analyzed elements. This
                may take a few moments.
              </Text>
              <Progress
                size="lg"
                isIndeterminate
                colorScheme="blue"
                width="full"
              />
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
