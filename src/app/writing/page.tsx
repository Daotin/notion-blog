import type { Metadata } from "next";
import Link from "next/link";
import { container, Empty, PageHeader, PostList, Tag } from "@/components/entries";
import { site } from "@/content/site";
import { getEntriesOf } from "@/lib/notion";

export const metadata: Metadata = { title: "Writing" };

export default async function WritingPage({ searchParams }: PageProps<"/writing">) {
  const { tag } = await searchParams;
  const all = await getEntriesOf("Writing");
  const tags = [...new Set(all.flatMap((e) => e.tags))].sort();
  const current = typeof tag === "string" && tags.includes(tag) ? tag : null;
  const entries = current ? all.filter((e) => e.tags.includes(current)) : all;

  return (
    <div className={container}>
      <PageHeader title="Writing" text={site.sections.writing} />
      {all.length === 0 ? (
        <Empty />
      ) : (
        <>
          <nav aria-label="Tags" className="-mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0">
            {[null, ...tags].map((t) => (
              <Link key={t ?? "all"} href={t ? `/writing?tag=${encodeURIComponent(t)}` : "/writing"} aria-current={t === current ? "page" : undefined}>
                <Tag active={t === current}>{t ?? "All"}</Tag>
              </Link>
            ))}
          </nav>
          <div className="pb-24">
            <PostList entries={entries} />
          </div>
        </>
      )}
    </div>
  );
}
