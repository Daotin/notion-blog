import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/article";
import { getBlocks, getEntriesOf, getEntry } from "@/lib/notion";

export const revalidate = 600;

export async function generateStaticParams() {
  return (await getEntriesOf("Life")).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/life/[slug]">): Promise<Metadata> {
  const entry = await getEntry("Life", (await params).slug);
  return entry ? { title: entry.title, description: entry.summary } : {};
}

export default async function LifePost({ params }: PageProps<"/life/[slug]">) {
  const entry = await getEntry("Life", (await params).slug);
  if (!entry) notFound();
  return <Article entry={entry} blocks={await getBlocks(entry.id)} />;
}
