import { createFileRoute } from "@tanstack/react-router";
import { templates } from "@typebot.io/templates";
import { currentBaseUrl } from "@/constants";

type SitemapUrlEntry = {
  loc: string;
  lastmod: string;
};

const templatesIndexLastmod = templates.reduce(
  (latest, template) =>
    template.updatedAt > latest ? template.updatedAt : latest,
  "2026-01-05",
);

function generateSitemapXml(entries: SitemapUrlEntry[]) {
  const urls = entries
    .map((entry) => {
      return `\n<url><loc>${entry.loc}</loc><lastmod>${entry.lastmod}</lastmod></url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`;
}

function transformPathToSitemapUrlEntry(
  path: string,
  contentEntries: Array<{
    _meta: { path: string };
    updatedAt?: string;
    postedAt?: string;
    title?: string;
    question?: string;
  }>,
  basePath = "",
) {
  const contentEntry = contentEntries.find(
    (entry) => entry._meta.path === path,
  );
  const lastmod = contentEntry?.updatedAt
    ? new Date(contentEntry.updatedAt).toISOString().split("T")[0]
    : contentEntry?.postedAt
      ? new Date(contentEntry.postedAt).toISOString().split("T")[0]
      : undefined;
  if (!lastmod)
    throw new Error(
      `Content file ${contentEntry?.title ?? contentEntry?.question} needs either postedAt or updatedAt to generate coherent sitemap`,
    );
  return {
    loc: `${currentBaseUrl}/${basePath}/${path}`.replace(
      /\/+$|(?<!:)\/\//g,
      "/",
    ),
    lastmod,
  } satisfies SitemapUrlEntry;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { allFaqs, allPosts } = await import("@/content-collections");
        const faqPaths = Array.from(
          new Set(allFaqs.map((faq) => faq._meta.path)),
        );
        const faqEntries: SitemapUrlEntry[] = faqPaths.map((path) =>
          transformPathToSitemapUrlEntry(path, allFaqs, "faq"),
        );
        const faqIndexLastmod = faqEntries.reduce(
          (latest, entry) => (entry.lastmod > latest ? entry.lastmod : latest),
          "2025-07-05",
        );

        const staticEntries = [
          { loc: `${currentBaseUrl}/`, lastmod: "2025-07-05" },
          { loc: `${currentBaseUrl}/pricing`, lastmod: "2025-07-05" },
          { loc: `${currentBaseUrl}/about`, lastmod: "2025-07-05" },
          { loc: `${currentBaseUrl}/oss-friends`, lastmod: "2025-07-05" },
          { loc: `${currentBaseUrl}/blog`, lastmod: "2025-07-05" },
          { loc: `${currentBaseUrl}/faq`, lastmod: faqIndexLastmod },
          {
            loc: `${currentBaseUrl}/templates`,
            lastmod: templatesIndexLastmod,
          },
        ] satisfies SitemapUrlEntry[];

        const templateEntries: SitemapUrlEntry[] = templates.map(
          (template) => ({
            loc: `${currentBaseUrl}/templates/${template.slug}`,
            lastmod: template.updatedAt,
          }),
        );

        const contentPaths = Array.from(
          new Set(allPosts.map((post) => post._meta.path)),
        );
        const contentEntries: SitemapUrlEntry[] = contentPaths
          .filter(
            (path) =>
              typeof path === "string" &&
              path.length > 0 &&
              !path.includes("blog"),
          )
          .map((path) => transformPathToSitemapUrlEntry(path, allPosts));

        const blogContentEntries: SitemapUrlEntry[] = contentPaths
          .filter(
            (path) =>
              typeof path === "string" &&
              path.length > 0 &&
              path.includes("blog"),
          )
          .map((path) => transformPathToSitemapUrlEntry(path, allPosts))
          .sort(
            (a, b) =>
              new Date(b.lastmod).getTime() - new Date(a.lastmod).getTime(),
          );

        const xml = generateSitemapXml([
          ...staticEntries,
          ...templateEntries,
          ...contentEntries,
          ...blogContentEntries,
          ...faqEntries,
        ]);

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
