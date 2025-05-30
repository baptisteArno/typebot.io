// Imports the Google Cloud client library
import { LanguageServiceClient } from '@google-cloud/language';

// Type definitions
export interface SentimentAnalysisInput {
  textToAnalyze: string;
  languageCode?: string;
}

export interface SentimentAnalysisResult {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  detectedLanguage?: string;
}

// Instantiates a client
// Assumes GOOGLE_APPLICATION_CREDENTIALS environment variable is set
// or other authentication is configured as per Google Cloud documentation.
const languageClient = new LanguageServiceClient();

/**
 * Analyzes the sentiment of a given text using Google Cloud Natural Language API.
 * @param input - The input text and optional language code.
 * @returns A promise that resolves to the sentiment analysis result.
 */
export async function analyzeSentiment(
  input: SentimentAnalysisInput
): Promise<SentimentAnalysisResult> {
  const { textToAnalyze, languageCode } = input;

  const document: {
    content: string;
    type: 'PLAIN_TEXT' | 'HTML';
    language?: string;
  } = {
    content: textToAnalyze,
    type: 'PLAIN_TEXT',
  };

  if (languageCode) {
    document.language = languageCode;
  }

  try {
    const [result] = await languageClient.analyzeSentiment({ document });
    const sentiment = result.documentSentiment;

    if (sentiment === null || sentiment === undefined) {
      console.error('Google NLP API returned null or undefined sentiment.');
      // Return a default neutral sentiment or throw a custom error
      return { score: 0, label: 'neutral' };
    }

    const score = sentiment.score ?? 0;
    let label: 'positive' | 'negative' | 'neutral';

    if (score > 0.25) {
      label = 'positive';
    } else if (score < -0.25) {
      label = 'negative';
    } else {
      label = 'neutral';
    }

    const analysisResult: SentimentAnalysisResult = {
      score,
      label,
    };

    if (!languageCode && result.language) {
      analysisResult.detectedLanguage = result.language;
    }

    return analysisResult;

  } catch (error) {
    console.error('Error calling Google Cloud Natural Language API:', error);
    // In a real application, you might want to throw a more specific error
    // or handle it according to Typebot's error handling strategy.
    // For now, returning a default neutral sentiment.
    // Consider if Typebot should retry or inform the user.
    return { score: 0, label: 'neutral' };
  }
}

// Example usage (for testing purposes, can be removed or commented out)
/*
async function testSentimentAnalysis() {
  // Mocking the API client for local testing without credentials
  // In a real environment, ensure credentials are set up.
  if (process.env.NODE_ENV !== 'production') { // Simple check, adjust as needed
    languageClient.analyzeSentiment = async (request: any) => {
      console.log('Mock analyzeSentiment called with:', request.document.content);
      let score = 0;
      if (request.document.content.includes('happy') || request.document.content.includes('great')) {
        score = 0.8;
      } else if (request.document.content.includes('sad') || request.document.content.includes('terrible')) {
        score = -0.8;
      }
      return [{
        documentSentiment: { score, magnitude: Math.abs(score) * 2 },
        language: request.document.language || 'en',
        sentences: []
      }];
    };
  }

  const exampleText1 = 'I am very happy and excited about this new feature!';
  const result1 = await analyzeSentiment({ textToAnalyze: exampleText1 });
  console.log(`Sentiment for "${exampleText1}":`, result1);

  const exampleText2 = 'This is a terrible experience, I am very disappointed.';
  const result2 = await analyzeSentiment({ textToAnalyze: exampleText2 });
  console.log(`Sentiment for "${exampleText2}":`, result2);

  const exampleText3 = 'The weather is okay today.';
  const result3 = await analyzeSentiment({ textToAnalyze: exampleText3 });
  console.log(`Sentiment for "${exampleText3}":`, result3);

  const exampleTextSpanish = 'Estoy muy contenta con el servicio.';
  const resultSpanish = await analyzeSentiment({ textToAnalyze: exampleTextSpanish, languageCode: 'es' });
  console.log(`Sentiment for "${exampleTextSpanish}" (Spanish specified):`, resultSpanish);

  const exampleTextAutoDetect = 'Bonjour, le monde!'; // French
  const resultAutoDetect = await analyzeSentiment({ textToAnalyze: exampleTextAutoDetect });
  console.log(`Sentiment for "${exampleTextAutoDetect}" (Auto-detect):`, resultAutoDetect);
}

// testSentimentAnalysis().catch(console.error);
*/

/**
 * TODO:
 * - Consider more sophisticated error handling based on Typebot's architecture.
 * - Review threshold for positive/negative/neutral labels if more nuanced classification is needed.
 * - Ensure proper setup of Google Cloud credentials in the actual Typebot environment.
 *   (e.g., GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to a service account key JSON file)
 */
