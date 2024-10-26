import { EndCta } from "@/components/Homepage/EndCta";
import type { AlertProps } from "@chakra-ui/react";
import { Standard } from "@typebot.io/nextjs";
import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import { highlight } from "sugar-high";
import { Header } from "./features/blog/components/Header";
import { Table } from "./features/blog/components/Table";
import { Tweet } from "./features/blog/components/Tweet";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Heading,
  Link,
} from "./features/blog/components/chakraClientComponents";

const components: MDXComponents = {
  h1: (props) => <Heading as="h1" {...props} />,
  h2: (props) => <Heading as="h2" fontSize="3xl" {...props} />,
  h3: (props) => <Heading as="h3" fontSize="2xl" {...props} />,
  h4: (props) => <Heading as="h4" fontSize="xl" {...props} />,
  h5: (props) => <Heading as="h5" fontSize="lg" {...props} />,
  h6: (props) => <Heading as="h6" fontSize="md" {...props} />,
  code: ({ children, ...props }) => {
    if (!props.className || props.className?.includes("md"))
      return <code {...props}>{children}</code>;
    const hightlightedCode = highlight(children?.toString() ?? "");
    return (
      <code dangerouslySetInnerHTML={{ __html: hightlightedCode }} {...props} />
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
  Callout: ({ children, title, ...props }: AlertProps) => (
    <Alert rounded="md" {...props}>
      <AlertIcon />
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      {children}
    </Alert>
  ),
  Tweet,
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
  Cta: (props) => (
    <EndCta
      style={{ maxWidth: "none", ...props.style }}
      w="full"
      h="auto"
      py="0"
      className="w-full"
      bgGradient={null}
      polygonsBaseTop="0px"
      {...props}
    />
  ),
  Table,
  Header,
};

export function useMDXComponents(
  otherComponents: MDXComponents,
): MDXComponents {
  return {
    ...otherComponents,
    ...components,
  };
}
