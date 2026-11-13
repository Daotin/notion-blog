"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import type { DiaryDay } from "@/lib/diary/data";
import { splitEntries } from "@/lib/diary/markdown";

type DayStat = { date: string; chars: number; n: number; img: number; aud: number; vid: number };
type Tip = { text: string; x: number; y: number };

const pad = (n: number) => String(n).padStart(2, "0");
const cn = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return `${y}年${m}月${d}日`;
};
const level = (c: number) => (c <= 100 ? 1 : c <= 300 ? 2 : c <= 800 ? 3 : 4);
const sum = (list: DayStat[], f: (d: DayStat) => number) => list.reduce((a, d) => a + f(d), 0);

function longest(dates: string[]) {
  let best: { start: string; end: string; n: number } | null = null;
  let run: { start: string; end: string; n: number; t: number } | null = null;
  for (const k of dates) {
    const [y, m, d] = k.split("-").map(Number);
    const t = Date.UTC(y, m - 1, d);
    if (run && t - run.t === 864e5) run = { start: run.start, end: k, n: run.n + 1, t };
    else run = { start: k, end: k, n: 1, t };
    if (!best || run.n >= best.n) best = { start: run.start, end: run.end, n: run.n };
  }
  return best;
}

function pick(list: DayStat[], f: (d: DayStat) => number, tie: (d: DayStat) => number | string) {
  let best: DayStat | null = null;
  for (const d of list) if (!best || f(d) > f(best) || (f(d) === f(best) && tie(d) > tie(best))) best = d;
  return best;
}

