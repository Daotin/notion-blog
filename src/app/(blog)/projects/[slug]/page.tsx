import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Img } from "@/components/img";
import { Blocks } from "@/components/notion-blocks";
import { getBlocks, getEntriesOf, getEntry } from "@/lib/notion";
import { yearOf } from "@/lib/utils";

export const revalidate = 600;

export async function generateStaticParams() {
  return (await getEntriesOf("Project")).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const entry = await getEntry("Project", (await params).slug);
  return entry ? { title: entry.title, description: entry.summary } : {};
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const entry = await getEntry("Project", (await params).slug);
  if (!entry) notFound();
  const blocks = await getBlocks(entry.id);

  return (
    <article className="pb-24">
      <header className="mx-auto max-w-[1120px] px-5 pt-16 md:px-8 md:pt-24">
        <h1 className="text-[clamp(2rem,4vw,2.75rem)] leading-[1.15] font-semibold tracking-tight">{entry.title}</h1>
        {entry.summary && <p className="mt-4 max-w-[60ch] text-[1.125rem] leading-relaxed text-muted">{entry.summary}</p>}
        <p className="mt-4 text-sm text-muted tabular-nums">
          {[entry.tags.join(" / "), yearOf(entry.date)].filter(Boolean).join(" · ")}
        </p>
        {entry.cover && (
          <div className="relative mt-12 aspect-[16/10] overflow-hidden rounded-[24px] bg-surface-muted md:aspect-[21/9]">
            <Img src={entry.cover} alt={entry.title} fill preload sizes="(min-width: 1120px) 1056px, 100vw" />
          </div>
        )}
      </header>
      <div className="mx-auto mt-16 max-w-[720px] px-5 md:px-0">
        <Blocks blocks={blocks} className="text-[1.0625rem] leading-[1.85] text-text-body" />
      </div>
    </article>
  );
}
