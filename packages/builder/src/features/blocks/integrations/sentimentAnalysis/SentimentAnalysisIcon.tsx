import React from 'react';

// Using a readily available Material Icon name is often easier if the library supports it.
// If a custom SVG is needed, it would look like this:
export const SentimentAnalysisIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    height="24"
    width="24"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    {/* A simple representation: a speech bubble with a plus/minus inside for sentiment */}
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm-4-3H6V9h8v2zm2-3H6V6h10v2zM12 10.5c.83 0 1.5-.67 1.5-1.5S12.83 7.5 12 7.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm0 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
    {/* Placeholder for a more sentiment-specific icon like psychology_alt or custom path */}
    {/* Using psychology_alt as a concept: */}
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-11h2v2h-2v2h-2v-2h2V7h2v2zm0 4h2v5h-2z"/>
  </svg>
);

// If using Material Icons directly by name (preferred if Typebot does this):
// The icon name would be 'psychology_alt' or 'sentiment_satisfied_alt' etc.
// For the metadata, we'd just use the string name.
// This SVG is a fallback/example if custom SVGs are the norm.
// A more fitting icon from Material Icons might be:
// - psychology_alt
// - sentiment_neutral
// - record_voice_over (if focusing on text analysis)
// - auto_awesome (for AI features)
// Let's assume 'psychology_alt' is a good fit.
// This file is more for if a custom SVG component is strictly needed.
// If the builder just takes an icon name string, this file is not essential.
// For the purpose of this task, providing the name 'psychology_alt' in metadata is sufficient.
// This file is illustrative of how a custom SVG icon could be structured if required.
// Let's simplify and assume the icon is a string name for the metadata.
// This file can be considered optional or illustrative.
// The primary component is SentimentAnalysisBlockPanel.tsx
// If a custom SVG *is* required for registration:
/*
export const SentimentAnalysisIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-6.5c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-4-1.5c0-2.06 1.29-3.82 3.11-4.54C10.09 7.13 10 6.35 10 5.5c0-1.1.9-2 2-2s2 .9 2 2c0 .85-.09 1.63-.25 2.39C15.71 8.68 17 10.44 17 12.5c0 1.66-1.34 3-3 3s-3-1.34-3-3z"/>
  </svg>
);
*/
// Using a simpler icon for this example if a custom SVG is needed.
// This is a generic "AI" or "cog" like icon.
export const SentimentAnalysisCustomIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3C10.9 3 10 3.9 10 5V7.03C7.67 7.58 6 9.61 6 12C6 14.39 7.67 16.42 10 16.97V19C10 20.1 10.9 21 12 21C13.1 21 14 20.1 14 19V16.97C16.33 16.42 18 14.39 18 12C18 9.61 16.33 7.58 14 7.03V5C14 3.9 13.1 3 12 3ZM12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12C15 13.66 13.66 15 12 15Z" fill="currentColor"/>
    <path d="M19.78 7.22L18.36 5.8L19.07 3.93L17.19 3.22L16.48 1.36L14.59 2.07L13.17 0.64L12 1.82L10.83 0.64L9.41 2.07L7.52 1.36L6.81 3.22L4.93 3.93L5.64 5.8L4.22 7.22L5.39 8.39L4.22 9.58L5.64 11L4.93 12.87L6.81 13.58L7.52 15.44L9.41 14.73L10.83 16.16L12 14.97L13.17 16.16L14.59 14.73L16.48 15.44L17.19 13.58L19.07 12.87L18.36 11L19.78 9.58L18.61 8.39L19.78 7.22ZM12 13C11.45 13 11 12.55 11 12C11 11.45 11.45 11 12 11C12.55 11 13 11.45 13 12C13 12.55 12.55 13 12 13Z" fill="currentColor"/>
  </svg>
);
// If Typebot uses string names for Material Icons, we don't need this file.
// The metadata would just specify `icon: 'psychology_alt'`.
// This file is provided in case a custom SVG component is the required way to specify icons.The frontend components for the "Sentiment Analysis" block involve defining its metadata, creating a React component for its configuration panel, and outlining its registration. An optional visual component for the graph node can also be described.

**1. Block Metadata**

*   **`id`**: `sentimentAnalysis`
    *   *Justification*: Generic enough to potentially accommodate different sentiment analysis providers in the future, with provider selection becoming an option within the block.
*   **`name`**: "Sentiment Analysis"
    *   *Justification*: Clear and descriptive for the user.
