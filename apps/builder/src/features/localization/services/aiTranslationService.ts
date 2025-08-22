import { createOpenAI } from "@ai-sdk/openai";
import {
  getLocaleDisplayName,
  getLocaleFlagEmoji,
} from "@typebot.io/lib/localization";
import { generateText } from "ai";

export interface TranslationRequest {
  sourceText: string;
  sourceLocale: string;
  targetLocale: string;
  context?: string;
  blockType?: string;
}

export interface TranslationResult {
  translatedText: string;
  confidence: number;
  locale: string;
}

export interface BulkTranslationRequest {
  items: Array<{
    id: string;
    text: string;
    context?: string;
    blockType?: string;
  }>;
  sourceLocale: string;
  targetLocale: string;
}

export interface BulkTranslationResult {
  translations: Array<{
    id: string;
    translatedText: string;
    confidence: number;
  }>;
  locale: string;
  totalProcessed: number;
  errors: Array<{ id: string; error: string }>;
}

export class AITranslationService {
  private model: any;
  private apiKey: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.model = createOpenAI({
      baseURL: baseUrl,
      apiKey,
      compatibility: "strict",
    })("gpt-4o-mini"); // Using a cost-effective model for translations
  }

  /**
   * Translate a single piece of text
   */
  async translateText({
    sourceText,
    sourceLocale,
    targetLocale,
    context,
    blockType,
  }: TranslationRequest): Promise<TranslationResult> {
    if (!sourceText || !sourceText.trim()) {
      throw new Error("Source text is required");
    }

    const sourceLanguage = getLocaleDisplayName(sourceLocale);
    const targetLanguage = getLocaleDisplayName(targetLocale);

    const prompt = this.buildTranslationPrompt({
      sourceText,
      sourceLanguage,
      targetLanguage,
      context,
      blockType,
      isBulk: false,
    });

    try {
      const { text } = await generateText({
        model: this.model,
        temperature: 0.1, // Low temperature for consistent translations
        messages: [
          {
            role: "system",
            content:
              "You are a professional translator specializing in user interface and conversational content. Provide accurate, contextually appropriate translations that maintain the original tone and intent.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const translatedText = this.extractTranslationFromResponse(text);

      return {
        translatedText,
        confidence: this.calculateConfidence(sourceText, translatedText),
        locale: targetLocale,
      };
    } catch (error) {
      throw new Error(
        `Translation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Translate multiple pieces of text in bulk
   */
  async translateBulk({
    items,
    sourceLocale,
    targetLocale,
  }: BulkTranslationRequest): Promise<BulkTranslationResult> {
    if (!items || items.length === 0) {
      throw new Error("No items to translate");
    }

    const sourceLanguage = getLocaleDisplayName(sourceLocale);
    const targetLanguage = getLocaleDisplayName(targetLocale);

    // Process in batches to avoid token limits
    const batchSize = 10;
    const results: BulkTranslationResult = {
      translations: [],
      locale: targetLocale,
      totalProcessed: 0,
      errors: [],
    };

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      try {
        const batchResult = await this.translateBatch(
          batch,
          sourceLanguage,
          targetLanguage,
        );

        results.translations.push(...batchResult.translations);
        results.errors.push(...batchResult.errors);
        results.totalProcessed += batchResult.totalProcessed;
      } catch (error) {
        // If batch fails, mark all items in batch as errors
        batch.forEach((item) => {
          results.errors.push({
            id: item.id,
            error:
              error instanceof Error ? error.message : "Translation failed",
          });
        });
      }
    }

    return results;
  }

  /**
   * Process a single batch of translations
   */
  private async translateBatch(
    items: BulkTranslationRequest["items"],
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<BulkTranslationResult> {
    const prompt = this.buildBulkTranslationPrompt({
      items,
      sourceLanguage,
      targetLanguage,
    });

    try {
      const { text } = await generateText({
        model: this.model,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "You are a professional translator specializing in user interface and conversational content. Translate the provided items maintaining their structure and IDs. Return the results in the exact JSON format requested.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const translations = this.parseBulkTranslationResponse(text, items);

      return {
        translations,
        locale: "",
        totalProcessed: translations.length,
        errors: [],
      };
    } catch (error) {
      throw new Error(
        `Batch translation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Build translation prompt for single text
   */
  private buildTranslationPrompt({
    sourceText,
    sourceLanguage,
    targetLanguage,
    context,
    blockType,
    isBulk,
  }: {
    sourceText: string;
    sourceLanguage: string;
    targetLanguage: string;
    context?: string;
    blockType?: string;
    isBulk: boolean;
  }): string {
    let prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}:\n\n`;

    if (context) {
      prompt += `Context: ${context}\n`;
    }

    if (blockType) {
      prompt += `Block type: ${blockType}\n`;
    }

    prompt += `\nText to translate: "${sourceText}"\n\n`;

    prompt += `Important guidelines:
- Maintain the original tone and style
- Keep any formatting (HTML tags, markdown, etc.) intact
- For UI elements, use standard conventions for the target language
- For conversational content, ensure natural flow
- If the text contains variables (like {{variableName}}), keep them unchanged
- Return only the translated text, no explanations`;

    return prompt;
  }

  /**
   * Build bulk translation prompt
   */
  private buildBulkTranslationPrompt({
    items,
    sourceLanguage,
    targetLanguage,
  }: {
    items: BulkTranslationRequest["items"];
    sourceLanguage: string;
    targetLanguage: string;
  }): string {
    let prompt = `Translate the following items from ${sourceLanguage} to ${targetLanguage}.\n\n`;

    prompt += `Items to translate:\n`;
    items.forEach((item, index) => {
      prompt += `${index + 1}. ID: "${item.id}"\n`;
      if (item.context) prompt += `   Context: ${item.context}\n`;
      if (item.blockType) prompt += `   Block type: ${item.blockType}\n`;
      prompt += `   Text: "${item.text}"\n\n`;
    });

    prompt += `Important guidelines:
- Maintain the original tone and style for each item
- Keep any formatting (HTML tags, markdown, etc.) intact
- For UI elements, use standard conventions for the target language
- For conversational content, ensure natural flow
- If text contains variables (like {{variableName}}), keep them unchanged
- Return the results in this exact JSON format:
[
  {"id": "item_id_1", "translatedText": "translated text 1"},
  {"id": "item_id_2", "translatedText": "translated text 2"}
]

Return only the JSON array, no explanations or additional text.`;

    return prompt;
  }

  /**
   * Extract translation from AI response
   */
  private extractTranslationFromResponse(response: string): string {
    // Remove any explanations or formatting, return just the translation
    const lines = response.split("\n");

    // Look for the actual translation (usually the longest meaningful line)
    const translation = lines
      .map((line) => line.trim())
      .filter(
        (line) =>
          line &&
          !line.startsWith("Translation:") &&
          !line.startsWith("Translated:"),
      )
      .find((line) => line.length > 0);

    return translation || response.trim();
  }

  /**
   * Parse bulk translation response
   */
  private parseBulkTranslationResponse(
    response: string,
    originalItems: BulkTranslationRequest["items"],
  ): Array<{ id: string; translatedText: string; confidence: number }> {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }

      const translations = JSON.parse(jsonMatch[0]);

      return translations.map((item: any) => ({
        id: item.id,
        translatedText: item.translatedText || "",
        confidence: this.calculateConfidence(
          originalItems.find((orig) => orig.id === item.id)?.text || "",
          item.translatedText || "",
        ),
      }));
    } catch (error) {
      // Fallback: try to extract translations manually
      return originalItems.map((item) => ({
        id: item.id,
        translatedText: `[Translation Error: ${error instanceof Error ? error.message : "Unknown error"}]`,
        confidence: 0,
      }));
    }
  }

  /**
   * Calculate confidence score based on translation quality indicators
   */
  private calculateConfidence(
    sourceText: string,
    translatedText: string,
  ): number {
    if (!translatedText || translatedText.includes("[Translation Error")) {
      return 0;
    }

    let confidence = 100;

    // Reduce confidence if translation is suspiciously similar to source
    if (sourceText === translatedText) {
      confidence -= 30;
    }

    // Reduce confidence if translation seems too short or too long compared to source
    const lengthRatio = translatedText.length / sourceText.length;
    if (lengthRatio < 0.3 || lengthRatio > 3) {
      confidence -= 20;
    }

    // Reduce confidence if translation contains obvious errors
    if (translatedText.includes("{{") !== sourceText.includes("{{")) {
      confidence -= 10; // Variable mismatch
    }

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Validate API key
   */
  static async validateApiKey(
    apiKey: string,
    baseUrl?: string,
  ): Promise<boolean> {
    try {
      const service = new AITranslationService(apiKey, baseUrl);
      await service.translateText({
        sourceText: "Hello",
        sourceLocale: "en",
        targetLocale: "es",
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Test workspace OpenAI credentials
   */
  static async testWorkspaceCredentials(credentialData: {
    apiKey: string;
    baseUrl?: string;
  }): Promise<boolean> {
    return AITranslationService.validateApiKey(
      credentialData.apiKey,
      credentialData.baseUrl,
    );
  }
}
