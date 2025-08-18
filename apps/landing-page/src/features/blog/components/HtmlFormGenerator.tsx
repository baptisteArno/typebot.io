import { Card } from "@/components/Card";
import { IconButton } from "@/components/IconButton";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { Input } from "@typebot.io/ui/components/Input";
import { Select } from "@typebot.io/ui/components/Select";
import { CloseIcon } from "@typebot.io/ui/icons/CloseIcon";
import { cx } from "@typebot.io/ui/lib/cva";
import { useState } from "react";

// Types for our form elements
interface FormElement {
  id: string;
  type:
    | "text"
    | "email"
    | "phone"
    | "select"
    | "checkbox"
    | "textarea"
    | "radio"
    | "multicheck";
  label: string;
  placeholder?: string;
  required?: boolean;
  width?: string;
  options?: string[]; // For select/radio/multicheck
}
const WIDTH_OPTIONS = [
  { label: "25%", value: "25" },
  { label: "50%", value: "50" },
  { label: "75%", value: "75" },
  { label: "100%", value: "100" },
];

// Main component
export const HtmlFormGenerator = () => {
  const [formElements, setFormElements] = useState<FormElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);

  const addElement = (item: Omit<FormElement, "id">) => {
    const newElement: FormElement = {
      ...item,
      id: Math.random().toString(36).substring(2, 15),
    };
    setFormElements([...formElements, newElement]);
  };

  const removeElement = (id: string) => {
    setFormElements((elements) => elements.filter((el) => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const generateHtmlCode = () => {
    let html = '<form class="max-w-2xl mx-auto p-4">\n';
    formElements.forEach((element) => {
      html += '  <div class="mb-4">\n';
      html += `    <label class="block text-sm font-medium text-gray-700 mb-1">${element.label}</label>\n`;

      switch (element.type) {
        case "textarea":
          html += `    <textarea class="w-full p-2 border rounded-md" ${element.required ? "required" : ""}></textarea>\n`;
          break;
        case "select":
          html += `    <select class="w-full p-2 border rounded-md" ${element.required ? "required" : ""}>\n`;
          element.options?.forEach((option) => {
            html += `      <option>${option}</option>\n`;
          });
          html += "    </select>\n";
          break;
        case "checkbox":
          html += `    <input type="checkbox" class="h-4 w-4 text-blue-600" ${element.required ? "required" : ""}/>\n`;
          break;
        default:
          html += `    <input type="${element.type}" class="w-full p-2 border rounded-md" ${element.required ? "required" : ""}/>\n`;
      }

      html += "  </div>\n";
    });
    html +=
      '  <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">Submit</button>\n';
    html += "</form>";
    return html;
  };

  return (
    <div className="px-4 -mx-[calc((100vw-min(100vw,42rem))/2)] py-12">
      <div className="flex flex-col md:flex-row items-stretch md:items-start gap-4 max-w-6xl mx-auto">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Add input</h2>
          <ComponentsPalette
            items={[
              { type: "text", label: "Text Input" },
              { type: "email", label: "Email Input" },
              { type: "phone", label: "Phone Input" },
              { type: "textarea", label: "Text Area" },
              {
                type: "select",
                label: "Select Dropdown",
                options: ["Option 1", "Option 2", "Option 3"],
              },
              { type: "checkbox", label: "Checkbox" },
              {
                type: "radio",
                label: "Radio Buttons",
                options: ["Option 1", "Option 2", "Option 3"],
              },
              {
                type: "multicheck",
                label: "Multiple Checkboxes",
                options: ["Option 1", "Option 2", "Option 3"],
              },
            ]}
            onAddElement={addElement}
          />
        </Card>
        <Card className="p-4 flex-1">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Layout</h2>
            <div className="flex flex-col md:flex-row gap-2">
              <Button
                onClick={() => setShowLivePreview(true)}
                variant="secondary"
                size="sm"
              >
                Live Preview
              </Button>
              <Button onClick={() => setShowExportModal(true)} size="sm">
                Generate HTML
              </Button>
            </div>
          </div>
          <FormCanvas
            elements={formElements}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            onRemoveElement={removeElement}
          />
        </Card>
        {selectedElement && (
          <Card className="p-4">
            <PropertiesPanel
              selectedElement={
                selectedElement
                  ? formElements.find((el) => el.id === selectedElement) || null
                  : null
              }
              onUpdate={(updates) => {
                setFormElements((prev) =>
                  prev.map((el) =>
                    el.id === selectedElement ? { ...el, ...updates } : el,
                  ),
                );
              }}
            />
          </Card>
        )}
      </div>

      <ExportModal
        isOpen={showExportModal}
        html={generateHtmlCode()}
        onClose={() => setShowExportModal(false)}
      />

      <LivePreviewModal
        isOpened={showLivePreview}
        elements={formElements}
        onClose={() => setShowLivePreview(false)}
      />
    </div>
  );
};

// Export Modal Component
const ExportModal = ({
  isOpen,
  html,
  onClose,
}: {
  isOpen: boolean;
  html: string;
  onClose: () => void;
}) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(html);
  };

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup>
        <Dialog.Title className="text-2xl">Generated HTML</Dialog.Title>
        <Dialog.CloseButton />
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-sm">
          {html}
        </pre>
        <Button
          onClick={copyToClipboard}
          variant="secondary"
          className="w-full"
        >
          Copy to Clipboard
        </Button>
      </Dialog.Popup>
    </Dialog.Root>
  );
};

