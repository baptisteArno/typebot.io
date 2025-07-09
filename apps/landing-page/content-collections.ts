import { defineCollection, defineConfig } from "@content-collections/core";
import { suppressDeprecatedWarnings } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
} from "@shikijs/transformers";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import type { Pluggable } from "unified";
import { visit } from "unist-util-visit";

suppressDeprecatedWarnings("legacySchema");

const posts = defineCollection({
  name: "posts",
  directory: "content",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string().optional(),
    postedAt: z.string().date().optional(),
    author: z.string(),
    cover: z.string().optional(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      remarkPlugins: [remarkGfm, remarkRemoveMdxExtension],
      rehypePlugins: [
        rehypeSlug,
        [rehypePrettyCode, rehypePrettyCodeSettings],
        [rehypeAutolinkHeadings, rehypeAutolinkHeadingsSettings],
      ],
    });
    return {
      ...document,
      mdx,
    };
  },
});
export default defineConfig({
  collections: [posts],
});

const rehypePrettyCodeSettings = {
  theme: "material-theme-palenight",
  defaultLang: {
    block: "md",
  },
  transformers: [
    transformerMetaHighlight(),
    transformerMetaWordHighlight(),
    transformerNotationDiff({
      matchAlgorithm: "v3",
    }),
  ],
  onVisitLine(node: any) {
    // Prevent lines from collapsing in `display: grid` mode, and allow empty
    // lines to be copy/pasted
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }];
    }
  },
  onVisitHighlightedLine(node: any) {
    node.properties.className.push("line--highlighted");
  },
  onVisitHighlightedWord(node: any) {
    node.properties.className = ["word--highlighted"];
  },
};

const rehypeAutolinkHeadingsSettings = {
  properties: {
    className: ["subheading-anchor"],
    ariaLabel: "Link to section",
  },
};

const remarkRemoveMdxExtension: Pluggable = () => {
  return (tree) => {
    visit(tree, "link", (node) => {
      const url = node.url as string;
      if (
        typeof url === "string" &&
        url.startsWith("./") &&
        url.endsWith(".mdx")
      ) {
        node.url = url.replace(/\.mdx$/, "");
      }
    });
  };
};
