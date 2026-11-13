"use client";

import { Bell, ChartColumn, LogOut, Moon, Sun } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { DiaryDay, DiaryMedia, DiaryProblem } from "@/lib/diary/data";
import { plainText, renderBody, splitEntries } from "@/lib/diary/markdown";
import { DiaryStats } from "./diary-stats";

const HUE = [0, 255, 345, 125, 8, 150, 200, 275, 100, 75, 30, 50, 175];
const WEEK = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const MEDIA_LABEL = { image: "图", video: "视频", audio: "录音", file: "文件" };

const pad = (n: number) => String(n).padStart(2, "0");
function parse(k: string) {
  const [y, m, d] = k.split("-").map(Number);
  return { y, m, d, w: WEEK[new Date(y, m - 1, d).getDay()] };
}
const mediaUrl = (m: DiaryMedia) => `/diary/media/${m.block_id}`;
function validDate(k: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) return false;
  const { y, m, d } = parse(k);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function Thumb({ day }: { day: DiaryDay | undefined }) {
  const m = day?.media[0];
  if (!m) return null;
  const img = day.media.find((x) => x.type === "image" && x.thumb);
  if (img) return <img src={`/diary/${img.thumb}`} alt="" loading="lazy" />;
  return <span className="ph">{MEDIA_LABEL[m.type]}</span>;
}

type Row = { ym: string; y: number; m: number; n: number } | null;

function railRows(count: Map<string, number>, today: string, first: string): Row[] {
  const rows: Row[] = [];
  let [y, m] = today.split("-").map(Number);
  const [fy, fm] = first.split("-").map(Number);
  let empty: Row[] = [];
  while (y > fy || (y === fy && m >= fm)) {
    const ym = `${y}-${pad(m)}`;
    const row = { ym, y, m, n: count.get(ym) ?? 0 };
    if (row.n) {
      rows.push(...(empty.length >= 12 ? [null] : empty), row);
      empty = [];
    } else empty.push(row);
    if (--m === 0) {
      m = 12;
      y--;
    }
  }
  return rows;
}

