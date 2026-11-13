import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Blocks } from "@/components/notion-blocks";
import { getBlocks, getEntriesOf, getEntry } from "@/lib/notion";
import { formatDate } from "@/lib/utils";

export const revalidate = 600;

export async function generateStaticParams() {
  return (await getEntriesOf("Photography")).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/photography/[slug]">): Promise<Metadata> {
  const entry = await getEntry("Photography", (await params).slug);
  return entry ? { title: entry.title, description: entry.summary } : {};
}

export default async function PhotoStory({ params }: PageProps<"/photography/[slug]">) {
  const entry = await getEntry("Photography", (await params).slug);
  if (!entry) notFound();
  const blocks = await getBlocks(entry.id);

  return (
    <article className="mx-auto max-w-[1120px] px-5 pt-16 pb-24 md:px-8 md:pt-24">
      <header className="mx-auto mb-16 max-w-[640px]">
        <h1 className="font-serif text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.1] font-normal tracking-[-0.01em]">{entry.title}</h1>
        <p className="mt-4 text-sm text-muted tabular-nums">
          {[entry.location, formatDate(entry.date)].filter(Boolean).join(" · ")}
        </p>
        {entry.summary && <p className="mt-6 text-[1.125rem] leading-relaxed text-text-body">{entry.summary}</p>}
      </header>
      <Blocks blocks={blocks} photo className="text-[1.0625rem] leading-[1.85] text-text-body" />
    </article>
  );
}
