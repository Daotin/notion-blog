import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Article } from "@/components/article";
import { PostList } from "@/components/entries";
import { getBlocks, getEntriesOf, getEntry } from "@/lib/notion";

export const revalidate = 600;

export async function generateStaticParams() {
  return (await getEntriesOf("Writing")).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/writing/[slug]">): Promise<Metadata> {
  const entry = await getEntry("Writing", (await params).slug);
  return entry ? { title: entry.title, description: entry.summary } : {};
}

export default async function WritingPost({ params }: PageProps<"/writing/[slug]">) {
  const { slug } = await params;
  const all = await getEntriesOf("Writing");
  const index = all.findIndex((e) => e.slug === slug);
  if (index === -1) notFound();
  const entry = all[index];
  const blocks = await getBlocks(entry.id);
  const newer = all[index - 1];
  const older = all[index + 1];
  const related = all.filter((e) => e.id !== entry.id && e.tags.some((t) => entry.tags.includes(t))).slice(0, 3);

  return (
    <Article entry={entry} blocks={blocks}>
      {(older || newer) && (
        <nav aria-label="More posts" className="mt-20 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
          {older && (
            <Link href={older.href} className="group">
              <span className="block text-sm text-muted">← Previous</span>
              <span className="mt-1 block font-medium text-text group-hover:text-muted">{older.title}</span>
            </Link>
          )}
          {newer && (
            <Link href={newer.href} className="group sm:col-start-2 sm:text-right">
              <span className="block text-sm text-muted">Next →</span>
              <span className="mt-1 block font-medium text-text group-hover:text-muted">{newer.title}</span>
            </Link>
          )}
        </nav>
      )}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-[0.95rem] font-medium text-muted">Related posts</h2>
          <PostList entries={related} />
        </section>
      )}
    </Article>
  );
}
