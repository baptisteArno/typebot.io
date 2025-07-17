export interface DetectedElement {
  type:
    | "text_input"
    | "number_input"
    | "email_input"
    | "phone_input"
    | "date_input"
    | "choice"
    | "rating"
    | "file_upload"
    | "text"
    | "button"
    | "heading"
    | "checkbox"
    | "slider";
  label?: string | null;
  placeholder?: string | null;
  options?: string[];
  confidence: number;
  clarificationNeeded?: boolean;
  suggestedBlockType?: string;
}

export interface ClarificationChoice {
  elementIndex: number;
  selectedBlockType: string;
  isMultiple?: boolean;
}

export interface PreviewChoice {
  elementIndex: number;
  isIncluded: boolean;
}

export interface AIGenerationStep {
  step: "upload" | "clarification" | "preview" | "generation";
  uploadedImage?: File;
  analysisResult?: DetectedElement[];
  clarificationChoices: ClarificationChoice[];
  previewChoices: PreviewChoice[];
  hasOpenAICredentials: boolean;
}
