import { cookies } from "next/headers";
import { checkPassword, createSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/diary/session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!(await checkPassword(password))) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return Response.json({ error: "密码不对" }, { status: 401 });
  }
  (await cookies()).set(SESSION_COOKIE, await createSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/diary",
    maxAge: SESSION_MAX_AGE,
  });
  return Response.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/diary" });
  return Response.json({ ok: true });
}
