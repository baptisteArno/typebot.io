import { createElement, useState } from "react";
import { createRoot } from "react-dom/client";
import { IsolatedPreview } from "../../apps/builder/src/features/preview/components/IsolatedPreview";
import { Preview } from "../../apps/viewer/src/features/preview/Preview";
import { executeScript } from "../../packages/embeds/js/src/features/blocks/logic/script/executeScript";
import { executeSetVariable } from "../../packages/embeds/js/src/features/blocks/logic/setVariable/executeSetVariable";

Object.assign(window, { executeScript, executeSetVariable });

const receivedLogs: unknown[] = [];

const Host = () => {
  const [generation, setGeneration] = useState(0);
  const [progress, setProgress] = useState(false);
  const [color, setColor] = useState("#ffffff");
  return createElement(
    "main",
    {},
    createElement(
      "button",
      { type: "button", onClick: () => setGeneration((value) => value + 1) },
      "Restart",
    ),
    createElement(
      "button",
      { type: "button", onClick: () => setColor("#112233") },
      "Change theme",
    ),
    createElement(
      "button",
      { type: "button", onClick: () => setProgress(true) },
      "Enable progress",
    ),
    createElement(IsolatedPreview, {
      key: generation,
      typebot: "fixture",
      previewTheme: {
        general: {
          background: { type: "Color", content: color },
          progressBar: { isEnabled: progress },
        },
      },
      style: { height: 600 },
      onNewInputBlock: (block) => {
        document.body.dataset.input = block.id;
      },
      onNewLogs: (logs) => {
        receivedLogs.push(...(logs ?? []));
        document.body.dataset.logs = JSON.stringify(receivedLogs);
      },
    }),
  );
};

createRoot(document.body).render(
  createElement(location.pathname === "/__preview" ? Preview : Host),
);
