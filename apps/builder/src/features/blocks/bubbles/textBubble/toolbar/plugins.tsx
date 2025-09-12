import { createPlatePlugin } from "platejs/react";
import { FloatingToolbar } from "./components/FloatingToolbar";

export const floatingToolbarPlugin = createPlatePlugin({
  key: "floating-toolbar",
  render: {
    afterEditable: () => <FloatingToolbar />,
  },
});
