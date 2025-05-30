import { LanguageServiceClient } from '@google-cloud/language';
import { analyzeSentiment, SentimentAnalysisInput } from './sentimentAnalysisService';

// Mock the Google Cloud LanguageServiceClient
jest.mock('@google-cloud/language', () => {
  // We need to mock the constructor and the methods used
  return {
    LanguageServiceClient: jest.fn().mockImplementation(() => {
      return {
        analyzeSentiment: jest.fn(), // This will be further mocked in each test
      };
    }),
  };
});

// Type for the mocked client's analyzeSentiment method
type MockAnalyzeSentiment = jest.Mock<
  Promise<[{ documentSentiment: any; language: string; sentences: any[] }]>,
  [{ document: any }]
>;


describe('analyzeSentiment - Backend Service', () => {
  let mockLanguageClientInstance: LanguageServiceClient;
  let mockAnalyzeSentimentMethod: MockAnalyzeSentiment;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    (LanguageServiceClient as jest.Mock).mockClear();
    
    // Create a new instance for each test to ensure isolation
    // Note: The mock constructor defined above returns an object with analyzeSentiment as a jest.fn()
    // So, we can access it this way.
    mockLanguageClientInstance = new LanguageServiceClient();
    mockAnalyzeSentimentMethod = mockLanguageClientInstance.analyzeSentiment as MockAnalyzeSentiment;
  });

  it('should correctly parse a positive sentiment response', async () => {
    mockAnalyzeSentimentMethod.mockResolvedValueOnce([
      {
        documentSentiment: { score: 0.8, magnitude: 1.6 },
        language: 'en',
        sentences: [],
      },
    ]);

    const input: SentimentAnalysisInput = { textToAnalyze: 'This is great!' };
    const result = await analyzeSentiment(input);

    expect(result.label).toBe('positive');
    expect(result.score).toBe(0.8);
    expect(result.detectedLanguage).toBe('en');
    expect(mockAnalyzeSentimentMethod).toHaveBeenCalledWith({
      document: { content: 'This is great!', type: 'PLAIN_TEXT' },
    });
  });

  it('should correctly parse a negative sentiment response', async () => {
    mockAnalyzeSentimentMethod.mockResolvedValueOnce([
      {
        documentSentiment: { score: -0.7, magnitude: 1.4 },
        language: 'en',
        sentences: [],
      },
    ]);

    const input: SentimentAnalysisInput = { textToAnalyze: 'This is terrible.' };
    const result = await analyzeSentiment(input);

    expect(result.label).toBe('negative');
    expect(result.score).toBe(-0.7);
    expect(result.detectedLanguage).toBe('en');
  });

  it('should correctly parse a neutral sentiment response (score 0)', async () => {
    mockAnalyzeSentimentMethod.mockResolvedValueOnce([
      {
        documentSentiment: { score: 0.1, magnitude: 0.2 },
        language: 'en',
        sentences: [],
      },
    ]);

    const input: SentimentAnalysisInput = { textToAnalyze: 'This is a fact.' };
    const result = await analyzeSentiment(input);

    expect(result.label).toBe('neutral');
    expect(result.score).toBe(0.1);
  });

  it('should correctly parse a neutral sentiment response (score close to 0, e.g. 0.25)', async () => {
    mockAnalyzeSentimentMethod.mockResolvedValueOnce([
      {
        documentSentiment: { score: 0.25, magnitude: 0.5 },
        language: 'en',
        sentences: [],
      },
    ]);
    const input: SentimentAnalysisInput = { textToAnalyze: 'This is just okay.' };
    const result = await analyzeSentiment(input);
    expect(result.label).toBe('neutral');
    expect(result.score).toBe(0.25);
  });

    it('should correctly parse a neutral sentiment response (score close to 0, e.g. -0.25)', async () => {
    mockAnalyzeSentimentMethod.mockResolvedValueOnce([
      {
        documentSentiment: { score: -0.25, magnitude: 0.5 },
        language: 'en',
        sentences: [],
      },
    ]);
    const input: SentimentAnalysisInput = { textToAnalyze: 'This is barely acceptable.' };
    const result = await analyzeSentiment(input);
    expect(result.label).toBe('neutral');
    expect(result.score).toBe(-0.25);
  });


  it('should handle null score from API by returning neutral', async () => {
    mockAnalyzeSentimentMethod.mockResolvedValueOnce([
      {
        documentSentiment: { score: null, magnitude: 0 },
        language: 'en',
        sentences: [],
      },
    ]);

    const input: SentimentAnalysisInput = { textToAnalyze: 'Unknown outcome.' };
    const result = await analyzeSentiment(input);

    expect(result.label).toBe('neutral');
    expect(result.score).toBe(0);
  });
  
  it('should handle undefined score from API by returning neutral', async () => {
    mockAnalyzeSentimentMethod.mockResolvedValueOnce([
      {
        documentSentiment: { score: undefined, magnitude: 0 },
        language: 'en',
        sentences: [],
      },
    ]);

    const input: SentimentAnalysisInput = { textToAnalyze: 'Undefined feeling.' };
    const result = await analyzeSentiment(input);

    expect(result.label).toBe('neutral');
    expect(result.score).toBe(0);
  });

  it('should handle completely null documentSentiment from API by returning neutral', async () => {
    mockAnalyzeSentimentMethod.mockResolvedValueOnce([
      {
        documentSentiment: null,
        language: 'en',
        sentences: [],
      },
    ]);
    const input: SentimentAnalysisInput = { textToAnalyze: 'No sentiment data.' };
    const result = await analyzeSentiment(input);
    expect(result.label).toBe('neutral');
    expect(result.score).toBe(0);
    expect(result.detectedLanguage).toBe('en'); // Still expect language if API returns it
  });


  it('should pass languageCode to the API if provided', async () => {
    mockAnalyzeSentimentMethod.mockResolvedValueOnce([
      {
        documentSentiment: { score: 0.5, magnitude: 1.0 },
        language: 'es', // API might still return detected language
        sentences: [],
      },
    ]);

    const input: SentimentAnalysisInput = { textToAnalyze: 'Hola!', languageCode: 'es' };
    await analyzeSentiment(input);

    expect(mockAnalyzeSentimentMethod).toHaveBeenCalledWith({
      document: { content: 'Hola!', type: 'PLAIN_TEXT', language: 'es' },
    });
  });

  it('should not include detectedLanguage in result if languageCode was provided', async () => {
    mockAnalyzeSentimentMethod.mockResolvedValueOnce([
      {
        documentSentiment: { score: 0.5, magnitude: 1.0 },
        language: 'es', // API returns the language it used/confirmed
        sentences: [],
      },
    ]);
    const input: SentimentAnalysisInput = { textToAnalyze: 'Hola!', languageCode: 'es' };
    const result = await analyzeSentiment(input);
    expect(result.detectedLanguage).toBeUndefined();
  });
  
  it('should include detectedLanguage in result if languageCode was NOT provided', async () => {
    mockAnalyzeSentimentMethod.mockResolvedValueOnce([
      {
        documentSentiment: { score: 0.5, magnitude: 1.0 },
        language: 'fr', // API detected French
        sentences: [],
      },
    ]);
    const input: SentimentAnalysisInput = { textToAnalyze: 'Bonjour!' };
    const result = await analyzeSentiment(input);
    expect(result.detectedLanguage).toBe('fr');
  });

  it('should return a default neutral sentiment on API error', async () => {
    mockAnalyzeSentimentMethod.mockRejectedValueOnce(new Error('API Call Failed'));

    const input: SentimentAnalysisInput = { textToAnalyze: 'This will fail.' };
    const result = await analyzeSentiment(input);

    expect(result.label).toBe('neutral');
    expect(result.score).toBe(0);
    expect(result.detectedLanguage).toBeUndefined(); // No language info on error
  });
  
  it('should correctly pass plain text to the API client', async () => {
    mockAnalyzeSentimentMethod.mockResolvedValueOnce([
      {
        documentSentiment: { score: 0, magnitude: 0 },
        language: 'en',
        sentences: [],
      },
    ]);
    const text = 'Simple text for analysis.';
    const input: SentimentAnalysisInput = { textToAnalyze: text };
    await analyzeSentiment(input);

    expect(mockAnalyzeSentimentMethod).toHaveBeenCalledWith({
      document: { content: text, type: 'PLAIN_TEXT' },
    });
  });
});
