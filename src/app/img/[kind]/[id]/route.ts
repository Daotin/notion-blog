import { notionFileUrl } from "@/lib/notion";

const notFound = () => new Response(null, { status: 404, headers: { "Cache-Control": "public, s-maxage=600" } });

export async function GET(_req: Request, ctx: RouteContext<"/img/[kind]/[id]">) {
  const { kind, id } = await ctx.params;
  if (kind !== "cover" && kind !== "block") return notFound();
  const file = await notionFileUrl(kind, id);
  if (!file) return notFound();
  const ttl = Math.max(0, Math.min(3000, Math.floor((Date.parse(file.expiry_time) - Date.now()) / 1000) - 60));
  return new Response(null, {
    status: 302,
    headers: { Location: file.url, "Cache-Control": `public, max-age=${ttl}, s-maxage=${ttl}` },
  });
}