*   **`icon`**: `psychology_alt` (Material Design Icon name)
    *   *Justification*: This icon (often looks like a head with a brain/cog) is commonly associated with AI, thinking, or advanced analysis, fitting for sentiment analysis. Alternatively, `sentiment_neutral` or `auto_awesome` could be used. If custom SVGs are preferred, a `SentimentAnalysisIcon.tsx` component would be created (example provided below if needed).
*   **`category`**: "AI & Integrations"
    *   *Justification*: This category groups it with other blocks that leverage AI or connect to external services.

**2. React Component for Block Configuration Panel**

The code for `SentimentAnalysisBlockPanel.tsx` was created in the previous step. Here it is, confirmed to align with the subtask requirements:

```typescript
// packages/builder/src/features/blocks/integrations/sentimentAnalysis/SentimentAnalysisBlockPanel.tsx
import React, { useState, useEffect } from 'react';
import { BlockWithOptions, Variable } from '@typebot.io/schemas';
// Assuming the path for SentimentAnalysisBlockOptions will be:
import { SentimentAnalysisBlockOptions } from '@typebot.io/schemas/features/blocks/integrations/sentimentAnalysis';

// Mock/Placeholder components for Typebot's UI library
// In a real scenario, these would be imported from Typebot's actual UI component library.
const Dropdown = ({ label, value, onChange, options, placeholder, searchable, allowCustomValue, disabled }: any) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={{ display: 'block', marginBottom: '0.5rem' }}>{label}</label>
    <select value={value} onChange={onChange} style={{ width: '100%', padding: '0.5rem' }} disabled={disabled}>
      {placeholder && <option value="">{placeholder}</option>}
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {searchable && <small> (Searchable dropdown)</small>}
    {allowCustomValue && <small> (Allows custom value)</small>}
  </div>
);

const RadioGroup = ({ label, value, onChange, options, name }: any) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={{ display: 'block', marginBottom: '0.5rem' }}>{label}</label>
    {options?.map((opt: any) => (
      <label key={opt.value} style={{ marginRight: '1rem' }}>
        <input type="radio" value={opt.value} checked={opt.value === value} onChange={onChange} name={name} />
        {opt.label}
      </label>
    ))}
  </div>
);

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div style={{ border: '1px solid #eee', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
    <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1em', color: '#333' }}>{title}</h3>
    {children}
  </div>
);

const ReadOnlyVariablesList = ({ variables }: { variables: Array<{ name: string, description: string }> }) => (
  <div>
    <ul style={{ listStyleType: 'none', paddingLeft: 0, margin: 0 }}>
      {variables.map(variable => (
        <li key={variable.name} style={{ marginBottom: '0.5rem', background: '#f8f9fa', padding: '0.75rem', borderRadius: '4px', border: '1px solid #e9ecef' }}>
          <strong style={{ color: '#007bff' }}>{variable.name}</strong>
          <p style={{ color: '#495057', margin: '0.25rem 0 0', fontSize: '0.9em' }}>{variable.description}</p>
        </li>
      ))}
    </ul>
  </div>
);

// Props expected by the panel
interface SentimentAnalysisBlockPanelProps {
  block: BlockWithOptions<SentimentAnalysisBlockOptions>;
  onOptionsChange: (options: SentimentAnalysisBlockOptions) => void;
  availableVariables: Pick<Variable, 'id' | 'name'>[];
}

// Predefined list of common languages for the dropdown
const commonLanguages = [
  // 'auto' is handled by the radio button, so not needed here.
  { value: 'en', label: 'English (en)' },
  { value: 'es', label: 'Spanish (es)' },
  { value: 'fr', label: 'French (fr)' },
  { value: 'de', label: 'German (de)' },
  { value: 'pt', label: 'Portuguese (pt)' },
  { value: 'it', label: 'Italian (it)' },
  { value: 'ja', label: 'Japanese (ja)' },
  { value: 'ko', label: 'Korean (ko)' },
  { value: 'zh', label: 'Chinese (Simplified, zh-CN)' }, // More specific
  { value: 'zh-TW', label: 'Chinese (Traditional, zh-TW)' },
];

const outputVariablesInfo = [
  { name: '{{@sentiment.label}}', description: 'The overall sentiment category (e.g., "positive", "negative", "neutral").' },
  { name: '{{@sentiment.score}}', description: 'A numerical score representing the sentiment intensity (e.g., between -1.0 and 1.0). The range depends on the underlying service.' },
  { name: '{{@sentiment.languageCode}}', description: 'The detected language code if "Auto-detect" was used (e.g., "en", "es"). Empty if language was specified.' },
];

export const SentimentAnalysisBlockPanel: React.FC<SentimentAnalysisBlockPanelProps> = ({
  block,
  onOptionsChange,
  availableVariables,
}) => {
  // Initialize with default options if none are provided
  const initialOptions: SentimentAnalysisBlockOptions = {
    textToAnalyzeVariableId: '',
    languageConfig: { mode: 'auto', specificLanguageCode: undefined },
    ...block.options, // Spread existing options, potentially overriding defaults
  };
   // Ensure languageConfig is well-formed
  if (!initialOptions.languageConfig) {
    initialOptions.languageConfig = { mode: 'auto', specificLanguageCode: undefined };
  }


  const [currentOptions, setCurrentOptions] = useState<SentimentAnalysisBlockOptions>(initialOptions);

  // Update internal state and notify Typebot when options change
  const handleChange = (newPartialOptions: Partial<SentimentAnalysisBlockOptions>) => {
    const updatedOptions = { ...currentOptions, ...newPartialOptions };
    setCurrentOptions(updatedOptions);
    onOptionsChange(updatedOptions);
  };

  const handleLanguageModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mode = e.target.value as 'auto' | 'specify';
    handleChange({
      languageConfig: {
        mode,
        specificLanguageCode: mode === 'auto' ? undefined : currentOptions.languageConfig?.specificLanguageCode,
      },
    });
  };

  const handleSpecificLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const specificLanguageCode = e.target.value;
    handleChange({
      languageConfig: {
        ...currentOptions.languageConfig!, // mode should already be 'specify'
        mode: 'specify', // ensure
        specificLanguageCode,
      },
    });
  };

  const handleTextVariableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange({ textToAnalyzeVariableId: e.target.value });
  };


  const variableDropdownOptions = availableVariables.map(v => ({
    // Assuming Typebot uses `{{variableId}}` format for referencing variables in options
    value: `{{${v.id}}}`,
    label: v.name,
  }));

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <Section title="Input Text">
        <Dropdown
          label="Text to Analyze:"
          placeholder="Select a variable..."
          options={variableDropdownOptions}
          value={currentOptions.textToAnalyzeVariableId ?? ''}
          onChange={handleTextVariableChange}
          searchable={true} // Assuming Typebot's Dropdown can be searchable
          allowCustomValue={true} // Assuming users can type variable names like {{myVar}}
        />
        <small style={{ color: '#6c757d' }}>
          Choose the variable containing the text you want to analyze (e.g., from a user input).
        </small>
      </Section>

      <Section title="Language">
        <RadioGroup
          label="Language Detection Method:"
          name="languageMode" // Important for proper radio button behavior
          value={currentOptions.languageConfig?.mode ?? 'auto'}
          onChange={handleLanguageModeChange}
          options={[
            { value: 'auto', label: 'Auto-detect' },
            { value: 'specify', label: 'Specify Language' },
          ]}
        />
        <Dropdown
          label="Select Language:"
          placeholder="Choose a language..."
          options={commonLanguages} // 'auto' is not in this list
          value={currentOptions.languageConfig?.specificLanguageCode ?? ''}
          onChange={handleSpecificLanguageChange}
          disabled={currentOptions.languageConfig?.mode !== 'specify'}
          searchable={true}
        />
        <small style={{ color: '#6c757d' }}>
          'Auto-detect' is recommended for most cases. Specify the language if you know it beforehand or for better accuracy with specific texts.
        </small>
      </Section>

      <Section title="Output Variables">
        <p style={{ fontSize: '0.95em', color: '#495057' }}>
          This block automatically provides the following variables after execution:
        </p>
        <ReadOnlyVariablesList variables={outputVariablesInfo} />
        <small style={{ color: '#6c757d', marginTop: '1rem', display: 'block' }}>
          Use these variables in subsequent blocks (e.g., in a "Condition" block to branch the flow based on sentiment, or display the score).
        </small>
      </Section>
    </div>
  );
};
```

