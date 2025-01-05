import { Standard } from "@typebot.io/nextjs";
import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import { highlight } from "sugar-high";
import { Header } from "./components/Header";

export function useMDXComponents(
  otherComponents: MDXComponents,
): MDXComponents {
  return {
    ...otherComponents,
    code: ({ children, ...props }) => {
      if (!props.className || props.className?.includes("md"))
        return <code {...props}>{children}</code>;
      const hightlightedCode = highlight(children?.toString() ?? "");
      return (
        <code
          dangerouslySetInnerHTML={{ __html: hightlightedCode }}
          {...props}
        />
      );
    },
    link: (props: any) => <Link {...props} />,
    Image: (props) => (
      <Image
        style={{
          borderRadius: ".5rem",
          ...props.style,
        }}
        {...props}
      />
    ),
    Callout: ({ children, title, ...props }) => <>callout</>,
    Typebot: (props: any) => (
      <Standard
        style={{
          borderRadius: "0.375rem",
          borderWidth: "1px",
          height: "533px",
          ...props.style,
        }}
        {...props}
      />
    ),
    Youtube: ({ id }: { id: string }) => (
      <div className="w-full">
        <div
          style={{
            position: "relative",
            paddingBottom: "64.63195691202873%",
            height: 0,
            width: "100%",
          }}
        >
          <iframe
            title="Youtube video"
            src={`https://www.youtube.com/embed/${id}`}
            allowFullScreen
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>
    ),
    Loom: ({ id }: { id: string }) => (
      <div className="w-full">
        <div
          style={{
            position: "relative",
            paddingBottom: "64.63195691202873%",
            height: 0,
            width: "100%",
          }}
        >
          <iframe
            title="Loom video"
            src={`https://www.loom.com/embed/${id}`}
            allowFullScreen
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>
    ),
    Cta: (props) => <>cta</>,
    Header,
  };
}