// Components Palette
const ComponentsPalette = ({
  items,
  onAddElement,
}: {
  items: Omit<FormElement, "id">[];
  onAddElement: (item: Omit<FormElement, "id">) => void;
}) => {
  return (
    <div className="flex flex-col gap-3 max-h-72 overflow-y-auto md:max-h-full">
      {items.map((item, index) => (
        <Card
          key={index}
          className="p-3 cursor-pointer hover:bg-gray-2 transition-colors"
          onClick={() => onAddElement(item)}
        >
          <div className="text-center">
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Form Canvas with updated styles...
const FormCanvas = ({
  elements,
  selectedElement,
  setSelectedElement,
  onRemoveElement,
}: {
  elements: FormElement[];
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  onRemoveElement: (id: string) => void;
}) => {
  return (
    <div className="bg-white p-8 rounded-lg w-full ">
      <div className="space-y-4 max-h-72 overflow-y-auto md:max-h-full">
        {elements.map((element) => (
          <FormElement
            key={element.id}
            element={element}
            isSelected={element.id === selectedElement}
            onClick={() => setSelectedElement(element.id)}
            onRemove={() => onRemoveElement(element.id)}
          />
        ))}
        {elements.length === 0 && (
          <div className="text-center py-16 text-gray-500 border-2 border-dashed rounded-xl">
            <p className="text-lg mb-2">Your form is empty</p>
            <p className="text-sm">
              Click on components from the left panel to add them here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Form Element
const FormElement = ({
  element,
  isSelected,
  onClick,
  onRemove,
}: {
  element: FormElement;
  isSelected: boolean;
  onClick: () => void;
  onRemove: () => void;
}) => {
  return (
    <Card
      className={cx(
        "relative p-4 cursor-pointer hover:filter hover:brightness-95 transition-all",
        isSelected && "border-blue-500",
      )}
      style={{ width: `${element.width || 100}%` }}
      onClick={onClick}
    >
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        variant="ghost"
        size="xs"
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
        title="Remove element"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </Button>
      <span
        className="block text-sm font-medium"
        style={{ color: "rgb(var(--gray-11))" }}
      >
        {element.label}
      </span>
      {element.type === "radio" ? (
        <div className="mt-2 space-y-2">
          {element.options?.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="radio"
                name={`preview-${element.id}`}
                className="h-4 w-4 pointer-events-none"
              />
              <span
                className="text-sm"
                style={{ color: "rgb(var(--gray-11))" }}
              >
                {option}
              </span>
            </div>
          ))}
        </div>
      ) : element.type === "multicheck" ? (
        <div className="mt-2 space-y-2">
          {element.options?.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input type="checkbox" className="h-4 w-4 pointer-events-none" />
              <span
                className="text-sm"
                style={{ color: "rgb(var(--gray-11))" }}
              >
                {option}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <Input
          type={element.type === "textarea" ? "text" : element.type}
          className="mt-1 block w-full pointer-events-none"
          placeholder={element.placeholder}
        />
      )}
    </Card>
  );
};

// Properties Panel
const PropertiesPanel = ({
  selectedElement,
  onUpdate,
}: {
  selectedElement: FormElement | null;
  onUpdate: (updates: Partial<FormElement>) => void;
}) => {
  if (!selectedElement) {
    return (
      <div className="w-full">
        <p style={{ color: "rgb(var(--gray-9))" }}>
          Select an element to edit its properties
        </p>
      </div>
    );
  }

  // Function to handle options changes for select elements
  const handleOptionsChange = (optionIndex: number, newValue: string) => {
    if (!selectedElement.options) return;
    const newOptions = [...selectedElement.options];
    newOptions[optionIndex] = newValue;
    onUpdate({ options: newOptions });
  };

  const addOption = () => {
    const newOptions = [
      ...(selectedElement.options || []),
      `Option ${(selectedElement.options?.length || 0) + 1}`,
    ];
    onUpdate({ options: newOptions });
  };

  const removeOption = (index: number) => {
    if (!selectedElement.options) return;
    const newOptions = selectedElement.options.filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <div className="space-y-4">
        {/* label Field */}
        <div>
          <label
            htmlFor="element-label"
            className="block text-sm font-medium"
            style={{ color: "rgb(var(--gray-11))" }}
          >
            Label
          </label>
          <Input
            id="element-label"
            type="text"
            value={selectedElement.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="mt-1"
          />
        </div>

        {/* Placeholder Field (for text, email, phone inputs) */}
        {["text", "email", "phone"].includes(selectedElement.type) && (
          <div>
            <label
              htmlFor="element-placeholder"
              className="block text-sm font-medium"
              style={{ color: "rgb(var(--gray-11))" }}
            >
              Placeholder
            </label>
            <Input
              id="element-placeholder"
              type="text"
              value={selectedElement.placeholder || ""}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              className="mt-1"
            />
          </div>
        )}

        {/* Required Field */}
        <div className="flex items-center gap-2">
          <Input
            id="element-required"
            type="checkbox"
            checked={selectedElement.required || false}
            onChange={(e) => onUpdate({ required: e.target.checked })}
            className="h-4 w-4 text-blue-600"
          />
          <label
            htmlFor="element-required"
            className="text-sm font-medium"
            style={{ color: "rgb(var(--gray-11))" }}
          >
            Required
          </label>
        </div>

        {/* Width Selection */}
        <div>
          <span
            className="block text-sm font-medium mb-1"
            style={{ color: "rgb(var(--gray-11))" }}
          >
            Width
          </span>
          <Select.Root
            items={WIDTH_OPTIONS}
            onValueChange={(value) => onUpdate({ width: value })}
          >
            <Select.Trigger />
            <Select.Popup>
              {WIDTH_OPTIONS.map((item) => (
                <Select.Item key={item.value} value={item.value}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Root>
        </div>

        {/* Options for Select/Radio/MultiCheck */}
        {(selectedElement.type === "select" ||
          selectedElement.type === "radio" ||
          selectedElement.type === "multicheck") && (
          <div>
            <span
              className="block text-sm font-medium mb-1"
              style={{ color: "rgb(var(--gray-11))" }}
            >
              Options
            </span>
            <div className="space-y-2">
              {selectedElement.options?.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionsChange(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => removeOption(index)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-500"
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                onClick={addOption}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                Add Option
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add new LivePreviewModal component
const LivePreviewModal = ({
  isOpened,
  elements,
  onClose,
}: {
  isOpened: boolean;
  elements: FormElement[];
  onClose: () => void;
}) => {
  return (
    <Dialog.Root isOpen={isOpened} onClose={onClose}>
      <Dialog.Popup>
        <Dialog.Title className="text-2xl mb-8">Live Form Preview</Dialog.Title>
        <Dialog.CloseButton />

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {elements.map((element) => (
            <div
              key={element.id}
              className="mb-4"
              style={{ width: `${element.width || 100}%` }}
            >
              <label
                htmlFor={element.id}
                className="block text-sm font-medium mb-1"
                style={{ color: "rgb(var(--gray-11))" }}
              >
                {element.label}
              </label>
              {element.type === "textarea" ? (
                <textarea
                  id={element.id}
                  className="w-full p-2 border border-input rounded-md"
                  required={element.required}
                  placeholder={element.placeholder}
                />
              ) : element.type === "select" ? (
                <Select.Root
                  items={element.options?.map((option) => ({
                    label: option,
                    value: option,
                  }))}
                >
                  <Select.Trigger />
                  <Select.Popup>
                    {element.options?.map((option) => (
                      <Select.Item key={option} value={option}>
                        {option}
                      </Select.Item>
                    ))}
                  </Select.Popup>
                </Select.Root>
              ) : element.type === "radio" ? (
                <div className="space-y-2">
                  {element.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`${element.id}-${index}`}
                        name={element.id}
                        required={element.required}
                      />
                      <label htmlFor={`${element.id}-${index}`}>{option}</label>
                    </div>
                  ))}
                </div>
              ) : element.type === "multicheck" ? (
                <div className="space-y-2">
                  {element.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`${element.id}-${index}`}
                        name={`${element.id}[]`}
                      />
                      <label htmlFor={`${element.id}-${index}`}>{option}</label>
                    </div>
                  ))}
                </div>
              ) : element.type === "checkbox" ? (
                <input
                  id={element.id}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600"
                  required={element.required}
                />
              ) : element.type === "phone" ? (
                <Input
                  id={element.id}
                  type="tel"
                  required={element.required}
                  placeholder={element.placeholder}
                />
              ) : (
                <Input
                  id={element.id}
                  type={element.type}
                  required={element.required}
                  placeholder={element.placeholder}
                />
              )}
            </div>
          ))}
          <Button className="w-full" onClick={(e) => e.preventDefault()}>
            Submit
          </Button>
        </form>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
