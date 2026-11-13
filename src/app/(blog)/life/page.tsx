import type { Metadata } from "next";
import Link from "next/link";
import { container, Empty, PageHeader } from "@/components/entries";
import { Blocks } from "@/components/notion-blocks";
import { site } from "@/content/site";
import { getBlocks, getEntriesOf, isShort } from "@/lib/notion";
import { formatDate, formatMonth } from "@/lib/utils";

export const revalidate = 600;
export const metadata: Metadata = { title: "Life" };

export default async function LifePage() {
  const entries = await Promise.all(
    (await getEntriesOf("Life")).map(async (e) => {
      const blocks = await getBlocks(e.id);
      return { ...e, blocks: isShort(blocks) ? blocks : null };
    }),
  );
  const months = new Map<string, typeof entries>();
  for (const e of entries) {
    const key = formatMonth(e.date);
    months.set(key, [...(months.get(key) ?? []), e]);
  }

  return (
    <div className={container}>
      <PageHeader title="Life" text={site.sections.life} />
      {entries.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-16 pb-24">
          {[...months].map(([month, list]) => (
            <section key={month} className="grid gap-6 md:grid-cols-[10rem_1fr] md:gap-8">
              <h2 className="text-sm font-medium text-muted tabular-nums md:sticky md:top-24 md:self-start">{month}</h2>
              <ul className="space-y-10">
                {list.map((e) => (
                  <li key={e.id} className="max-w-[68ch]">
                    <p className="text-sm text-muted tabular-nums">{formatDate(e.date)}</p>
                    {e.blocks ? (
                      <>
                        <h3 className="mt-1 font-medium text-text">{e.title}</h3>
                        <Blocks blocks={e.blocks} className="mt-3 text-[1.0625rem] leading-[1.85] text-text-body" />
                      </>
                    ) : (
                      <Link href={e.href} className="group mt-1 block">
                        <span className="block font-medium text-text group-hover:text-muted">{e.title}</span>
                        {e.summary && <span className="mt-1.5 block text-[0.9375rem] leading-relaxed text-muted">{e.summary}</span>}
                        <span className="mt-2 inline-block text-sm text-text">Read more →</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
