import type { ImageBlockObjectResponse, RichTextItemResponse } from "@notionhq/client";
import { bundledLanguages, codeToHtml } from "shiki";
import { CopyButton } from "@/components/copy-button";
import { Img } from "@/components/img";
import { imageSrc, plain, type Block } from "@/lib/notion";
import { cn } from "@/lib/utils";

const link = "text-text underline decoration-accent decoration-1 underline-offset-[3px] hover:decoration-2";

export function RichText({ text }: { text: RichTextItemResponse[] }) {
  return text.map((t, i) => {
    const a = t.annotations;
    let node: React.ReactNode = t.plain_text;
    if (a.code) node = <code className="rounded-md bg-surface-muted px-1.5 py-0.5 font-mono text-[0.875em]">{node}</code>;
    if (a.bold) node = <strong className="font-semibold text-text">{node}</strong>;
    if (a.italic) node = <em>{node}</em>;
    if (a.strikethrough) node = <s>{node}</s>;
    if (a.underline) node = <u className="underline-offset-[3px]">{node}</u>;
    if (t.href) node = <a href={t.href} className={link}>{node}</a>;
    return <span key={i}>{node}</span>;
  });
}

async function Code({ code, language }: { code: string; language: string }) {
  const lang = language in bundledLanguages ? language : "text";
  const html = await codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
  return (
    <div className="relative rounded-[14px] border border-border bg-surface">
      <div className="absolute top-2.5 right-3 flex items-center gap-2 text-xs text-muted">
        <span>{language}</span>
        <CopyButton text={code} />
      </div>
      <div
        className="overflow-x-auto p-5 pt-10 font-mono text-[0.875rem] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function Figure({ block, sizes, className }: { block: ImageBlockObjectResponse; sizes: string; className?: string }) {
  const caption = block.image.caption;
  return (
    <figure>
      <Img
        src={imageSrc(block)}
        alt={plain(caption) || "Photo"}
        sizes={sizes}
        className={cn("rounded-[14px] bg-surface-muted", className)}
      />
      {caption.length > 0 && (
        <figcaption className="mt-3 text-sm text-muted">
          <RichText text={caption} />
        </figcaption>
      )}
    </figure>
  );
}

function PhotoGroup({ images }: { images: ImageBlockObjectResponse[] }) {
  if (images.length === 1) return <Figure block={images[0]} sizes="(min-width: 1120px) 1056px, 100vw" />;
  if (images.length === 2)
    return (
      <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
        {images.map((b) => (
          <Figure key={b.id} block={b} sizes="(min-width: 640px) 50vw, 100vw" className="aspect-[4/5] object-cover" />
        ))}
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
      {images.map((b) => (
        <Figure key={b.id} block={b} sizes="(min-width: 768px) 33vw, 50vw" className="aspect-square object-cover" />
      ))}
    </div>
  );
}

type Group =
  | { kind: "block"; block: Block }
  | { kind: "ul"; items: Block[] }
  | { kind: "ol"; items: Block[] }
  | { kind: "photos"; items: ImageBlockObjectResponse[] };

function group(blocks: Block[], photo: boolean): Group[] {
  const out: Group[] = [];
  for (const b of blocks) {
    if (b.type === "paragraph" && !b.paragraph.rich_text.length && !b.children?.length) continue;
    const last = out.at(-1);
    const kind =
      b.type === "bulleted_list_item" ? "ul" : b.type === "numbered_list_item" ? "ol" : photo && b.type === "image" ? "photos" : null;
    if (kind && last?.kind === kind) (last.items as Block[]).push(b);
    else if (kind === "photos") out.push({ kind, items: [b as ImageBlockObjectResponse] });
    else if (kind) out.push({ kind, items: [b] });
    else out.push({ kind: "block", block: b });
  }
  return out;
}

function Children({ block }: { block: Block }) {
  return block.children?.length ? <Blocks blocks={block.children} className="mt-3" /> : null;
}

function BlockView({ block: b }: { block: Block }) {
  switch (b.type) {
    case "paragraph":
      return (
        <>
          {b.paragraph.rich_text.length > 0 && (
            <p>
              <RichText text={b.paragraph.rich_text} />
            </p>
          )}
          <Children block={b} />
        </>
      );
    case "heading_1":
      return (
        <>
          <h2 className="text-[1.75rem] leading-[1.3] font-semibold text-text">
            <RichText text={b.heading_1.rich_text} />
          </h2>
          <Children block={b} />
        </>
      );
    case "heading_2":
      return (
        <>
          <h2 className="text-[1.5rem] leading-[1.3] font-semibold text-text">
            <RichText text={b.heading_2.rich_text} />
          </h2>
          <Children block={b} />
        </>
      );
    case "heading_3":
      return (
        <>
          <h3 className="text-[1.2rem] leading-[1.4] font-semibold text-text">
            <RichText text={b.heading_3.rich_text} />
          </h3>
          <Children block={b} />
        </>
      );
    case "bulleted_list_item":
    case "numbered_list_item": {
      const value = b.type === "bulleted_list_item" ? b.bulleted_list_item : b.numbered_list_item;
      return (
        <li className="pl-1">
          <RichText text={value.rich_text} />
          <Children block={b} />
        </li>
      );
    }
    case "to_do":
      return (
        <div className="flex gap-3">
          <input type="checkbox" checked={b.to_do.checked} readOnly disabled className="mt-[0.55em] size-4 accent-accent" />
          <div className={cn(b.to_do.checked && "text-muted line-through")}>
            <RichText text={b.to_do.rich_text} />
            <Children block={b} />
          </div>
        </div>
      );
    case "quote":
      return (
        <blockquote className="pl-6 font-serif text-[1.25rem] leading-relaxed text-text italic md:pl-10">
          <RichText text={b.quote.rich_text} />
          <Children block={b} />
        </blockquote>
      );
    case "callout":
      return (
        <div className="flex gap-3 rounded-[14px] bg-surface-muted px-5 py-4">
          {b.callout.icon?.type === "emoji" && (
            <span aria-hidden className="leading-[1.85]">
              {b.callout.icon.emoji}
            </span>
          )}
          <div className="min-w-0">
            <RichText text={b.callout.rich_text} />
            <Children block={b} />
          </div>
        </div>
      );
    case "code":
      return <Code code={plain(b.code.rich_text)} language={b.code.language} />;
    case "image":
      return <Figure block={b} sizes="(min-width: 768px) 720px, 100vw" />;
    case "divider":
      return <hr className="my-10 border-border" />;
    case "toggle":
      return (
        <details className="group rounded-[14px] border border-border px-5 py-3">
          <summary className="cursor-pointer font-medium text-text marker:text-muted">
            <RichText text={b.toggle.rich_text} />
          </summary>
          <Children block={b} />
        </details>
      );
    case "bookmark":
      return (
        <a
          href={b.bookmark.url}
          className="block rounded-[14px] border border-border px-5 py-4 transition-colors duration-200 ease-out-quint hover:border-border-strong"
        >
          <span className="block text-text">{plain(b.bookmark.caption) || b.bookmark.url}</span>
          <span className="block truncate text-sm text-muted">{b.bookmark.url}</span>
        </a>
      );
    case "table": {
      const rows = (b.children ?? []).flatMap((r) => (r.type === "table_row" ? [r.table_row.cells] : []));
      const head = b.table.has_column_header ? rows[0] : null;
      const body = head ? rows.slice(1) : rows;
      return (
        <div className="overflow-x-auto rounded-[14px] border border-border">
          <table className="w-full border-collapse text-[0.9375rem]">
            {head && (
              <thead className="bg-surface-muted text-left">
                <tr>
                  {head.map((c, i) => (
                    <th key={i} className="px-4 py-2.5 font-medium text-text">
                      <RichText text={c} />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((row, r) => (
                <tr key={r} className={cn("border-t border-border", !head && "first:border-t-0")}>
                  {row.map((c, i) => {
                    const Cell = b.table.has_row_header && i === 0 ? "th" : "td";
                    return (
                      <Cell key={i} className="px-4 py-2.5 text-left align-top font-normal">
                        <RichText text={c} />
                      </Cell>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "column_list": {
      const cols = b.children ?? [];
      return (
        <div className="grid gap-6 md:grid-flow-col md:auto-cols-fr">
          {cols.map((c) => (
            <Blocks key={c.id} blocks={c.children ?? []} />
          ))}
        </div>
      );
    }
    default:
      if (process.env.NODE_ENV === "development") console.warn(`[notion] unsupported block type: ${b.type}`);
      return null;
  }
}

export function Blocks({ blocks, photo = false, className }: { blocks: Block[]; photo?: boolean; className?: string }) {
  return (
    <div className={cn("[&>*+*]:mt-5 [&>h2]:mt-12 [&>h3]:mt-9", className)}>
      {group(blocks, photo).map((g) => {
        if (g.kind === "ul")
          return (
            <ul key={g.items[0].id} className="list-disc space-y-2 pl-6 marker:text-muted">
              {g.items.map((b) => (
                <BlockView key={b.id} block={b} />
              ))}
            </ul>
          );
        if (g.kind === "ol")
          return (
            <ol key={g.items[0].id} className="list-decimal space-y-2 pl-6 marker:text-muted">
              {g.items.map((b) => (
                <BlockView key={b.id} block={b} />
              ))}
            </ol>
          );
        if (g.kind === "photos")
          return (
            <div key={g.items[0].id} className="my-12! md:my-16!">
              <PhotoGroup images={g.items} />
            </div>
          );
        return photo ? (
          <div key={g.block.id} className="mx-auto max-w-[640px]">
            <BlockView block={g.block} />
          </div>
        ) : (
          <BlockView key={g.block.id} block={g.block} />
        );
      })}
    </div>
  );
}
