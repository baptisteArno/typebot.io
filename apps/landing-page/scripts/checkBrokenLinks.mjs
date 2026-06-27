#!/usr/bin/env bun

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import micromatch from "micromatch";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const markdownExtensions = new Set([".md", ".mdx"]);
const idAttributeNames = new Set(["id", "name"]);
const linkAttributeNames = new Set(["href", "to", "src"]);
const processedFiles = new Map();
const errors = new Set();

const contentDirectory = process.argv[2] ?? ".";
const basePath = process.argv[3] ?? ".";
const ignorePattern = process.argv[4];

for (const markdownFilePath of findMarkdownFiles(contentDirectory)) {
  cacheMarkdownFile(markdownFilePath);
}

for (const { internalLinks } of processedFiles.values()) {
  for (const link of internalLinks) {
    if (ignorePattern && micromatch.isMatch(link.original, ignorePattern))
      continue;

    const [targetFilePath, targetId] = link.absolute.split("#");
    const resolvedTargetFilePath =
      resolveExistingTargetFilePath(targetFilePath);

    if (!resolvedTargetFilePath) {
      if (!path.extname(targetFilePath)) {
        continue;
      }

      errors.add(
        `Link is broken: '${link.absolute}' in file ${link.sourceFilePath}`,
      );
      continue;
    }

    if (!processedFiles.has(resolvedTargetFilePath)) {
      if (existsSync(resolvedTargetFilePath)) {
        cacheMarkdownFile(resolvedTargetFilePath);
      } else {
        errors.add(
          `Link is broken: '${link.absolute}' in file ${link.sourceFilePath}`,
        );
        continue;
      }
    }

    if (
      targetId &&
      !processedFiles.get(resolvedTargetFilePath)?.ids.has(targetId)
    ) {
      errors.add(
        `Anchor of link is broken: '${link.original}' in file ${link.sourceFilePath}`,
      );
    }
  }
}

for (const error of errors) {
  console.error(error);
}

process.exit(errors.size > 0 ? 1 : 0);

function findMarkdownFiles(directoryPath) {
  const absoluteDirectoryPath = path.resolve(directoryPath);
  const markdownFilePaths = [];

  for (const entry of readdirSync(absoluteDirectoryPath, {
    withFileTypes: true,
  })) {
    const entryPath = path.join(absoluteDirectoryPath, entry.name);

    if (entry.isDirectory()) {
      markdownFilePaths.push(...findMarkdownFiles(entryPath));
      continue;
    }

    if (markdownExtensions.has(path.extname(entry.name))) {
      markdownFilePaths.push(entryPath);
    }
  }

  return markdownFilePaths;
}

function cacheMarkdownFile(filePath) {
  const absoluteFilePath = path.resolve(filePath);

  if (
    processedFiles.has(absoluteFilePath) ||
    !markdownExtensions.has(path.extname(absoluteFilePath))
  ) {
    return;
  }

  const markdown = readFileSync(absoluteFilePath, "utf8");
  const parsedMarkdown = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .parse(markdown);
  const fileDetails = { ids: new Set(), internalLinks: [] };
  const slugger = new GithubSlugger();

  visit(parsedMarkdown, (node) => {
    if (node.type === "heading") {
      const headingText = getNodeText(node);

      if (headingText) fileDetails.ids.add(slugger.slug(headingText));
    }

    if (
      (node.type === "definition" ||
        node.type === "image" ||
        node.type === "link") &&
      typeof node.url === "string"
    ) {
      addInternalLink(node.url, absoluteFilePath, fileDetails);
    }

    if (
      (node.type === "mdxJsxFlowElement" ||
        node.type === "mdxJsxTextElement") &&
      Array.isArray(node.attributes)
    ) {
      for (const attribute of node.attributes) {
        if (
          attribute.type !== "mdxJsxAttribute" ||
          typeof attribute.name !== "string" ||
          typeof attribute.value !== "string"
        ) {
          continue;
        }

        if (idAttributeNames.has(attribute.name)) {
          fileDetails.ids.add(attribute.value);
        }

        if (linkAttributeNames.has(attribute.name)) {
          addInternalLink(attribute.value, absoluteFilePath, fileDetails);
        }
      }
    }

    if (node.type === "html" && typeof node.value === "string") {
      for (const id of getAttributeValues(node.value, idAttributeNames)) {
        fileDetails.ids.add(id);
      }

      for (const link of getAttributeValues(node.value, linkAttributeNames)) {
        addInternalLink(link, absoluteFilePath, fileDetails);
      }
    }
  });

  processedFiles.set(absoluteFilePath, fileDetails);
}

function addInternalLink(link, sourceFilePath, fileDetails) {
  const normalizedLink = normalizeLocalLink(link);

  if (!normalizedLink) return;

  fileDetails.internalLinks.push({
    absolute: resolveLocalLink(normalizedLink, sourceFilePath),
    original: normalizedLink,
    sourceFilePath,
  });
}

function resolveExistingTargetFilePath(targetFilePath) {
  if (existsSync(targetFilePath)) {
    return targetFilePath;
  }

  if (path.extname(targetFilePath)) {
    return;
  }

  for (const extension of markdownExtensions) {
    const markdownFilePath = `${targetFilePath}${extension}`;

    if (existsSync(markdownFilePath)) {
      return markdownFilePath;
    }
  }
}

function normalizeLocalLink(link) {
  if (
    link.match(/^https?:\/\//) ||
    link.match(/^[^:]+:.*/) ||
    link.match(/^#?$/)
  ) {
    return;
  }

  if (link.match(/(^#)|(\.mdx?(#[a-zA-Z0-9._,-]*)?$)/)) {
    return link;
  }

  if (link.endsWith("/")) {
    return `${link}index.mdx`;
  }

  const [, linkPath, anchor] = link.match(/^(.*\/)(#[^/]+)$/) ?? [];

  if (anchor) {
    return `${linkPath}index.mdx${anchor}`;
  }

  return link;
}

function resolveLocalLink(link, sourceFilePath) {
  if (link.startsWith("#")) {
    return `${sourceFilePath}${link}`;
  }

  if (link.startsWith("/")) {
    return path.resolve(path.join(basePath, link));
  }

  return path.resolve(path.dirname(sourceFilePath), link);
}

function getNodeText(node) {
  if (typeof node.value === "string") {
    return node.value;
  }

  if (!Array.isArray(node.children)) {
    return "";
  }

  return node.children.map(getNodeText).join("");
}

function getAttributeValues(markup, attributeNames) {
  const attributes = Array.from(attributeNames).join("|");
  const attributePattern = new RegExp(
    `\\b(?:${attributes})=(["'])(.*?)\\1`,
    "g",
  );
  const values = [];

  for (const match of markup.matchAll(attributePattern)) {
    values.push(match[2]);
  }

  return values;
}
