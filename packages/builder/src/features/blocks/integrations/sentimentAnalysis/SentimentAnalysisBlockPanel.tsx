import React, { useState, useEffect } from 'react';
import { BlockWithOptions, Variable } from '@typebot.io/schemas';
// Assuming the path for SentimentAnalysisBlockOptions will be:
import { SentimentAnalysisBlockOptions } from '@typebot.io/schemas/features/blocks/integrations/sentimentAnalysis';

// Mock/Placeholder components for Typebot's UI library
// In a real scenario, these would be imported from Typebot's actual UI component library.
// These are simplified for this example.
const Dropdown = ({ label, value, onChange, options, placeholder, searchable, allowCustomValue, disabled }: {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  searchable?: boolean;
  allowCustomValue?: boolean;
  disabled?: boolean;
}) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{label}</label>
    <select value={value} onChange={onChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} disabled={disabled}>
      {placeholder && <option value="">{placeholder}</option>}
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {/* {searchable && <small> (Searchable)</small>}
    {allowCustomValue && <small> (Allows custom)</small>} */}
  </div>
);

const RadioGroup = ({ label, value, onChange, options, name }: {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  options: Array<{ value: string; label: string }>;
  name: string;
}) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{label}</label>
    {options?.map((opt) => (
      <label key={opt.value} style={{ marginRight: '1rem', fontWeight: 'normal' }}>
        <input type="radio" value={opt.value} checked={opt.value === value} onChange={onChange} name={name} style={{ marginRight: '0.25rem' }}/>
        {opt.label}
      </label>
    ))}
  </div>
);

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div style={{ border: '1px solid #e0e0e0', padding: '1rem', marginBottom: '1.5rem', borderRadius: '6px', backgroundColor: '#fdfdfd' }}>
    <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1em', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>{title}</h3>
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
  { value: 'en', label: 'English (en)' },
  { value: 'es', label: 'Spanish (es)' },
  { value: 'fr', label: 'French (fr)' },
  { value: 'de', label: 'German (de)' },
  { value: 'pt', label: 'Portuguese (pt)' },
  { value: 'it', label: 'Italian (it)' },
  { value: 'ja', label: 'Japanese (ja)' },
  { value: 'ko', label: 'Korean (ko)' },
  { value: 'zh-CN', label: 'Chinese (Simplified, zh-CN)' },
  { value: 'zh-TW', label: 'Chinese (Traditional, zh-TW)' },
  // Add more as needed; "Auto-detect" is handled by a separate radio button.
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
  // Initialize options, ensuring languageConfig is always well-defined
  const getInitialOptions = (): SentimentAnalysisBlockOptions => {
    const defaultOptions: SentimentAnalysisBlockOptions = {
      textToAnalyzeVariableId: '',
      languageConfig: { mode: 'auto', specificLanguageCode: undefined },
    };
    
    const blockOptions = block.options ?? {};
    
    return {
      ...defaultOptions,
      ...blockOptions,
      languageConfig: {
        ...defaultOptions.languageConfig,
        ...(blockOptions.languageConfig ?? {}),
      },
    };
  };

  const [currentOptions, setCurrentOptions] = useState<SentimentAnalysisBlockOptions>(getInitialOptions());

  // Effect to sync with external changes to block.options (e.g., undo/redo, loading a typebot)
  useEffect(() => {
    setCurrentOptions(getInitialOptions());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.options]);


  const handleChange = (newPartialOptions: Partial<SentimentAnalysisBlockOptions>) => {
    // Ensure that when changing parts of languageConfig, the whole object is preserved correctly
    let updatedOptions: SentimentAnalysisBlockOptions;
    if (newPartialOptions.languageConfig) {
      updatedOptions = { 
        ...currentOptions, 
        ...newPartialOptions, 
        languageConfig: { ...currentOptions.languageConfig, ...newPartialOptions.languageConfig } 
      };
    } else {
      updatedOptions = { ...currentOptions, ...newPartialOptions };
    }
    
    setCurrentOptions(updatedOptions);
    onOptionsChange(updatedOptions);
  };

  const handleLanguageModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mode = e.target.value as 'auto' | 'specify';
    handleChange({
      languageConfig: {
        // Preserve existing specificLanguageCode if switching from specify to auto then back to specify
        ...(currentOptions.languageConfig), 
        mode,
        specificLanguageCode: mode === 'auto' ? undefined : currentOptions.languageConfig?.specificLanguageCode,
      },
    });
  };

  const handleSpecificLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const specificLanguageCode = e.target.value;
    handleChange({
      languageConfig: {
        ...(currentOptions.languageConfig!), // mode should already be 'specify'
        mode: 'specify', 
        specificLanguageCode,
      },
    });
  };

  const handleTextVariableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange({ textToAnalyzeVariableId: e.target.value });
  };

  const variableDropdownOptions = availableVariables.map(v => ({
    value: `{{${v.id}}}`, // Typebot's variable format
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
        <small style={{ color: '#6c757d', marginTop: '0.25rem', display: 'block' }}>
          Choose the variable containing the text you want to analyze (e.g., from a user input).
        </small>
      </Section>

      <Section title="Language">
        <RadioGroup
          label="Language Detection Method:"
          name="languageModeSentiment" // Unique name for radio group
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
          options={commonLanguages}
          value={currentOptions.languageConfig?.specificLanguageCode ?? ''}
          onChange={handleSpecificLanguageChange}
          disabled={currentOptions.languageConfig?.mode !== 'specify'}
          searchable={true}
        />
        <small style={{ color: '#6c757d', marginTop: '0.25rem', display: 'block' }}>
          'Auto-detect' is recommended. Specify if you know the language or for potentially higher accuracy.
        </small>
      </Section>

      <Section title="Output Variables">
        <p style={{ fontSize: '0.95em', color: '#495057', marginBottom: '0.75rem' }}>
          This block automatically provides the following variables after execution:
        </p>
        <ReadOnlyVariablesList variables={outputVariablesInfo} />
        <small style={{ color: '#6c757d', marginTop: '1rem', display: 'block' }}>
          Use these variables in subsequent blocks, like "Condition" or to display results.
        </small>
      </Section>
    </div>
  );
};
