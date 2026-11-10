import type { Metadata } from "next";
import Link from "next/link";
import { container, Empty, PageHeader, seriesHref } from "@/components/entries";
import { SeriesCover } from "@/components/series";
import { site } from "@/content/site";
import { getSeries } from "@/lib/notion";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Series" };

export default async function SeriesPage() {
  const series = await getSeries();

  return (
    <div className={container}>
      <PageHeader title="Series" text={site.sections.series} />
      {series.length === 0 ? (
        <Empty />
      ) : (
        <ul className="grid gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
          {series.map((s) => (
            <li key={s.name}>
              <Link
                href={seriesHref(s.name)}
                className="group block overflow-hidden rounded-[18px] border border-border bg-surface transition duration-200 ease-out-quint hover:-translate-y-[3px] hover:border-border-strong hover:shadow-[0_8px_24px_-12px_oklch(0.25_0.02_60/0.12)]"
              >
                <SeriesCover name={s.name} className="aspect-[16/10]" />
                <div className="p-5">
                  <h2 className="font-medium text-text">{s.name}</h2>
                  <p className="mt-1.5 text-sm text-muted tabular-nums">
                    {s.posts.length} 篇 · 更新于 {formatDate(s.updated)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
