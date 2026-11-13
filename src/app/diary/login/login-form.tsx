"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setMessage("");
    const res = await fetch("/diary/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      router.replace("/diary");
      router.refresh();
      return;
    }
    setMessage(res?.status === 401 ? "密码不对" : "登录失败，请稍后再试");
    setPassword("");
  }

  return (
    <form className="gate" onSubmit={submit}>
      <h1>日记</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="密码"
        autoFocus
        autoComplete="current-password"
        aria-label="密码"
      />
      <button type="submit" disabled={busy}>
        {busy ? "正在进入…" : "进入"}
      </button>
      <p role="status">{message}</p>
    </form>
  );
}
