import type { CustomFont } from "@typebot.io/theme/schemas";
import { Field } from "@typebot.io/ui/components/Field";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { DebouncedTextInput } from "@/components/inputs/DebouncedTextInput";

type Props = {
  font: CustomFont;
  onFontChange: (font: CustomFont) => void;
};

export const CustomFontForm = ({ font, onFontChange }: Props) => {
  const updateFamily = (family: string) => onFontChange({ ...font, family });
  const updateCss = (css: string) => onFontChange({ ...font, css });
  return (
    <div className="flex flex-col gap-2">
      <Field.Root className="flex-row items-center">
        <Field.Label>Family:</Field.Label>
        <DebouncedTextInput
          placeholder='MyAwesomeWebFont, "Helvetica Neue", sans-serif'
          defaultValue={font.family}
          onValueChange={updateFamily}
        />
      </Field.Root>
      <CodeEditor
        onChange={updateCss}
        defaultValue={font.css}
        lang="css"
        placeholder={`@font-face {
  font-family: 'MyAwesomeWebFont';
  src: url('https://example.com/webfont.woff') format('woff'),
    url('https://example.com/webfont.ttf') format('truetype');
}`}
        maxHeight="200px"
      />
    </div>
  );
};
