import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { MarkdownPlugin, remarkMdx } from "@platejs/markdown";
import { ExitBreakPlugin } from "platejs";

export const plateCorePlugins = [
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  MarkdownPlugin.configure({
    options: {
      remarkPlugins: [remarkMdx],
    },
  }),
  ExitBreakPlugin.configure({
    shortcuts: {
      // Create new paragraph block even on Shift+Enter for retro compatibility with old rich text editor
      insert: { keys: "shift+enter" },
    },
  }),
];
