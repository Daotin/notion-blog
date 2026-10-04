import { Tag } from "@/components/entries";
import { Blocks } from "@/components/notion-blocks";
import type { Block, Entry } from "@/lib/notion";
import { formatDate } from "@/lib/utils";

export function Article({ entry, blocks, children }: { entry: Entry; blocks: Block[]; children?: React.ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-[720px] px-5 pt-16 pb-24 md:px-0 md:pt-24">
      <header className="mb-12">
        <h1 className="text-[clamp(2rem,4vw,2.75rem)] leading-[1.15] font-semibold tracking-tight">{entry.title}</h1>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted tabular-nums">
          <time dateTime={entry.date ?? undefined}>{formatDate(entry.date)}</time>
          {entry.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
        {entry.summary && <p className="mt-6 text-[1.125rem] leading-relaxed text-muted">{entry.summary}</p>}
      </header>
      <Blocks blocks={blocks} className="text-[1.0625rem] leading-[1.85] text-text-body" />
      {children}
    </article>
  );
}
