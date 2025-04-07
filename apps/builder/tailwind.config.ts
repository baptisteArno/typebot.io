import type { Config } from "tailwindcss";
import sharedConfig from "../../packages/ui/tailwind.config";

export default {
  presets: [sharedConfig],
  content: ["src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
} satisfies Config;
