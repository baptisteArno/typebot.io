export const createMetaTags = ({
  title,
  description,
  image,
}: {
  title: string;
  description: string | undefined;
  image: string;
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
];
