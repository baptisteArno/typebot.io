"use client";

import { nanoid } from "nanoid";
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
  width?: "25" | "50" | "75" | "100";
  options?: string[]; // For select/radio/multicheck
}

// Main component
export const HtmlFormGenerator = () => {
  const [formElements, setFormElements] = useState<FormElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);

  // Component Palette items
  const paletteItems: Omit<FormElement, "id">[] = [
    { type: "text", label: "Text Input" },
    { type: "email", label: "Email Input" },
    { type: "phone", label: "Phone Input" },
    { type: "select", label: "Dropdown", options: ["Option 1", "Option 2"] },
    { type: "radio", label: "Radio Group", options: ["Option 1", "Option 2"] },
    {
      type: "multicheck",
      label: "Multi Checkbox",
      options: ["Option 1", "Option 2"],
    },
    { type: "checkbox", label: "Single Checkbox" },
    { type: "textarea", label: "Text Area" },
  ];

  const addElement = (item: Omit<FormElement, "id">) => {
    const newElement: FormElement = {
      ...item,
      id: nanoid(),
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
    <div className="w-[1200px] mx-auto max-w-[90vw] left-1/2 -translate-x-1/2 relative bg-gray-2">
      <div className="flex">
        <ComponentsPalette items={paletteItems} onAddElement={addElement} />
        <div className="flex-1 mx-4">
          <FormCanvas
            elements={formElements}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            onRemoveElement={removeElement}
          />
          <div className="flex gap-2 mt-4 justify-end">
            <button
              onClick={() => setShowLivePreview(true)}
              className="px-4 py-2 rounded-md transition-colors"
              style={{
                background: "rgb(var(--purple-9))",
                color: "rgb(var(--gray-1))",
              }}
            >
              View Live Form
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 rounded-md transition-colors hover:bg-blue-10"
              style={{
                background: "rgb(var(--blue-9))",
                color: "rgb(var(--gray-1))",
              }}
            >
              Export HTML
            </button>
          </div>
        </div>
        <PropertiesPanel
          selectedElement={
            selectedElement
              ? (formElements.find((el) => el.id === selectedElement) ?? null)
              : null
          }
          onUpdate={(updates) => {
            setFormElements((elements) =>
              elements.map((el) =>
                el.id === selectedElement ? { ...el, ...updates } : el,
              ),
            );
          }}
        />
        {showExportModal && (
          <ExportModal
            html={generateHtmlCode()}
            onClose={() => setShowExportModal(false)}
          />
        )}
        {showLivePreview && (
          <LivePreviewModal
            elements={formElements}
            onClose={() => setShowLivePreview(false)}
          />
        )}
      </div>
    </div>
  );
};

// Export Modal Component
const ExportModal = ({
  html,
  onClose,
}: { html: string; onClose: () => void }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(html);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Export HTML</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
          <code>{html}</code>
        </pre>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Copy to Clipboard
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
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
    <div className=" p-6 bg-white rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Form Components</h2>
      <div className="grid gap-3">
        {items.map((item) => (
          <button
            key={item.type}
            onClick={() => onAddElement(item)}
            className="flex items-center p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors group"
          >
            <span className="flex-1">{item.label}</span>
            <span className="text-gray-400 group-hover:text-gray-600">+</span>
          </button>
        ))}
      </div>
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
    <div className="bg-white p-8 rounded-lg min-h-[600px]">
      <div className="space-y-4">
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
    <div
      className={`relative p-4 border rounded group ${
        isSelected ? "border-blue-500" : "border-gray-200"
      }`}
      style={{ width: `${element.width || 100}%` }}
      onClick={onClick}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
      </button>
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
              <input
                type="radio"
                name={`preview-${element.id}`}
                className="h-4 w-4"
                disabled
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
              <input type="checkbox" className="h-4 w-4" disabled />
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
        <input
          type={element.type === "textarea" ? "text" : element.type}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder={element.placeholder}
          disabled
        />
      )}
    </div>
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
      <div className="w-64 bg-white p-4 rounded-lg">
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
    <div className="w-64 bg-white p-4 border-l border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <div className="space-y-4">
        {/* Label Field */}
        <div>
          <label
            htmlFor="element-label"
            className="block text-sm font-medium"
            style={{ color: "rgb(var(--gray-11))" }}
          >
            Label
          </label>
          <input
            id="element-label"
            type="text"
            value={selectedElement.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
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
            <input
              id="element-placeholder"
              type="text"
              value={selectedElement.placeholder || ""}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>
        )}

        {/* Required Field */}
        <div className="flex items-center gap-2">
          <input
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
          <select
            value={selectedElement.width || "100"}
            onChange={(e) =>
              onUpdate({ width: e.target.value as "25" | "50" | "75" | "100" })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
          >
            <option value="25">25%</option>
            <option value="50">50%</option>
            <option value="75">75%</option>
            <option value="100">100%</option>
          </select>
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
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionsChange(index, e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm p-2"
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="p-2 text-gray-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="w-full p-2 rounded-md text-sm"
                style={{
                  background: "rgb(var(--gray-3))",
                  color: "rgb(var(--gray-11))",
                }}
              >
                Add Option
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add new LivePreviewModal component
const LivePreviewModal = ({
  elements,
  onClose,
}: {
  elements: FormElement[];
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Live Form Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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
          </button>
        </div>
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
                  className="w-full p-2 border rounded-md"
                  required={element.required}
                  placeholder={element.placeholder}
                />
              ) : element.type === "select" ? (
                <select
                  id={element.id}
                  className="w-full p-2 border rounded-md"
                  required={element.required}
                >
                  {element.options?.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
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
              ) : (
                <input
                  id={element.id}
                  type={element.type}
                  className="w-full p-2 border rounded-md"
                  required={element.required}
                  placeholder={element.placeholder}
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            className="w-full p-2 rounded-md transition-colors hover:bg-blue-10"
            style={{
              background: "rgb(var(--blue-9))",
              color: "rgb(var(--gray-1))",
            }}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};
