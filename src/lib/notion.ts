import {
  Client,
  collectPaginatedAPI,
  isFullBlock,
  isFullPage,
  type BlockObjectResponse,
  type ImageBlockObjectResponse,
  type PageObjectResponse,
  type RichTextItemResponse,
} from "@notionhq/client";
import { unstable_cache } from "next/cache";

export type EntryType = "Writing" | "Project" | "Photography" | "Life";

export type Entry = {
  id: string;
  type: EntryType;
  title: string;
  slug: string;
  href: string;
  date: string | null;
  tags: string[];
  summary: string;
  location: string;
  featured: boolean;
  cover: string | null;
};

export type Block = BlockObjectResponse & { children?: Block[] };

export const sectionPath: Record<EntryType, string> = {
  Writing: "/writing",
  Project: "/projects",
  Photography: "/photography",
  Life: "/life",
};

const REVALIDATE = 600;
const DATA_SOURCE_ID = "0b416b3d-a189-4a33-b5ca-b2ae17b1c647";

let client: Client | undefined;

function notion() {
  if (!process.env.NOTION_TOKEN) throw new Error("NOTION_TOKEN is not set");
  client ??= new Client({ auth: process.env.NOTION_TOKEN, retry: { maxRetries: 5 } });
  return client;
}

let active = 0;
const waiting: (() => void)[] = [];

async function limit<T>(fn: () => Promise<T>): Promise<T> {
  if (active < 3) active++;
  else await new Promise<void>((resolve) => waiting.push(resolve));
  try {
    return await fn();
  } finally {
    const next = waiting.shift();
    if (next) next();
    else active--;
  }
}

export const plain = (rich: RichTextItemResponse[]) => rich.map((t) => t.plain_text).join("");

const normalizeId = (id: string) => id.replaceAll("-", "");

export function imageSrc(block: ImageBlockObjectResponse) {
  return block.image.type === "external" ? block.image.external.url : `/img/block/${block.id}`;
}

function toEntry(page: PageObjectResponse): Entry | null {
  const p = page.properties;
  const type = p.Type?.type === "select" ? p.Type.select?.name : undefined;
  if (!type || !(type in sectionPath)) return null;
  const text = (name: string) => {
    const v = p[name];
    if (v?.type === "rich_text") return plain(v.rich_text).trim();
    if (v?.type === "title") return plain(v.title).trim();
    return "";
  };
  const slug = text("Slug") || normalizeId(page.id);
  const entryType = type as EntryType;
  return {
    id: page.id,
    type: entryType,
    title: text("Title"),
    slug,
    href: `${sectionPath[entryType]}/${slug}`,
    date: p.Date?.type === "date" ? (p.Date.date?.start ?? null) : null,
    tags: p.Tags?.type === "multi_select" ? p.Tags.multi_select.map((t) => t.name) : [],
    summary: text("Summary"),
    location: text("Location"),
    featured: p.Featured?.type === "checkbox" && p.Featured.checkbox,
    cover: !page.cover
      ? null
      : page.cover.type === "external"
        ? page.cover.external.url
        : `/img/cover/${page.id}`,
  };
}

async function fetchChildren(id: string): Promise<Block[]> {
  const list = await collectPaginatedAPI(
    (args: Parameters<Client["blocks"]["children"]["list"]>[0]) => limit(() => notion().blocks.children.list(args)),
    { block_id: id, page_size: 100 },
  );
  return Promise.all(
    list.filter(isFullBlock).map(async (b) =>
      b.has_children && b.type !== "child_page" && b.type !== "child_database"
        ? { ...b, children: await fetchChildren(b.id) }
        : b,
    ),
  );
}

export const getBlocks = unstable_cache(fetchChildren, ["notion-blocks"], { revalidate: REVALIDATE });

export function findImage(blocks: Block[]): ImageBlockObjectResponse | undefined {
  for (const b of blocks) {
    if (b.type === "image") return b;
    const inner = b.children && findImage(b.children);
    if (inner) return inner;
  }
}

export const getEntries = unstable_cache(
  async () => {
    const pages = await collectPaginatedAPI(
      (args: Parameters<Client["dataSources"]["query"]>[0]) => limit(() => notion().dataSources.query(args)),
      {
        data_source_id: DATA_SOURCE_ID,
        filter: { property: "Publish", checkbox: { equals: true } },
        sorts: [{ property: "Date", direction: "descending" }],
      },
    );
    const entries = pages.filter(isFullPage).flatMap((p) => toEntry(p) ?? []);
    await Promise.all(
      entries
        .filter((e) => e.type === "Photography" && !e.cover)
        .map(async (e) => {
          const image = findImage(await getBlocks(e.id));
          if (image) e.cover = imageSrc(image);
        }),
    );
    return entries;
  },
  ["notion-entries"],
  { revalidate: REVALIDATE },
);

export async function getEntriesOf(type: EntryType) {
  return (await getEntries()).filter((e) => e.type === type);
}

export async function getEntry(type: EntryType, slug: string) {
  return (await getEntries()).find((e) => e.type === type && e.slug === slug);
}

export function blockText(blocks: Block[]): string {
  return blocks
    .map((b) => {
      const value = (b as unknown as Record<string, { rich_text?: RichTextItemResponse[] }>)[b.type];
      return (value?.rich_text ? plain(value.rich_text) : "") + (b.children ? blockText(b.children) : "");
    })
    .join("");
}

export function isShort(blocks: Block[]) {
  return !findImage(blocks) && [...blockText(blocks)].length <= 280;
}

async function isPublished(pageId: string) {
  return (await getEntries()).some((e) => normalizeId(e.id) === normalizeId(pageId));
}

export async function notionFileUrl(kind: "cover" | "block", id: string): Promise<string | null> {
  try {
    if (kind === "cover") {
      const page = await limit(() => notion().pages.retrieve({ page_id: id }));
      if (!isFullPage(page) || page.cover?.type !== "file" || !(await isPublished(page.id))) return null;
      return page.cover.file.url;
    }
    const block = await limit(() => notion().blocks.retrieve({ block_id: id }));
    if (!isFullBlock(block) || block.type !== "image" || block.image.type !== "file") return null;
    let parent = block.parent;
    for (let depth = 0; parent.type === "block_id" && depth < 8; depth++) {
      const up = await limit(() => notion().blocks.retrieve({ block_id: (parent as { block_id: string }).block_id }));
      if (!isFullBlock(up)) return null;
      parent = up.parent;
    }
    if (parent.type !== "page_id" || !(await isPublished(parent.page_id))) return null;
    return block.image.file.url;
  } catch {
    return null;
  }
}
