import { Fragment, type ReactNode } from "react";

const TIME = /^###\s+((?:\d{4}-\d{2}-\d{2}\s+)?\d{1,2}:\d{2})\s*$/;
const MEDIA = /!\[[^\]]*\]\(media\/[^)\s]+\)|<(video|audio)\b[^>]*><\/\1>|<(video|audio)\b[^>]*\/>/g;
const INLINE = /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|<br\s*\/?>|\\([!-/:-@[-`{-~])/g;
const LIST = /^(\t*)([-*]|\d+\.)\s+(\[[ xX]\]\s+)?(.*)$/;
const RULE = /^(-{3,}|\*{3,}|(\*\s*){3,})$/;

export type Entry = { time: string | null; body: string };

export function splitEntries(markdown: string): Entry[] {
  const entries: Entry[] = [];
  let cur: { time: string | null; lines: string[] } = { time: null, lines: [] };
  for (const line of markdown.replace(MEDIA, "").split("\n")) {
    const m = line.match(TIME);
    if (m) {
      if (cur.time !== null || cur.lines.some((l) => l.trim())) entries.push({ time: cur.time, body: cur.lines.join("\n") });
      cur = { time: m[1].replace(/\s+/, " "), lines: [] };
    } else cur.lines.push(line);
  }
  if (cur.time !== null || cur.lines.some((l) => l.trim())) entries.push({ time: cur.time, body: cur.lines.join("\n") });
  return entries;
}

export function plainText(markdown: string) {
  return markdown
    .replace(MEDIA, "")
    .split("\n")
    .filter((l) => !TIME.test(l) && !RULE.test(l.trim()) && !l.startsWith("```"))
    .map((l) =>
      l
        .replace(LIST, "$4")
        .replace(/^#{1,6}\s+|^>\s?/, "")
        .replace(INLINE, (_m, b, c, t, _u, e) => b ?? c ?? t ?? e ?? " "),
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [all, bold, code, label, href, esc] = m;
    if (bold !== undefined) out.push(<strong key={k++}>{inline(bold)}</strong>);
    else if (code !== undefined) out.push(<code key={k++}>{code}</code>);
    else if (label !== undefined)
      out.push(
        /^https?:\/\//.test(href) ? (
          <a key={k++} href={href} target="_blank" rel="noreferrer">
            {inline(label)}
          </a>
        ) : (
          label
        ),
      );
    else if (esc !== undefined) out.push(esc);
    else if (/^<br/.test(all)) out.push(<br key={k++} />);
    last = m.index + all.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Item = { text: string; checked: boolean | null; children: Item[] };

function renderList(items: Item[], ordered: boolean, key: number): ReactNode {
  const todo = items.every((i) => i.checked !== null);
  const children = items.map((item, i) => (
    <li key={i}>
      {item.checked !== null && <input type="checkbox" checked={item.checked} readOnly disabled />} {inline(item.text)}
      {item.children.length > 0 && renderList(item.children, false, 0)}
    </li>
  ));
  if (ordered) return <ol key={key}>{children}</ol>;
  return (
    <ul key={key} className={todo ? "todo" : undefined}>
      {children}
    </ul>
  );
}

export function renderBody(body: string): ReactNode {
  const lines = body.split("\n");
  const out: ReactNode[] = [];
  let k = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("```")) {
      const code: string[] = [];
      while (++i < lines.length && !lines[i].trim().startsWith("```")) code.push(lines[i]);
      out.push(
        <pre key={k++}>
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }
    if (RULE.test(trimmed)) {
      out.push(<hr key={k++} />);
      continue;
    }
    const h = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const Tag = `h${h[1].length}` as "h1";
      out.push(<Tag key={k++}>{inline(h[2])}</Tag>);
      continue;
    }
    if (trimmed.startsWith(">")) {
      const quote: string[] = [];
      for (; i < lines.length && lines[i].trim().startsWith(">"); i++) quote.push(lines[i].trim().replace(/^>\s?/, ""));
      i--;
      out.push(
        <blockquote key={k++}>
          {quote.map((q, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {inline(q)}
            </Fragment>
          ))}
        </blockquote>,
      );
      continue;
    }
    const first = line.match(LIST);
    if (first && !first[1]) {
      const ordered = /\d/.test(first[2]);
      const items: Item[] = [];
      for (; i < lines.length; i++) {
        const m = lines[i].match(LIST);
        if (!m) break;
        const item: Item = { text: m[4], checked: m[3] ? /x/i.test(m[3]) : null, children: [] };
        if (m[1] && items.length) items[items.length - 1].children.push(item);
        else if (!m[1] && /\d/.test(m[2]) === ordered) items.push(item);
        else break;
      }
      i--;
      out.push(renderList(items, ordered, k++));
      continue;
    }
    out.push(<p key={k++}>{inline(line)}</p>);
  }
  return out;
}
