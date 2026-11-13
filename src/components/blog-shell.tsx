import { Nav } from "@/components/nav";
import { site } from "@/content/site";
import { getEntries } from "@/lib/notion";

export async function BlogShell({ children }: { children: React.ReactNode }) {
  const items = (await getEntries()).map((e) => ({
    title: e.title,
    type: e.type,
    url: e.href,
    tags: e.tags,
    summary: e.summary,
  }));
  return (
    <div className="flex min-h-dvh flex-col">
      <Nav items={items} />
      <main className="page-enter flex-1">{children}</main>
      <footer className="px-5 py-12 text-center text-sm text-muted md:px-8">
        <span>{site.name}</span>
        <span aria-hidden> · </span>
        <a className="hover:text-text" href={site.github}>
          GitHub
        </a>
        <span aria-hidden> · </span>
        <a className="hover:text-text" href={`mailto:${site.email}`}>
          Email
        </a>
        <span aria-hidden> · </span>
        <a className="hover:text-text" href={site.tools}>
          Tools
        </a>
        <span aria-hidden> · </span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
