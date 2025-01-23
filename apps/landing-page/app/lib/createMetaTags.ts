import { currentBaseUrl } from "@/constants";

export const createMetaTags = ({
  title,
  description,
  image,
  path,
}: {
  title: string;
  description: string | undefined;
  image: string;
  path: string;
}) => [
  { title },
  ...(description
    ? [
        { name: "description", content: description },
        { property: "og:description", content: description },
      ]
    : []),
  { property: "og:type", content: "website" },
  { property: "og:title", content: title },
  { property: "og:image", content: image },
  { property: "og:url", content: `${currentBaseUrl}${path}` },
];