export function DiaryStats({
  days,
  flat,
  today,
  range,
  view,
  onRange,
  onGo,
  onView,
  onClose,
}: {
  days: DiaryDay[];
  flat: Map<string, string>;
  today: string;
  range: string;
  view: string;
  onRange: (r: string) => void;
  onGo: (k: string) => void;
  onView: (ym: string) => void;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(
    () =>
      days
        .map((d) => ({
          date: d.date,
          chars: Array.from((flat.get(d.date) ?? "").replace(/\s/g, "")).length,
          n: splitEntries(d.markdown).filter((e) => e.time).length,
          img: d.media.filter((m) => m.type === "image").length,
          aud: d.media.filter((m) => m.type === "audio").length,
          vid: d.media.filter((m) => m.type === "video").length,
        }))
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
    [days, flat],
  );
  const byDate = useMemo(() => new Map(stats.map((d) => [d.date, d])), [stats]);
  const years = useMemo(() => [...new Set(stats.map((d) => d.date.slice(0, 4)))].reverse(), [stats]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const all = range === "all";
  const sel = all ? stats : stats.filter((d) => d.date.startsWith(range));
  const lg = longest(sel.map((d) => d.date));
  const chars = sum(sel, (d) => d.chars);
  const snippet = (k: string) => Array.from(flat.get(k) ?? "").slice(0, 60).join("");

  const choose = (r: string) => {
    setOpen(false);
    if (r === range) return;
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    onRange(r);
  };
  const showTip = (e: MouseEvent<HTMLDivElement>) => {
    const c = (e.target as HTMLElement).closest<HTMLElement>("[data-tip]");
    if (!c) return setTip(null);
    const r = c.getBoundingClientRect();
    setTip({ text: c.dataset.tip ?? "", x: r.left + r.width / 2, y: r.top });
  };

  const best = [
    lg && { key: "streak", label: "连续写得最久", go: lg.start, num: lg.n, unit: "天", date: lg.start === lg.end ? cn(lg.start) : `${cn(lg.start)} 到 ${cn(lg.end)}`, text: "" },
    ...(
      [
        ["写得最长", pick(sel, (d) => d.chars, (d) => d.date), (d: DayStat) => d.chars, "字"],
        ["一天写得最多", pick(sel, (d) => d.n, (d) => d.chars), (d: DayStat) => d.n, "条"],
        ["照片最多", pick(sel, (d) => d.img, (d) => d.date), (d: DayStat) => d.img, "张照片"],
      ] as const
    ).map(([label, d, f, unit]) =>
      d && f(d) > 0 ? { key: label, label, go: d.date, num: f(d), unit, date: cn(d.date), text: snippet(d.date) } : null,
    ),
  ].filter((x): x is NonNullable<typeof x> => !!x);

  let table;
  if (all) {
    const ys: string[] = [];
    for (let y = Number(years[0]); y >= Number(years[years.length - 1]); y--) ys.push(String(y));
    const rows = ys.map((y) => ({ key: y, label: y, list: stats.filter((d) => d.date.startsWith(y)) }));
    const max = Math.max(...rows.map((r) => r.list.length));
    table = rows.map((r) => ({ ...r, w: (r.list.length / max) * 60 }));
  } else {
    table = Array.from({ length: 12 }, (_, i) => {
      const ym = `${range}-${pad(12 - i)}`;
      const list = sel.filter((d) => d.date.startsWith(ym));
      return { key: ym, label: `${12 - i}月`, list, w: (list.length / 31) * 60 };
    });
  }

  const grid = [];
  if (!all) {
    const y = Number(range);
    grid.push(<span key="h" />);
    for (let i = 1; i <= 31; i++) grid.push(<span key={`n${i}`} className="dn">{i === 1 || i % 5 === 0 ? i : ""}</span>);
    for (let m = 1; m <= 12; m++) {
      const ym = `${y}-${pad(m)}`;
      const md = new Date(y, m, 0).getDate();
      grid.push(
        <button key={ym} type="button" className={`ml ${ym === view ? "cur" : ""}`} onClick={() => onView(ym)}>
          {m}月
        </button>,
      );
      for (let d = 1; d <= 31; d++) {
        const k = `${ym}-${pad(d)}`;
        const x = byDate.get(k);
        if (d > md) grid.push(<i key={k} className="c no" />);
        else if (x) {
          const label = `${m}月${d}日，${x.chars} 字${x.n > 1 ? `，${x.n} 条` : ""}`;
          grid.push(
            <button
              key={k}
              type="button"
              aria-label={label}
              className={`c l${level(x.chars)} ${k === today ? "today" : ""}`}
              data-tip={label}
              onClick={() => onGo(k)}
            />,
          );
        } else
          grid.push(
            <i key={k} className={`c ${k > today ? "fu" : ""} ${k === today ? "today" : ""}`} data-tip={`${m}月${d}日，没有日记`} />,
          );
      }
    }
  }

  return (
    <section className="page right">
      <header className="dh sh">
        <h2>统计</h2>
        <div className="rg" ref={menuRef}>
          <button type="button" className="rgb" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {all ? "全部" : `${range} 年`}
            <span>▾</span>
          </button>
          {open && (
            <ul className="rgm">
              {[["all", "全部", stats.length] as const, ...years.map((y) => [y, `${y} 年`, stats.filter((d) => d.date.startsWith(y)).length] as const)].map(
                ([v, t, n]) => (
                  <li key={v}>
                    <button type="button" className={v === range ? "on" : ""} onClick={() => choose(v)}>
                      {t}
                      <span>{n} 天</span>
                    </button>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
        <button className="x" type="button" onClick={onClose}>
          回到日记
        </button>
      </header>
      <div className="scroll" ref={scrollRef} onScroll={() => setTip(null)}>
        <div className="in">
          <div className="tot">
            <div>
              <b>{sel.length}</b>
              <span>天</span>
            </div>
            <div>
              <b>{sum(sel, (d) => d.n)}</b>
              <span>条</span>
            </div>
            <div>
              <b>{chars >= 10000 ? (chars / 10000).toFixed(1) : chars}</b>
              <span>{chars >= 10000 ? "万字" : "字"}</span>
            </div>
            <div className="media">
              <b>{sum(sel, (d) => d.img)}</b>
              <span>张照片</span>
            </div>
            <div className="media">
              <b>{sum(sel, (d) => d.aud)}</b>
              <span>段录音</span>
            </div>
            <div className="media">
              <b>{sum(sel, (d) => d.vid)}</b>
              <span>个视频</span>
            </div>
          </div>
          {!all && (
            <section className="st-sec">
              <h4>
                每天
                <span className="legend">
                  少
                  {[1, 2, 3, 4].map((l) => (
                    <i key={l} className={`l${l}`} />
                  ))}
                  多
                </span>
              </h4>
              <div className="grid" onMouseOver={showTip} onMouseLeave={() => setTip(null)}>
                {grid}
              </div>
            </section>
          )}
          <section className="st-sec">
            <h4>{all ? "每年" : "每月"}</h4>
            <table className="tbl">
              <thead>
                <tr>
                  <th>{all ? "年份" : "月份"}</th>
                  <th>天数</th>
                  <th>条数</th>
                  <th>字数</th>
                  <th>照片</th>
                </tr>
              </thead>
              <tbody>
                {table.map((r) => (
                  <tr key={r.key} className={r.list.length ? "go" : "zero"} onClick={r.list.length ? () => (all ? choose(r.key) : onView(r.key)) : undefined}>
                    <td>{r.label}</td>
                    <td>
                      <span className="bar" style={{ width: `${r.w}px` }} />
                      {r.list.length}
                    </td>
                    <td>{sum(r.list, (d) => d.n)}</td>
                    <td>{sum(r.list, (d) => d.chars)}</td>
                    <td>{sum(r.list, (d) => d.img)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          {best.length > 0 && (
            <section className="st-sec">
              <h4>之最</h4>
              <ul className="best">
                {best.map((b) => (
                  <li key={b.key} tabIndex={0} onClick={() => onGo(b.go)} onKeyDown={(e) => e.key === "Enter" && onGo(b.go)}>
                    <span className="k">{b.label}</span>
                    <div className="v">
                      <b>{b.num}</b>
                      <span>{b.unit}</span>
                    </div>
                    <p>
                      <span className="dt">{b.date}</span>
                      {b.text}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
      {tip && (
        <span className="gtip" style={{ left: tip.x, top: tip.y }}>
          {tip.text}
        </span>
      )}
    </section>
  );
}
