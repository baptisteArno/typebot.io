import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import { useToast } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  AITranslationService,
  type BulkTranslationRequest,
  type BulkTranslationResult,
  type TranslationRequest,
  type TranslationResult,
} from "../services/aiTranslationService";

interface AITranslationConfig {
  apiKey?: string;
  baseUrl?: string;
}

interface UseAITranslationReturn {
  translateText: (
    request: TranslationRequest,
  ) => Promise<TranslationResult | null>;
  translateBulk: (
    request: BulkTranslationRequest,
  ) => Promise<BulkTranslationResult | null>;
  isTranslating: boolean;
  progress: number;
  error: string | null;
  clearError: () => void;
  hasOpenAiCredentials: boolean;
  availableCredentials: Array<{ id: string; name: string }>;
  setOpenAiCredentialsId: (id: string | null) => void;
}

export const useAITranslation = (
  config?: AITranslationConfig,
): UseAITranslationReturn => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [openAiCredentialsId, setOpenAiCredentialsId] = useState<string | null>(
    null,
  );
  const toast = useToast();
  const { workspace } = useWorkspace();

  const clearError = () => setError(null);

  // Get list of OpenAI credentials in workspace
  const { data: credentialsList } = useQuery(
    trpc.credentials.listCredentials.queryOptions(
      {
        scope: "workspace",
        workspaceId: workspace?.id ?? "",
        type: "openai",
      },
      {
        enabled: !!workspace?.id,
      },
    ),
  );

  // Get the first available OpenAI credential data
  const { data: credentialData } = useQuery(
    trpc.credentials.getCredentials.queryOptions(
      {
        scope: "workspace",
        workspaceId: workspace?.id ?? "",
        credentialsId:
          openAiCredentialsId ?? credentialsList?.credentials[0]?.id ?? "",
      },
      {
        enabled:
          !!workspace?.id &&
          !!(openAiCredentialsId ?? credentialsList?.credentials[0]?.id),
      },
    ),
  );

  const createService = (): AITranslationService | null => {
    // Use provided config first, then fall back to workspace credentials
    if (config?.apiKey) {
      return new AITranslationService(config.apiKey, config.baseUrl);
    }

    // Use workspace OpenAI credentials
    if (credentialData?.data) {
      const openAiData = credentialData.data as any;
      if (openAiData?.apiKey) {
        return new AITranslationService(
          openAiData.apiKey,
          openAiData.baseUrl || config?.baseUrl,
        );
      }
    }

    setError(
      "OpenAI credentials are required for AI translation. Please add OpenAI credentials to your workspace or add an OpenAI block to your chatbot first.",
    );
    return null;
  };

  const translateText = async (
    request: TranslationRequest,
  ): Promise<TranslationResult | null> => {
    const service = createService();
    if (!service) return null;

    setIsTranslating(true);
    setError(null);
    setProgress(0);

    try {
      setProgress(50);
      const result = await service.translateText(request);
      setProgress(100);

      toast({
        title: "Translation completed",
        description: `Successfully translated to ${result.locale}`,
        status: "success",
        duration: 3000,
      });

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Translation failed";
      setError(errorMessage);

      toast({
        title: "Translation failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
      });

      return null;
    } finally {
      setIsTranslating(false);
      setProgress(0);
    }
  };

  const translateBulk = async (
    request: BulkTranslationRequest,
  ): Promise<BulkTranslationResult | null> => {
    const service = createService();
    if (!service) return null;

    setIsTranslating(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress updates during bulk translation
      const totalItems = request.items.length;
      const batchSize = 10;
      let processedItems = 0;

      // Update progress every batch
      const progressInterval = setInterval(() => {
        processedItems = Math.min(processedItems + batchSize, totalItems);
        setProgress((processedItems / totalItems) * 100);
      }, 1000);

      const result = await service.translateBulk(request);

      clearInterval(progressInterval);
      setProgress(100);

      const successCount = result.translations.length;
      const errorCount = result.errors.length;

      if (errorCount > 0) {
        toast({
          title: "Translation completed with errors",
          description: `${successCount} translations succeeded, ${errorCount} failed`,
          status: "warning",
          duration: 5000,
        });
      } else {
        toast({
          title: "Bulk translation completed",
          description: `Successfully translated ${successCount} items to ${request.targetLocale}`,
          status: "success",
          duration: 3000,
        });
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Bulk translation failed";
      setError(errorMessage);

      toast({
        title: "Bulk translation failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
      });

      return null;
    } finally {
      setIsTranslating(false);
      setProgress(0);
    }
  };

  return {
    translateText,
    translateBulk,
    isTranslating,
    progress,
    error,
    clearError,
    hasOpenAiCredentials:
      !!(credentialData?.data && (credentialData.data as any)?.apiKey) ||
      !!config?.apiKey,
    availableCredentials:
      credentialsList?.credentials.map((c) => ({ id: c.id, name: c.name })) ||
      [],
    setOpenAiCredentialsId,
  };
};

export default useAITranslation;
