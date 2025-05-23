import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SentimentAnalysisBlockPanel } from './SentimentAnalysisBlockPanel';
import { SentimentAnalysisBlockOptions } from '@typebot.io/schemas/features/blocks/integrations/sentimentAnalysis';
import { BlockWithOptions, Variable } from '@typebot.io/schemas';

// Mock Typebot's UI components used in the Panel
// These are simplified mocks focusing on the interaction logic.
jest.mock('./SentimentAnalysisBlockPanel', () => {
  const originalModule = jest.requireActual('./SentimentAnalysisBlockPanel');
  
  const MockedDropdown = ({ label, value, onChange, options, placeholder, disabled }: any) => (
    <div data-testid={`dropdown-${label?.toLowerCase().replace(/\s+/g, '-')}`}>
      <label htmlFor={label}>{label}</label>
      <select id={label} value={value} onChange={onChange} disabled={disabled} data-testid="select">
        {placeholder && <option value="">{placeholder}</option>}
        {options?.map((opt: { value: string; label: string }) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  const MockedRadioGroup = ({ label, value, onChange, options, name }: any) => (
    <fieldset data-testid={`radiogroup-${label?.toLowerCase().replace(/\s+/g, '-')}`}>
      <legend>{label}</legend>
      {options?.map((opt: { value: string; label: string }) => (
        <label key={opt.value}>
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={onChange}
          />
          {opt.label}
        </label>
      ))}
    </fieldset>
  );
  
  return {
    ...originalModule, // Import and retain all non-component exports
    // Override components with mocks IF THEY ARE DEFINED IN THE SAME FILE.
    // If they are imported from a UI library, we'd mock that library.
    // For this setup, assuming Dropdown, RadioGroup etc. are illustrative and part of the panel file,
    // or we are testing the actual components if they are simple enough.
    // Given the prompt, it's better to assume we are testing the panel's logic around these.
    // If these were imported (e.g. from '@typebot/ui-kit'), we'd do:
    // jest.mock('@typebot/ui-kit', () => ({
    //   ...jest.requireActual('@typebot/ui-kit'),
    //   Dropdown: (props) => <MockedDropdown {...props} />,
    //   RadioGroup: (props) => <MockedRadioGroup {...props} />,
    // }));
    // For this test, we'll assume they are simple enough or we are effectively testing them too.
  };
});


const mockAvailableVariables: Pick<Variable, 'id' | 'name'>[] = [
  { id: 'var1', name: 'User Feedback' },
  { id: 'var2', name: 'Last Reply' },
  { id: 'var3', name: 'Product Name' },
];

const mockBlockWithOptions = (options?: SentimentAnalysisBlockOptions): BlockWithOptions<SentimentAnalysisBlockOptions> => ({
  id: 'blockId1',
  type: 'sentimentAnalysis', // This should match the block's type id
  options: options ?? {
    textToAnalyzeVariableId: '',
    languageConfig: { mode: 'auto' },
  },
  groupId: 'group1',
});


describe('SentimentAnalysisBlockPanel', () => {
  let mockOnOptionsChange: jest.Mock;

  beforeEach(() => {
    mockOnOptionsChange = jest.fn();
  });

  const renderPanel = (blockOptions?: SentimentAnalysisBlockOptions) => {
    return render(
      <SentimentAnalysisBlockPanel
        block={mockBlockWithOptions(blockOptions)}
        onOptionsChange={mockOnOptionsChange}
        availableVariables={mockAvailableVariables}
      />
    );
  };

  test('renders initial fields correctly with default options', () => {
    renderPanel();
    // Check Text to Analyze Dropdown
    expect(screen.getByLabelText('Text to Analyze:')).toBeInTheDocument();
    const textVariableDropdown = screen.getByTestId('dropdown-text-to-analyze:');
    expect(within(textVariableDropdown).getByRole('combobox')).toHaveValue(''); // Default empty

    // Check Language Detection Method Radio Group
    expect(screen.getByLabelText('Language Detection Method:')).toBeInTheDocument();
    expect(screen.getByLabelText('Auto-detect')).toBeChecked();
    expect(screen.getByLabelText('Specify Language')).not.toBeChecked();
    
    // Check Select Language Dropdown (should be disabled)
    const langDropdown = screen.getByTestId('dropdown-select-language:');
    expect(within(langDropdown).getByRole('combobox')).toBeDisabled();

    // Check Output Variables Display
    expect(screen.getByText('{{@sentiment.label}}')).toBeInTheDocument();
    expect(screen.getByText('{{@sentiment.score}}')).toBeInTheDocument();
    expect(screen.getByText('{{@sentiment.languageCode}}')).toBeInTheDocument();
  });

  test('initializes with existing block options', () => {
    const existingOptions: SentimentAnalysisBlockOptions = {
      textToAnalyzeVariableId: `{{${mockAvailableVariables[0].id}}}`,
      languageConfig: { mode: 'specify', specificLanguageCode: 'es' },
    };
    renderPanel(existingOptions);

    const textVariableDropdown = screen.getByTestId('dropdown-text-to-analyze:');
    expect(within(textVariableDropdown).getByRole('combobox')).toHaveValue(`{{${mockAvailableVariables[0].id}}}`);
    
    expect(screen.getByLabelText('Specify Language')).toBeChecked();
    const langDropdown = screen.getByTestId('dropdown-select-language:');
    expect(within(langDropdown).getByRole('combobox')).not.toBeDisabled();
    expect(within(langDropdown).getByRole('combobox')).toHaveValue('es');
  });

  test('updates textToAnalyzeVariableId and calls onOptionsChange', () => {
    renderPanel();
    const textVariableDropdown = screen.getByTestId('dropdown-text-to-analyze:');
    const selectElement = within(textVariableDropdown).getByRole('combobox');
    
    fireEvent.change(selectElement, { target: { value: `{{${mockAvailableVariables[1].id}}}` } });
    
    expect(selectElement).toHaveValue(`{{${mockAvailableVariables[1].id}}}`);
    expect(mockOnOptionsChange).toHaveBeenCalledTimes(1);
    expect(mockOnOptionsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        textToAnalyzeVariableId: `{{${mockAvailableVariables[1].id}}}`,
      })
    );
  });

  test('updates language mode to "specify" and calls onOptionsChange', () => {
    renderPanel();
    const specifyRadio = screen.getByLabelText('Specify Language');
    fireEvent.click(specifyRadio);

    expect(specifyRadio).toBeChecked();
    const langDropdown = screen.getByTestId('dropdown-select-language:');
    expect(within(langDropdown).getByRole('combobox')).not.toBeDisabled();
    
    expect(mockOnOptionsChange).toHaveBeenCalledTimes(1);
    expect(mockOnOptionsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        languageConfig: { mode: 'specify', specificLanguageCode: undefined }, // Initially undefined
      })
    );
  });

  test('updates specified language and calls onOptionsChange', () => {
    // Start with 'specify' mode to enable the language dropdown
    const initialOptions: SentimentAnalysisBlockOptions = {
      textToAnalyzeVariableId: '',
      languageConfig: { mode: 'specify', specificLanguageCode: 'en' },
    };
    renderPanel(initialOptions);

    const langDropdownContainer = screen.getByTestId('dropdown-select-language:');
    const langSelectElement = within(langDropdownContainer).getByRole('combobox');

    fireEvent.change(langSelectElement, { target: { value: 'fr' } });
    
    expect(langSelectElement).toHaveValue('fr');
    expect(mockOnOptionsChange).toHaveBeenCalledTimes(1);
    expect(mockOnOptionsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        languageConfig: { mode: 'specify', specificLanguageCode: 'fr' },
      })
    );
  });

  test('switches from "specify" with a language to "auto-detect" mode correctly', () => {
    const initialOptions: SentimentAnalysisBlockOptions = {
      textToAnalyzeVariableId: '',
      languageConfig: { mode: 'specify', specificLanguageCode: 'es' },
    };
    renderPanel(initialOptions);

    const autoDetectRadio = screen.getByLabelText('Auto-detect');
    fireEvent.click(autoDetectRadio);

    expect(autoDetectRadio).toBeChecked();
    const langDropdown = screen.getByTestId('dropdown-select-language:');
    expect(within(langDropdown).getByRole('combobox')).toBeDisabled(); // Important: language dropdown becomes disabled
    
    expect(mockOnOptionsChange).toHaveBeenCalledTimes(1);
    expect(mockOnOptionsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        languageConfig: { mode: 'auto', specificLanguageCode: undefined }, // specificLanguageCode is cleared/undefined
      })
    );
  });

  test('availableVariables are correctly populated in the dropdown', () => {
    renderPanel();
    const textVariableDropdown = screen.getByTestId('dropdown-text-to-analyze:');
    const selectElement = within(textVariableDropdown).getByRole('combobox');
    
    const options = within(selectElement).getAllByRole('option');
    // +1 for the placeholder
    expect(options.length).toBe(mockAvailableVariables.length + 1); 
    expect(options[1]).toHaveTextContent(mockAvailableVariables[0].name);
    expect(options[1]).toHaveValue(`{{${mockAvailableVariables[0].id}}}`);
  });

});

