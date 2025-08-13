import { currentBaseUrl } from "@/constants";
import { allPosts } from "@/content-collections";
import { createServerFileRoute } from "@tanstack/react-start/server";

type SitemapUrlEntry = {
  loc: string;
  lastmod: string;
};

function generateSitemapXml(entries: SitemapUrlEntry[]) {
  const urls = entries
    .map((entry) => {
      return `\n<url><loc>${entry.loc}</loc><lastmod>${entry.lastmod}</lastmod></url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`;
}

export const ServerRoute = createServerFileRoute("/sitemap.xml").methods({
  GET: async () => {
    const staticEntries = [
      { loc: `${currentBaseUrl}/`, lastmod: "2025-07-05" },
      { loc: `${currentBaseUrl}/pricing`, lastmod: "2025-07-05" },
      { loc: `${currentBaseUrl}/about`, lastmod: "2025-07-05" },
      { loc: `${currentBaseUrl}/oss-friends`, lastmod: "2025-07-05" },
      { loc: `${currentBaseUrl}/blog`, lastmod: "2025-07-05" },
    ] satisfies SitemapUrlEntry[];

    const contentEntries: SitemapUrlEntry[] = Array.from(
      new Set(allPosts.map((p) => p._meta.path)),
    )
      .filter(
        (p) => typeof p === "string" && p.length > 0 && !p.includes("blog"),
      )
      .map(transformPathToSitemapUrlEntry);

    const blogContentEntries: SitemapUrlEntry[] = Array.from(
      new Set(allPosts.map((p) => p._meta.path)),
    )
      .filter(
        (p) => typeof p === "string" && p.length > 0 && p.includes("blog"),
      )
      .map(transformPathToSitemapUrlEntry)
      .sort(
        (a, b) => new Date(b.lastmod).getTime() - new Date(a.lastmod).getTime(),
      );

    const xml = generateSitemapXml([
      ...staticEntries,
      ...contentEntries,
      ...blogContentEntries,
    ]);

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  },
});

const transformPathToSitemapUrlEntry = (path: string) => {
  const post = allPosts.find((p) => p._meta.path === path);
  const lastmod = post?.updatedAt
    ? new Date(post.updatedAt).toISOString().split("T")[0]
    : post?.postedAt
      ? new Date(post.postedAt).toISOString().split("T")[0]
      : undefined;
  if (!lastmod)
    throw new Error(
      `Content file ${post?.title} needs either postedAt or updatedAt to generate coherent sitemap`,
    );
  return {
    loc: `${currentBaseUrl}/${path}`.replace(/\/+$|(?<!:)\/\//g, "/"),
    lastmod,
  } satisfies SitemapUrlEntry;
};
