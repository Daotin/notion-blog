import type { Metadata } from "next";
import Link from "next/link";
import { container, Empty, PageHeader, PostList, Tag, tagHref } from "@/components/entries";
import { site } from "@/content/site";
import { getEntriesOf } from "@/lib/notion";
import { yearOf } from "@/lib/utils";

export const metadata: Metadata = { title: "Writing" };

export default async function WritingPage({ searchParams }: PageProps<"/writing">) {
  const { tag } = await searchParams;
  const all = await getEntriesOf("Writing");
  const order = ["AI", "Development", "Product", "Learning", "Thoughts"];
  const rank = (t: string) => (order.includes(t) ? order.indexOf(t) : order.length);
  const tags = [...new Set(all.flatMap((e) => e.tags))].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  const current = typeof tag === "string" && tags.includes(tag) ? tag : null;
  const entries = current ? all.filter((e) => e.tags.includes(current)) : all;
  const years = Map.groupBy(entries, (e) => yearOf(e.date) || "未注明年份");

  return (
    <div className={container}>
      <PageHeader title="Writing" text={site.sections.writing} />
      {all.length === 0 ? (
        <Empty />
      ) : (
        <>
          <nav aria-label="Tags" className="mb-12 flex flex-wrap gap-2">
            {[null, ...tags].map((t) => (
              <Link key={t ?? "all"} href={t ? tagHref(t) : "/writing"} aria-current={t === current ? "page" : undefined}>
                <Tag active={t === current}>{t ?? "All"}</Tag>
              </Link>
            ))}
          </nav>
          <p className="mb-8 text-sm text-muted tabular-nums">共 {entries.length} 篇</p>
          <div className="space-y-12 pb-24">
            {[...years].map(([year, list]) => (
              <section key={year}>
                <h2 className="mb-4 text-[0.95rem] leading-[1.4] font-medium text-muted tabular-nums">
                  {year} · {list.length} 篇
                </h2>
                <PostList entries={list} />
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
