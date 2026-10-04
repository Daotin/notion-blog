import { revalidatePath, revalidateTag } from "next/cache";
import { NOTION_TAG } from "@/lib/notion";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  if (!process.env.REFRESH_KEY || key !== process.env.REFRESH_KEY) return new Response("Unauthorized", { status: 401 });
  revalidateTag(NOTION_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  return new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>已刷新</title><body style="font:16px/1.6 system-ui;padding:48px 24px;background:oklch(0.975 0.007 80);color:oklch(0.25 0.012 60)"><p>已刷新，网站会显示 Notion 里的最新内容。</p><p><a href="/" style="color:inherit">返回网站 →</a></p>',
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
}
