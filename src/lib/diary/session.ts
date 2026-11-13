import { cookies } from "next/headers";

export const SESSION_COOKIE = "diary_session";
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

const encoder = new TextEncoder();

function secret() {
  const value = process.env.DIARY_SECRET;
  if (!value) throw new Error("DIARY_SECRET is not set");
  return value;
}

function toBase64Url(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function hmac(data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
}

function sameString(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSession() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  return `${expires}.${await hmac(String(expires))}`;
}

export async function verifySession(token: string | undefined) {
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) * 1000 < Date.now()) return false;
  return sameString(signature, await hmac(expires));
}

export async function checkPassword(input: string) {
  const expected = process.env.DIARY_PASSWORD;
  if (!expected) throw new Error("DIARY_PASSWORD is not set");
  return sameString(await hmac(`password:${input}`), await hmac(`password:${expected}`));
}

export async function isLoggedIn() {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}