/**
 * Mocking Strategy Explanation:
 * 
 * 1.  Typebot UI Components (`Dropdown`, `RadioGroup`):
 *     The `SentimentAnalysisBlockPanel.tsx` file, as provided in the previous step,
 *     defined its own simple Dropdown, RadioGroup, Section, and ReadOnlyVariablesList
 *     components directly within its file (as placeholders for actual Typebot UI library components).
 *     
 *     For these tests:
 *     - If these components were simple and defined in the panel file itself (as they were in the example),
 *       the tests naturally use these actual simple implementations. This is what's happening with the
 *       current test setup as `jest.mock('./SentimentAnalysisBlockPanel', ...)` is used to mock
 *       parts of the module *if needed*, but the panel itself uses its internal components.
 *     - The `jest.mock` at the top of this test file is more of a placeholder to illustrate how one *would*
 *       mock them if they were complex or came from an external library like `@typebot.io/ui-kit`.
 *       In this specific case, because the "mocked" components in the panel are so simple and directly used,
 *       we are effectively testing the interactions with these simple versions.
 *     - The primary focus is on the panel's logic: how it handles `block.options`, calls `onOptionsChange`,
 *       and manages internal state transitions (like enabling/disabling the language dropdown).
 *
 * 2.  Props (`block`, `onOptionsChange`, `availableVariables`):
 *     - `block`: A mock `BlockWithOptions<SentimentAnalysisBlockOptions>` object is created using `mockBlockWithOptions`
 *       helper function. This allows us to simulate different initial states for the panel.
 *     - `onOptionsChange`: A `jest.fn()` is used to spy on this callback, ensuring it's called with the
 *       correct new options when the user interacts with the form elements.
 *     - `availableVariables`: A static array `mockAvailableVariables` is provided to populate the variable
 *       selection dropdown.
 *
 * 3.  Testing Library:
 *     - `@testing-library/react` is used for rendering the component and interacting with it (`render`, `screen`, `fireEvent`).
 *     - `@testing-library/jest-dom` provides custom matchers for easier assertions (e.g., `toBeInTheDocument`, `toBeChecked`, `toHaveValue`).
 *
 * The key is that we are testing the *behavior* of `SentimentAnalysisBlockPanel` – does it render correctly based on props, and does it call `onOptionsChange` with the right data when inputs change? – rather than the detailed implementation of each sub-component (which would have their own unit tests if they were part of a shared UI library).
 */
