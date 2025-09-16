import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { linkPlugin } from "./link/plugin";
import { floatingToolbarPlugin } from "./toolbar/plugins";

export const plateUIPlugins = [
  floatingToolbarPlugin,
  linkPlugin,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
];
