import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeriesCover } from "@/components/series";
import { getSeries } from "@/lib/notion";
import { formatDate } from "@/lib/utils";

export const revalidate = 600;

async function find(params: PageProps<"/series/[name]">["params"]) {
  const name = decodeURIComponent((await params).name);
  return (await getSeries()).find((s) => s.name === name);
}

export async function generateMetadata({ params }: PageProps<"/series/[name]">): Promise<Metadata> {
  const series = await find(params);
  return series ? { title: series.name } : {};
}

export default async function SeriesDetail({ params }: PageProps<"/series/[name]">) {
  const series = await find(params);
  if (!series) notFound();

  return (
    <div className="mx-auto w-full max-w-[720px] px-5 pt-16 pb-24 md:px-0 md:pt-24">
      <h1 className="sr-only">{series.name}</h1>
      <SeriesCover name={series.name} className="aspect-[21/9] rounded-[24px]" />
      <p className="mt-6 text-sm text-muted tabular-nums">
        <Link href="/series" className="hover:text-text">
          Series
        </Link>{" "}
        · {series.posts.length} 篇 · 更新于 {formatDate(series.updated)}
      </p>
      <ol className="mt-10 border-t border-border">
        {series.posts.map((e, i) => (
          <li key={e.id} className="group relative border-b border-border">
            <div className="flex items-baseline gap-4 py-4">
              <span className="w-14 shrink-0 text-sm text-muted tabular-nums">第 {e.seriesOrder ?? i + 1} 篇</span>
              <Link href={e.href} className="min-w-0 flex-1 font-medium text-text after:absolute after:inset-0 group-hover:text-muted">
                {e.title}
              </Link>
              <span className="hidden text-sm text-muted tabular-nums sm:block">{formatDate(e.date)}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
