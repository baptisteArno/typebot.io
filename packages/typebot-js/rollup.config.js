import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import styles from "rollup-plugin-styles";

export default [
  // ES Modules
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "cjs",
    },
    plugins: [typescript({ tsconfig: "./tsconfig.json" }), styles()],
  },

  // UMD
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.umd.min.js",
      format: "umd",
      name: "Typebot",
    },
    plugins: [typescript({ tsconfig: "./tsconfig.json" }), terser(), styles()],
  },
];
