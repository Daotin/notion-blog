import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Img } from "@/components/img";
import type { Entry } from "@/lib/notion";
import { cn, formatDate, yearOf } from "@/lib/utils";

export const container = "mx-auto w-full max-w-[1120px] px-5 md:px-8";

export function PageHeader({ title, text }: { title: string; text: string }) {
  return (
    <header className="pt-16 pb-12 md:pt-24">
      <h1 className="text-[clamp(2rem,4vw,2.75rem)] leading-[1.15] font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 max-w-[60ch] text-[1.0625rem] leading-relaxed text-muted">{text}</p>
    </header>
  );
}

export function Empty() {
  return <p className="py-24 text-center text-muted">还没有公开的内容，正在写。</p>;
}

export function Tag({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.8125rem] whitespace-nowrap",
        active ? "bg-text text-bg" : "bg-surface-muted text-muted",
      )}
    >
      {children}
    </span>
  );
}

export function PostList({ entries }: { entries: Entry[] }) {
  return (
    <ul className="border-t border-border">
      {entries.map((e) => (
        <li key={e.id} className="border-b border-border">
          <Link
            href={e.href}
            className="group grid gap-1.5 py-4 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_auto_7.5rem] md:items-center md:gap-6"
          >
            <span className="font-medium text-text">{e.title}</span>
            <span className="hidden truncate text-[0.9375rem] text-muted md:block">{e.summary}</span>
            <span className="hidden gap-1.5 md:flex">
              {e.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </span>
            <span className="flex items-center justify-between gap-2 text-sm text-muted tabular-nums">
              <span className="md:hidden">{[...e.tags, formatDate(e.date)].filter(Boolean).join(" · ")}</span>
              <span className="hidden md:inline">{formatDate(e.date)}</span>
              <ArrowRight
                className="hidden size-4 opacity-0 transition duration-200 ease-out-quint group-hover:translate-x-0.5 group-hover:opacity-100 md:block"
                aria-hidden
              />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ProjectCard({
  entry,
  coverClass = "aspect-[16/10]",
  large,
  sizes = "(min-width: 768px) 50vw, 100vw",
}: {
  entry: Entry;
  coverClass?: string;
  large?: boolean;
  sizes?: string;
}) {
  return (
    <Link
      href={entry.href}
      className={cn(
        "group block overflow-hidden border border-border bg-surface transition duration-200 ease-out-quint hover:-translate-y-[3px] hover:border-border-strong hover:shadow-[0_8px_24px_-12px_oklch(0.25_0.02_60/0.12)]",
        large ? "rounded-[24px]" : "rounded-[18px]",
      )}
    >
      {entry.cover && (
        <div className={cn("relative overflow-hidden bg-surface-muted", coverClass)}>
          <Img
            src={entry.cover}
            alt={entry.title}
            fill
            sizes={sizes}
            className="transition duration-250 ease-out-quint group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="p-5 md:p-6">
        <h3 className="font-medium text-text">{entry.title}</h3>
        {entry.summary && <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{entry.summary}</p>}
        <p className="mt-3 text-sm text-muted tabular-nums">
          {[entry.tags.join(" / "), yearOf(entry.date)].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