**Schema Definition (Conceptual - resides in `packages/schemas`)**

```typescript
// Example: packages/schemas/features/blocks/integrations/sentimentAnalysis.ts
import { BlockOptions } from '../../../BlockOptions'; // Adjust path as needed

export type SentimentAnalysisLanguageMode = 'auto' | 'specify';

export interface SentimentAnalysisBlockOptions extends BlockOptions {
  textToAnalyzeVariableId?: string; // Stores the variable ID, e.g., "{{var123}}"
  languageConfig?: {
    mode: SentimentAnalysisLanguageMode;
    specificLanguageCode?: string; // e.g., 'en', 'es', only if mode is 'specify'
  };
}
```

**3. Registration and Integration**

In a typical React-based block builder like Typebot, this new block and its panel would be registered as follows:

*   **Block Type Definition:** A central file (e.g., `packages/builder/src/features/blocks/allBlocks.ts` or a plugin system) would hold an array or map of all block type definitions. The "Sentiment Analysis" block would be an object in this collection:

    ```typescript
    // In a block registry file:
    import { SentimentAnalysisBlockPanel } from './integrations/sentimentAnalysis/SentimentAnalysisBlockPanel';
    // If using a custom SVG icon component:
    // import { SentimentAnalysisIconComponent } from './integrations/sentimentAnalysis/SentimentAnalysisIconComponent';

    export const blockDefinitions = [
      // ... other block types
      {
        id: 'sentimentAnalysis', // Matches metadata
        name: 'Sentiment Analysis', // Matches metadata
        icon: 'psychology_alt', // Matches metadata (or SentimentAnalysisIconComponent if custom)
        category: 'AI & Integrations', // Matches metadata
        optionsComponent: SentimentAnalysisBlockPanel, // The React component for the configuration panel
        // Optional: Default options for a newly created block
        defaultOptions: {
          languageConfig: { mode: 'auto' },
          // textToAnalyzeVariableId can be empty or a sensible default like '{{@lastUserInput}}'
        } as SentimentAnalysisBlockOptions,
        // Optional: A component for rendering the block in the flow editor
        // nodeComponent: SentimentAnalysisNodeComponent,
      },
    ];
    ```

