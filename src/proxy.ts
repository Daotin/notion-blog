import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/diary/session";

const PUBLIC = ["/diary/login", "/diary/api/login"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (PUBLIC.includes(path)) return NextResponse.next();
  if (await verifySession(req.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();
  if (path === "/diary") return NextResponse.redirect(new URL("/diary/login", req.url));
  return new NextResponse(null, { status: 401 });
}

export const config = {
  matcher: ["/diary", "/diary/:path*"],
};
