import { unstable_cache } from "next/cache";

export type DiaryMedia = {
  block_id: string;
  type: "image" | "video" | "audio" | "file";
  path: string;
  thumb?: string | null;
};

export type DiaryDay = {
  date: string;
  tags: string[];
  page_id: string;
  last_edited: string;
  markdown: string;
  media: DiaryMedia[];
};

export type DiaryProblem = {
  type: string;
  date: string | null;
  message: string;
  pages: string[];
};

export type DiaryIndex = { problems: DiaryProblem[]; days: DiaryDay[] };

const REPO = "https://api.github.com/repos/Daotin/diary/contents";

function githubToken() {
  const token = process.env.DIARY_GITHUB_TOKEN;
  if (!token) throw new Error("DIARY_GITHUB_TOKEN is not set");
  return token;
}

export function fetchRepoFile(path: string) {
  return fetch(`${REPO}/${path}`, {
    headers: {
      Authorization: `Bearer ${githubToken()}`,
      Accept: "application/vnd.github.raw",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
}

export const getDiaryIndex = unstable_cache(
  async (): Promise<DiaryIndex> => {
    const res = await fetchRepoFile("index.json");
    if (!res.ok) throw new Error(`读取 index.json 失败：${res.status}`);
    return res.json();
  },
  ["diary-index"],
  { revalidate: 60 },
);

type FileValue = { type: "file"; file: { url: string; expiry_time: string } } | { type: "external"; external: { url: string } };

export async function notionFileUrl(blockId: string) {
  const token = process.env.DIARY_NOTION_TOKEN;
  if (!token) throw new Error("DIARY_NOTION_TOKEN is not set");
  const res = await fetch(`https://api.notion.com/v1/blocks/${blockId}`, {
    headers: { Authorization: `Bearer ${token}`, "Notion-Version": "2026-03-11" },
    cache: "no-store",
  });
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error(`读取 Notion 块失败：${res.status}`);
  const block = await res.json();
  const value: FileValue | undefined = block[block.type];
  if (!value || !["image", "video", "audio", "file", "pdf"].includes(block.type)) return null;
  if (value.type === "external") return { url: value.external.url, expiry: null };
  if (value.type === "file") return { url: value.file.url, expiry: Date.parse(value.file.expiry_time) };
  return null;
}
