import { fetchRepoFile } from "@/lib/diary/data";
import { isLoggedIn } from "@/lib/diary/session";

export async function GET(_req: Request, ctx: RouteContext<"/diary/thumbs/[name]">) {
  if (!(await isLoggedIn())) return new Response(null, { status: 401 });
  const { name } = await ctx.params;
  if (!/^[0-9a-f-]+\.jpg$/.test(name)) return new Response(null, { status: 404 });
  const res = await fetchRepoFile(`thumbs/${name}`);
  if (!res.ok) return new Response(null, { status: res.status === 404 ? 404 : 502 });
  return new Response(res.body, {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=31536000, immutable" },
  });
}
