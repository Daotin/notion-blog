import { notionFileUrl } from "@/lib/notion";

export async function GET(_req: Request, ctx: RouteContext<"/img/[kind]/[id]">) {
  const { kind, id } = await ctx.params;
  if (kind !== "cover" && kind !== "block") return new Response(null, { status: 404 });
  const url = await notionFileUrl(kind, id);
  if (!url) return new Response(null, { status: 404 });
  return new Response(null, {
    status: 302,
    headers: { Location: url, "Cache-Control": "public, max-age=3000, s-maxage=3000" },
  });
}