export function DiaryApp({
  days,
  problems,
  today,
  notionUrl,
}: {
  days: DiaryDay[];
  problems: DiaryProblem[];
  today: string;
  notionUrl: string | null;
}) {
  const search = useSearchParams();
  const param = search.get("d");
  const cur = param && validDate(param) ? param : today;
  const byDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);
  const keys = useMemo(() => [...new Set([...days.map((d) => d.date), today])].sort(), [days, today]);
  const dataKeys = useMemo(() => days.map((d) => d.date).sort(), [days]);
  const flat = useMemo(() => new Map(days.map((d) => [d.date, plainText(d.markdown)])), [days]);
  const count = useMemo(() => {
    const c = new Map<string, number>();
    for (const k of dataKeys) c.set(k.slice(0, 7), (c.get(k.slice(0, 7)) ?? 0) + 1);
    return c;
  }, [dataKeys]);
  const rows = useMemo(() => railRows(count, today, keys[0]), [count, today, keys]);
  const sParam = search.get("s");
  const range = sParam === null ? null : /^\d{4}$/.test(sParam) && dataKeys.some((k) => k.startsWith(`${sParam}-`)) ? sParam : "all";

  const [shown, setShown] = useState(cur);
  const [view, setView] = useState(cur.slice(0, 7));
  const [input, setInput] = useState("");
  const query = input.trim();
  const [dir, setDir] = useState(0);
  const [showIndex, setShowIndex] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null);
  if (shown !== cur) {
    setShown(cur);
    setDir(cur > shown ? 1 : -1);
    setView(cur.slice(0, 7));
    setShowIndex(false);
    setZoom(null);
  }
  const [notesOpen, setNotesOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const href = (k: string, s: string | null) => {
    const q = new URLSearchParams();
    if (k !== today) q.set("d", k);
    if (s) q.set("s", s);
    const qs = q.toString();
    return qs ? `/diary?${qs}` : "/diary";
  };
  const go = (k: string | undefined) => {
    if (!k) return;
    setShowIndex(false);
    if (k === cur) {
      if (range === null) return;
      setView(k.slice(0, 7));
    }
    window.history.pushState(null, "", href(k, null));
  };
  const toggleStats = () => {
    setShowIndex(false);
    window.history.pushState(null, "", href(cur, range === null ? "all" : null));
  };
  const showMonth = (ym: string) => {
    setView(ym);
    setInput("");
    if (listRef.current) listRef.current.scrollTop = 0;
  };
  const day = byDate.get(cur);
  const images = day?.media.filter((m) => m.type === "image") ?? [];
  const prevKey = keys.findLast((k) => k < cur);
  const nextKey = keys.find((k) => k > cur);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [cur]);
  useEffect(() => {
    listRef.current?.querySelector(".sel")?.scrollIntoView({ block: "nearest" });
  }, [cur, view]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      const t = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "VIDEO", "AUDIO"].includes(t.tagName)) return;
      if (zoom !== null) {
        if (e.key === "Escape") setZoom(null);
        if (e.key === "ArrowLeft") setZoom((zoom + images.length - 1) % images.length);
        if (e.key === "ArrowRight") setZoom((zoom + 1) % images.length);
        return;
      }
      if (range !== null) {
        if (e.key === "Escape") toggleStats();
        return;
      }
      if (e.key === "ArrowLeft") go(prevKey);
      if (e.key === "ArrowRight") go(nextKey);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const results = useMemo(() => {
    if (!query) return [];
    const out: { k: string; before: string; after: string; cut: boolean }[] = [];
    for (let i = dataKeys.length - 1; i >= 0 && out.length < 40; i--) {
      const t = flat.get(dataKeys[i]) ?? "";
      const at = t.indexOf(query);
      if (at < 0) continue;
      const from = Math.max(0, at - 10);
      out.push({ k: dataKeys[i], before: t.slice(from, at), after: t.slice(at + query.length, at + query.length + 60), cut: from > 0 });
    }
    return out;
  }, [query, dataKeys, flat]);

  const [vy, vm] = view.split("-").map(Number);
  const p = parse(cur);
  const entries = day ? splitEntries(day.markdown) : [];
  const others = day?.media.filter((m) => m.type !== "image") ?? [];
  const past: string[] = [];
  for (let y = p.y - 1; y >= Number(keys[0].slice(0, 4)); y--) {
    const k = `${y}-${pad(p.m)}-${pad(p.d)}`;
    if (byDate.has(k)) past.push(k);
  }

  const calendar = [];
  const firstWeekday = new Date(vy, vm - 1, 1).getDay();
  const monthDays = new Date(vy, vm, 0).getDate();
  for (let i = 0; i < firstWeekday; i++) calendar.push(<em key={`e${i}`} />);
  for (let d = 1; d <= monthDays; d++) {
    const k = `${view}-${pad(d)}`;
    const has = byDate.has(k);
    calendar.push(
      has || k === today ? (
        <button
          key={k}
          type="button"
          className={`${has ? "has" : "off"} ${k === today ? "today" : ""} ${k === cur && range === null ? "sel" : ""}`}
          onClick={() => go(k)}
        >
          <b>{d}</b>
        </button>
      ) : (
        <em key={k}>{d}</em>
      ),
    );
  }

  const monthKeys = dataKeys.filter((k) => k.startsWith(view)).reverse();

  async function logout() {
    await fetch("/diary/api/login", { method: "DELETE" }).catch(() => null);
    router.replace("/diary/login");
    router.refresh();
  }

  return (
    <div className="diary" style={{ "--h": HUE[p.m] } as CSSProperties}>
      <div className="top">
        <b>日记</b>
        <span className="acts">
          <button className="menu" type="button" onClick={() => setShowIndex((s) => !s)}>
            目录
          </button>
          <button
            type="button"
            className={range !== null ? "on" : ""}
            aria-label="统计"
            title="统计"
            aria-pressed={range !== null}
            onClick={toggleStats}
          >
            <ChartColumn size={15} strokeWidth={1.6} />
          </button>
          <button className="bell" type="button" aria-label="通知" title="通知" onClick={() => setNotesOpen((o) => !o)}>
            <Bell size={15} strokeWidth={1.6} />
            {problems.length > 0 && <span className="dot">{problems.length}</span>}
          </button>
          <button
            type="button"
            aria-label="切换日间 / 夜间"
            title="切换日间 / 夜间"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <Moon className="to-dark" size={15} strokeWidth={1.6} />
            <Sun className="to-light" size={15} strokeWidth={1.6} />
          </button>
          <button type="button" aria-label="退出" title="退出" onClick={logout}>
            <LogOut size={15} strokeWidth={1.6} />
          </button>
        </span>
      </div>
      {notesOpen && (
        <ul className="notes">
          {problems.length === 0 ? (
            <li>没有需要处理的问题</li>
          ) : (
            problems.map((x, i) => (
              <li key={i}>
                {x.message}
                {x.pages.map((u) => (
                  <a key={u} href={u} target="_blank" rel="noreferrer">
                    {u}
                  </a>
                ))}
              </li>
            ))
          )}
        </ul>
      )}
      <div className={`book ${showIndex ? "show-index" : ""}`}>
        <section className="page left">
          <nav className="rail" aria-label="按年月查看">
            {rows.map((r, i) =>
              r === null ? (
                <div key={`gap${i}`} className="mo gap" />
              ) : (
                <div
                  key={r.ym}
                  className={`mo ${r.n ? "has" : ""} ${r.ym === view ? "cur" : ""}`}
                  style={{ "--n": r.n } as CSSProperties}
                  onClick={() => showMonth(r.ym)}
                >
                  {(i === 0 || r.m === 12 || rows[i - 1] === null) && <span className="y">{r.y}</span>}
                  <span className="tip">
                    {r.y}年{r.m}月{r.n ? `，${r.n} 天` : "，没有日记"}
                  </span>
                  <i />
                </div>
              ),
            )}
          </nav>
          <div className="pane">
            <div className="mh">
              <h2>{vm}月</h2>
              <span>
                {vy}，{count.get(view) ? `${count.get(view)} 天` : "还没有日记"}
              </span>
              <input
                ref={searchRef}
                type="text"
                placeholder="搜索"
                value={input}
                autoComplete="off"
                aria-label="搜索日记"
                onChange={(e) => {
                  setInput(e.target.value);
                  if (listRef.current) listRef.current.scrollTop = 0;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setInput("");
                    e.currentTarget.blur();
                  }
                  if (e.key === "Enter" && results[0]) go(results[0].k);
                }}
              />
              {(cur !== today || view !== today.slice(0, 7) || range !== null) && (
                <button
                  className="now"
                  type="button"
                  onClick={() => {
                    setInput("");
                    go(today);
                  }}
                >
                  今天
                </button>
              )}
            </div>
            <div className="cal">
              {"日一二三四五六".split("").map((w) => (
                <span key={w}>{w}</span>
              ))}
              {calendar}
            </div>
            <ul className="list" ref={listRef}>
              {query ? (
                <>
                  <h3>
                    搜索“{query}”，{results.length} 天
                  </h3>
                  {results.length === 0 && <li className="none">没有找到</li>}
                  {results.map((r) => {
                    const q = parse(r.k);
                    return (
                      <li key={r.k} className={`hit ${r.k === cur && range === null ? "sel" : ""}`} onClick={() => go(r.k)}>
                        <div className="d">
                          {q.y}
                          <br />
                          {q.m}月{q.d}日
                        </div>
                        <p>
                          {r.cut && "…"}
                          {r.before}
                          <mark>{query}</mark>
                          {r.after}
                        </p>
                      </li>
                    );
                  })}
                </>
              ) : monthKeys.length === 0 ? (
                <li className="none">这个月还没有日记。</li>
              ) : (
                monthKeys.map((k) => {
                  const q = parse(k);
                  return (
                    <li key={k} className={k === cur && range === null ? "sel" : ""} onClick={() => go(k)}>
                      <div className="d">
                        {q.d}
                        <small>{q.w}</small>
                      </div>
                      <p>{(flat.get(k) ?? "").slice(0, 90)}</p>
                      <Thumb day={byDate.get(k)} />
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </section>
        {range !== null ? (
          <DiaryStats
            days={days}
            flat={flat}
            today={today}
            range={range}
            view={view}
            onRange={(r) => window.history.replaceState(null, "", href(cur, r))}
            onGo={go}
            onView={(ym) => {
              showMonth(ym);
              if (window.matchMedia("(max-width: 900px)").matches) setShowIndex(true);
            }}
            onClose={toggleStats}
          />
        ) : (
        <section className="page right">
          <header className="dh">
            <div className="num">{p.d}</div>
            <div className="when">
              {p.m}月 · {p.w}
              <span>{p.y}</span>
            </div>
            <div className="flip">
              <button type="button" aria-label="前一天" disabled={!prevKey} onClick={() => go(prevKey)}>
                ‹
              </button>
              <button type="button" aria-label="后一天" disabled={!nextKey} onClick={() => go(nextKey)}>
                ›
              </button>
            </div>
          </header>
          <div className="scroll" ref={scrollRef}>
            <div key={cur} className="in" style={{ "--dx": `${dir * 14}px` } as CSSProperties}>
              {past.length > 0 && (
                <aside className="past">
                  <h4>
                    往年今日，{p.m}月{p.d}日
                  </h4>
                  <ul>
                    {past.map((k) => (
                      <li key={k} tabIndex={0} onClick={() => go(k)} onKeyDown={(e) => e.key === "Enter" && go(k)}>
                        <b>{k.slice(0, 4)}</b>
                        <p>{(flat.get(k) ?? "").slice(0, 80)}</p>
                        <Thumb day={byDate.get(k)} />
                      </li>
                    ))}
                  </ul>
                </aside>
              )}
              {entries.map((e, i) => (
                <div className="entry" key={i}>
                  {e.time && <div className="clock">{e.time}</div>}
                  <div className="text">{renderBody(e.body)}</div>
                </div>
              ))}
              {cur === today ? (
                <p className="write">
                  {notionUrl ? (
                    <a href={notionUrl} target="_blank" rel="noreferrer">
                      {day ? "在 Notion 里继续写 →" : "今天还没写日记，去 Notion 写 →"}
                    </a>
                  ) : day ? null : (
                    "今天还没写日记。"
                  )}
                </p>
              ) : (
                !day && <p className="write">这一天没有日记。</p>
              )}
              {images.length > 0 && (
                <div className={`shots ${images.length === 1 ? "one" : ""}`}>
                  {images.map((m, i) => (
                    <img key={m.block_id} src={mediaUrl(m)} alt="" loading="lazy" onClick={() => setZoom(i)} />
                  ))}
                </div>
              )}
              {others.length > 0 && (
                <div className="av">
                  {others.map((m) =>
                    m.type === "video" ? (
                      <video key={m.block_id} src={mediaUrl(m)} controls preload="metadata" />
                    ) : m.type === "audio" ? (
                      <audio key={m.block_id} src={mediaUrl(m)} controls preload="none" />
                    ) : (
                      <a key={m.block_id} href={mediaUrl(m)} target="_blank" rel="noreferrer">
                        附件
                      </a>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
        )}
      </div>
      {zoom !== null && images[zoom] && (
        <div className="zoom" role="dialog" aria-label="查看图片" onClick={() => setZoom(null)}>
          <img src={mediaUrl(images[zoom])} alt="" />
          {images.length > 1 && (
            <span>
              {zoom + 1} / {images.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
