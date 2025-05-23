import { ResultV6 } from '@typebot.io/schemas';
import { ExecuteLogicResponse } from '../../../types';
import { getBlockById } from '../../../logic/getBlockById';
import { ادامهResult } from '../../../logic/continueResult';
import {
  SentimentAnalysisBlock,
  SentimentAnalysisCredentials,
} from '@typebot.io/schemas/features/blocks/integrations/sentimentAnalysis';
import {
  analyzeSentiment,
  SentimentAnalysisInput,
  SentimentAnalysisResult,
} from '../../../sentiment/sentimentAnalysisService'; // Assuming sentimentAnalysisService is in a top-level sentiment directory
import { setVariableValue } from '../../../logic/setVariableValue';
import { createId } from '@paralleldrive/cuid2';

export const executeSentimentAnalysisBlock = async (
  result: ResultV6,
  block: SentimentAnalysisBlock
): Promise<ExecuteLogicResponse> => {
  // 1. Get options from the block
  const textToAnalyze = block.options?.textToAnalyze;
  const languageCode = block.options?.languageCode; // Optional: 'auto' or specific code like 'en', 'es'
  const outputScoreVariableId = block.options?.outputScoreVariableId;
  const outputLabelVariableId = block.options?.outputLabelVariableId;
  const outputLanguageVariableId = block.options?.outputLanguageVariableId;

  // TODO: Add proper credential handling if needed by the service, e.g., API key
  // For Google Cloud, it often relies on GOOGLE_APPLICATION_CREDENTIALS env var,
  // so direct credential passing might not be needed here if the service handles it.
  // const credentials = getSentimentAnalysisCredentials(result.typebot.credentials);
  // if (!credentials) {
  //   return {
  //     result,
  //     outgoingEdgeId: block.outgoingEdgeId, // Or an error edge if designed
  //     logs: [{ status: 'error', message: 'Sentiment Analysis credentials not found.' }],
  //   };
  // }

  if (!textToAnalyze) {
    return {
      result,
      outgoingEdgeId: block.outgoingEdgeId, // Or an error edge
      logs: [
        {
          status: 'error',
          message: 'Text to analyze is not defined in the block options.',
        },
      ],
    };
  }

  // 2. Prepare input for the sentiment analysis service
  const analysisInput: SentimentAnalysisInput = {
    textToAnalyze: textToAnalyze, // This should be the actual text, resolved from variable if needed
  };

  if (languageCode && languageCode !== 'auto') {
    analysisInput.languageCode = languageCode;
  }

  // 3. Call the sentiment analysis service
  let analysisResult: SentimentAnalysisResult;
  try {
    // In a real scenario, pass credentials if the service function requires them
    analysisResult = await analyzeSentiment(analysisInput);
  } catch (error: any) {
    console.error('Sentiment analysis service failed:', error);
    return {
      result,
      outgoingEdgeId: block.outgoingEdgeId, // Or an error edge
      logs: [
        {
          status: 'error',
          message: `Sentiment analysis failed: ${error.message || 'Unknown error'}`,
        },
      ],
    };
  }

  // 4. Save results to output variables
  let updatedVariables = result.variables;

  if (outputScoreVariableId && analysisResult.score !== undefined) {
    updatedVariables = setVariableValue(
      updatedVariables,
      outputScoreVariableId,
      analysisResult.score
    );
  }
  if (outputLabelVariableId && analysisResult.label) {
    updatedVariables = setVariableValue(
      updatedVariables,
      outputLabelVariableId,
      analysisResult.label
    );
  }
  if (outputLanguageVariableId && analysisResult.detectedLanguage) {
    updatedVariables = setVariableValue(
      updatedVariables,
      outputLanguageVariableId,
      analysisResult.detectedLanguage
    );
  }

  const nextBlockId = getBlockById(result.typebot, block.outgoingEdgeId ?? '')
    ?.id;

  return {
    result: { ...result, variables: updatedVariables },
    outgoingEdgeId: block.outgoingEdgeId,
    // Add logs for successful execution if desired
    logs: [
      {
        status: 'success',
        message: `Sentiment analyzed: ${analysisResult.label} (Score: ${analysisResult.score})`,
      },
    ],
    executionTime: 0, // This would ideally be measured
  };
};

// Helper function to get credentials (example, adjust as per Typebot's structure)
// This might live in a more generic credentials service within Typebot.
const getSentimentAnalysisCredentials = (
  credentials: ResultV6['typebot']['credentials']
): SentimentAnalysisCredentials | undefined => {
  return credentials.find(
    (cred): cred is SentimentAnalysisCredentials =>
      cred.id === 'sentiment-analysis-google' // Or a generic ID if multiple providers
  ) as SentimentAnalysisCredentials | undefined;
};
