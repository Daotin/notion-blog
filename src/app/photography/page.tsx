import type { Metadata } from "next";
import Link from "next/link";
import { container, Empty, PageHeader } from "@/components/entries";
import { Img } from "@/components/img";
import { site } from "@/content/site";
import { getEntriesOf } from "@/lib/notion";
import { yearOf } from "@/lib/utils";

export const revalidate = 600;
export const metadata: Metadata = { title: "Photography" };

export default async function PhotographyPage() {
  const photos = await getEntriesOf("Photography");
  return (
    <div className={container}>
      <PageHeader title="Photography" text={site.sections.photography} />
      {photos.length === 0 ? (
        <Empty />
      ) : (
        <div className="columns-2 gap-3 pb-24 md:gap-4 lg:columns-3">
          {photos.map((p) => (
            <Link key={p.id} href={p.href} className="group mb-6 block break-inside-avoid md:mb-8">
              {p.cover && (
                <div className="overflow-hidden rounded-[14px] bg-surface-muted">
                  <Img
                    src={p.cover}
                    alt={p.title}
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="transition duration-250 ease-out-quint group-hover:scale-[1.02]"
                  />
                </div>
              )}
              <span className="mt-2.5 block text-sm text-muted transition-colors duration-200 ease-out-quint group-hover:text-text">
                {[p.title, yearOf(p.date)].filter(Boolean).join(" · ")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
