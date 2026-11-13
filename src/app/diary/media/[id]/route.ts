import { notionFileUrl } from "@/lib/diary/data";
import { isLoggedIn } from "@/lib/diary/session";

export async function GET(_req: Request, ctx: RouteContext<"/diary/media/[id]">) {
  if (!(await isLoggedIn())) return new Response(null, { status: 401 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{32,36}$/.test(id)) return new Response(null, { status: 404 });
  const file = await notionFileUrl(id).catch((e) => {
    console.error(e);
    return undefined;
  });
  if (file === undefined) return new Response(null, { status: 502 });
  if (!file) return new Response(null, { status: 404 });
  const ttl = file.expiry && !Number.isNaN(file.expiry) ? Math.max(0, Math.min(3000, Math.floor((file.expiry - Date.now()) / 1000) - 60)) : 3000;
  return new Response(null, {
    status: 302,
    headers: { Location: file.url, "Cache-Control": `private, max-age=${ttl}` },
  });
}