*   **Dynamic Rendering:**
    *   The builder's UI (e.g., a sidebar listing available blocks) would read from this registry to show "Sentiment Analysis" as an option.
    *   When the user selects or adds this block to the flow, the builder uses the `id` to find its definition and dynamically renders the `optionsComponent` (i.e., `SentimentAnalysisBlockPanel`) in the configuration area.
    *   The builder passes the current block's `options` data to the panel and an `onOptionsChange` callback function. The panel calls this function whenever the user modifies a setting, allowing the builder to update its internal state and persist the changes.

**4. (Optional) Visual Representation in Flow Editor**

A simple React component could represent the block in the graph:

```typescript
// Example: packages/builder/src/features/blocks/integrations/sentimentAnalysis/SentimentAnalysisNodeDisplay.tsx
import React from 'react';
import { SentimentAnalysisBlockOptions } from '@typebot.io/schemas/features/blocks/integrations/sentimentAnalysis';

interface SentimentAnalysisNodeDisplayProps {
  options: SentimentAnalysisBlockOptions | undefined; // Block options
  // IconComponent: React.ElementType; // Passed in or imported
}

// Assuming a generic NodeCard component exists in Typebot for consistent look and feel
const NodeCard = ({ iconName, title, line1, line2 }: any) => (
  <div style={{
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    width: '180px',
    fontSize: '0.9em',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
      {/* In Typebot, an actual Icon component would be used */}
      <span className="material-icons" style={{ marginRight: '8px', color: '#007bff' }}>{iconName}</span>
      <strong style={{ color: '#343a40' }}>{title}</strong>
    </div>
    {line1 && <p style={{ margin: '2px 0', color: '#495057', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{line1}</p>}
    {line2 && <p style={{ margin: '2px 0', color: '#6c757d', fontSize: '0.85em' }}>{line2}</p>}
  </div>
);


export const SentimentAnalysisNodeDisplay: React.FC<SentimentAnalysisNodeDisplayProps> = ({ options /*, IconComponent */ }) => {
  const textVar = options?.textToAnalyzeVariableId?.replace(/[{}]/g, '') || 'Not set';
  const langDisplay = options?.languageConfig?.mode === 'specify'
    ? options.languageConfig.specificLanguageCode?.toUpperCase()
    : 'Auto-detect';

  return (
    <NodeCard
      iconName="psychology_alt" // Corresponds to the metadata icon
      title="Sentiment" // Short title for the node
      line1={`Text: ${textVar}`}
      line2={`Lang: ${langDisplay}`}
    />
  );
};
```
This `SentimentAnalysisNodeDisplay` component would then be referenced in the block registration (e.g., as `nodeComponent`).

This completes the frontend implementation tasks as specified. The `SentimentAnalysisBlockPanel.tsx` is the primary deliverable, along with the metadata and registration explanation.
