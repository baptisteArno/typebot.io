import { LinkFloatingToolbar } from "@/features/blocks/bubbles/textBubble/components/plate/LinkFloatingInput";
import {
  createBoldPlugin,
  createItalicPlugin,
  createUnderlinePlugin,
} from "@udecode/plate-basic-marks";
import { createPlugins } from "@udecode/plate-core";
import { ELEMENT_LINK, createLinkPlugin } from "@udecode/plate-link";

export const editorStyle = (backgroundColor: string): React.CSSProperties => ({
  flex: 1,
  padding: "1rem",
  backgroundColor,
  borderRadius: "0.25rem",
  outline: "none",
});

export const platePlugins = createPlugins(
  [
    createBoldPlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createLinkPlugin({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderAfterEditable: LinkFloatingToolbar as any,
      options: {
        isUrl: (url: string) =>
          url.startsWith("http:") ||
          url.startsWith("https:") ||
          url.startsWith("mailto:") ||
          url.startsWith("tel:") ||
          url.startsWith("sms:"),
        forceSubmit: true,
      },
    }),
  ],
  {
    components: {
      [ELEMENT_LINK]: (props) => (
        <a
          href={props.element.url}
          target="_blank"
          rel="noreferrer"
          className={props.className}
        >
          {props.children}
        </a>
      ),
    },
  },
);
