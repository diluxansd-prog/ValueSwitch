import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { Guide } from "@prisma/client";

/** Bundled editorial articles remain readable when the deal database is offline. */
export const getLocalGuides = cache(async (): Promise<Guide[]> => {
  const directory = path.join(process.cwd(), "content", "guides");
  const names = await readdir(directory).catch(() => [] as string[]);
  const guides = await Promise.all(names.filter(name => name.endsWith(".md")).map(async (name): Promise<Guide | null> => {
    const file = path.join(directory, name);
    const [source, info] = await Promise.all([readFile(file, "utf8"), stat(file)]);
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) return null;
    const fields: Record<string, string> = {};
    for (const line of match[1].split(/\r?\n/)) {
      const field = line.match(/^([\w]+):\s*(.*)$/);
      if (field) fields[field[1]] = field[2].replace(/^(["'])(.*)\1$/, "$2");
    }
    if (!fields.title || !fields.slug || !fields.category) return null;
    return { id: `article-${fields.slug}`, title: fields.title, slug: fields.slug, category: fields.category, excerpt: fields.excerpt || null, content: match[2].trim(), author: fields.author || null, coverImage: null, readTime: Number(fields.readTime) || null, isPublished: true, publishedAt: null, tags: null, createdAt: info.mtime, updatedAt: info.mtime } satisfies Guide;
  }));
  return guides.filter((guide): guide is Guide => guide !== null);
});
