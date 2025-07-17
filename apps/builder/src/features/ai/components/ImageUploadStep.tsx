import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Image,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploadStepProps {
  onImageSelect: (file: File) => void;
  isLoading: boolean;
  hasOpenAICredentials: boolean;
}

export const ImageUploadStep = ({
  onImageSelect,
  isLoading,
  hasOpenAICredentials,
}: ImageUploadStepProps) => {
  const { workspace } = useWorkspace();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const borderColor = useColorModeValue("gray.300", "gray.600");
  const activeBorderColor = useColorModeValue("blue.300", "blue.400");
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const activeBgColor = useColorModeValue("blue.50", "blue.900");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const subtleTextColor = useColorModeValue("gray.500", "gray.500");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"],
    },
    multiple: false,
    disabled: isLoading,
  });

  const handleAnalyze = () => {
    if (selectedImage) {
      onImageSelect(selectedImage);
    }
  };

  const canProceed = selectedImage && hasOpenAICredentials && !isLoading;

  return (
    <VStack spacing={6} align="stretch">
      <VStack spacing={4}>
        <Text fontSize="lg" fontWeight="medium">
          Upload a screenshot or mockup of your form
        </Text>
        <Text fontSize="sm" color="gray.600" textAlign="center">
          Upload an image of a form, interface, or mockup and we'll analyze it
          to create your typebot.
        </Text>
      </VStack>

      {!hasOpenAICredentials && (
        <Alert status="warning">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="medium">OpenAI credentials required</Text>
            <Text fontSize="sm">
              Please configure OpenAI credentials in your workspace settings to
              use AI generation.
            </Text>
          </VStack>
        </Alert>
      )}

      <Box
        {...getRootProps()}
        border="2px dashed"
        borderColor={isDragActive ? activeBorderColor : borderColor}
        borderRadius="md"
        p={8}
        textAlign="center"
        cursor={isLoading ? "not-allowed" : "pointer"}
        bg={isDragActive ? activeBgColor : bgColor}
        opacity={isLoading ? 0.6 : 1}
        transition="all 0.2s"
      >
        <input {...getInputProps()} />
        {imagePreview ? (
          <VStack spacing={4}>
            <Image
              src={imagePreview}
              alt="Preview"
              maxH="200px"
              maxW="100%"
              objectFit="contain"
              borderRadius="md"
            />
            <Text fontSize="sm" color={textColor}>
              Click or drag to replace image
            </Text>
          </VStack>
        ) : (
          <VStack spacing={4}>
            <Text fontSize="xl">📷</Text>
            <VStack spacing={2}>
              <Text fontWeight="medium">
                {isDragActive
                  ? "Drop the image here"
                  : "Drop an image here, or click to select"}
              </Text>
              <Text fontSize="sm" color={subtleTextColor}>
                Supports PNG, JPG, GIF, WebP files
              </Text>
            </VStack>
          </VStack>
        )}
      </Box>

      <Button
        colorScheme="blue"
        size="lg"
        onClick={handleAnalyze}
        isLoading={isLoading}
        loadingText="Analyzing..."
        isDisabled={!canProceed}
        width="full"
      >
        {!hasOpenAICredentials
          ? "Configure OpenAI Credentials First"
          : !selectedImage
            ? "Select an image first"
            : "Analyze Image"}
      </Button>
    </VStack>
  );
};
