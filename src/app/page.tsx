import Link from "next/link";
import { container, PostList, ProjectCard } from "@/components/entries";
import { Img } from "@/components/img";
import { site } from "@/content/site";
import { getEntriesOf, type Entry } from "@/lib/notion";
import { cn, formatMonth, yearOf } from "@/lib/utils";

export const revalidate = 600;

const section = "mt-[clamp(96px,14vw,176px)]";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-6 text-[0.95rem] leading-[1.4] font-medium text-muted">{children}</h2>;
}

function SelectedWork({ projects }: { projects: Entry[] }) {
  if (projects.length === 4)
    return (
      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        {[0, 1].map((col) => (
          <div key={col} className="grid gap-6">
            {projects
              .filter((_, i) => i % 2 === col)
              .map((p) => (
                <ProjectCard key={p.id} entry={p} large coverClass={col === 0 ? "aspect-[4/3]" : "aspect-[16/10]"} />
              ))}
          </div>
        ))}
      </div>
    );
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {projects.map((p, i) => {
        const wide = projects.length % 2 === 1 && i === 0;
        return (
          <div key={p.id} className={cn(wide && "md:col-span-2")}>
            <ProjectCard
              entry={p}
              large
              coverClass={wide ? "aspect-[16/10] md:aspect-[21/9]" : "aspect-[16/10]"}
              sizes={wide ? "(min-width: 1120px) 1056px, 100vw" : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}

function PhotoTile({ entry, className, sizes }: { entry: Entry; className: string; sizes: string }) {
  return (
    <Link href={entry.href} className={cn("group relative block overflow-hidden rounded-[14px] bg-surface-muted", className)}>
      {entry.cover && (
        <Img
          src={entry.cover}
          alt={entry.title}
          fill
          sizes={sizes}
          className="transition duration-250 ease-out-quint group-hover:scale-[1.02]"
        />
      )}
      <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[oklch(0.2_0.01_60/0.55)] to-transparent px-4 pt-10 pb-3 text-sm text-[oklch(0.97_0.007_80)] opacity-0 transition-opacity duration-200 ease-out-quint group-hover:opacity-100 group-focus-visible:opacity-100">
        {[entry.title, yearOf(entry.date)].filter(Boolean).join(" · ")}
      </span>
    </Link>
  );
}

function PhotoGrid({ photos }: { photos: Entry[] }) {
  const [a, b, c, ...rest] = photos;
  return (
    <div className="grid grid-cols-12 gap-3 md:gap-4">
      {a && (
        <PhotoTile
          entry={a}
          className={cn(
            "col-span-12 aspect-[4/5]",
            c ? "md:col-span-7 md:row-span-2 md:aspect-auto" : b ? "md:col-span-7 md:aspect-[4/3]" : "md:aspect-[21/9]",
          )}
          sizes="(min-width: 768px) 60vw, 100vw"
        />
      )}
      {[b, c].filter((p): p is Entry => !!p).map((p) => (
        <PhotoTile
          key={p.id}
          entry={p}
          className={cn("aspect-[4/3] md:col-span-5", c ? "col-span-6" : "col-span-12 md:aspect-auto")}
          sizes="(min-width: 768px) 40vw, 50vw"
        />
      ))}
      {rest.map((p, i) => (
        <PhotoTile
          key={p.id}
          entry={p}
          className={cn(
            "col-span-12 aspect-[16/10]",
            rest.length === 1 ? "md:aspect-[21/9]" : i === 0 ? "md:col-span-5 md:aspect-auto" : "md:col-span-7",
          )}
          sizes="(min-width: 768px) 60vw, 100vw"
        />
      ))}
    </div>
  );
}

export default async function Home() {
  const [projects, writing, photos, life] = await Promise.all([
    getEntriesOf("Project"),
    getEntriesOf("Writing"),
    getEntriesOf("Photography"),
    getEntriesOf("Life"),
  ]);
  const featured = projects.filter((p) => p.featured).slice(0, 4);

  return (
    <div className={cn(container, "pb-24")}>
      <section className="flex min-h-[80svh] flex-col justify-center py-16">
        <h1 className="font-serif text-[clamp(3.5rem,9vw,7rem)] leading-none font-normal tracking-[-0.02em]">{site.name}</h1>
        <p className="mt-6 text-[1.0625rem] text-muted">{site.tagline}</p>
        <p className="mt-3 max-w-[36ch] text-[1.25rem] leading-relaxed text-text-body">{site.intro}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="inline-flex h-10 items-center rounded-[10px] bg-text px-5 text-[0.9375rem] font-medium text-bg transition-opacity duration-200 ease-out-quint hover:opacity-85"
          >
            Explore my work
          </Link>
          <Link
            href="/about"
            className="inline-flex h-10 items-center rounded-[10px] border border-border px-5 text-[0.9375rem] font-medium text-text transition-colors duration-200 ease-out-quint hover:border-border-strong"
          >
            About me
          </Link>
        </div>
        <p className="mt-12 flex items-center gap-2.5 text-[0.9375rem] text-muted">
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-accent" />
          <span className="text-text">Now</span>
          <span>{site.now}</span>
        </p>
      </section>

      {featured.length > 0 && (
        <section className={section}>
          <SectionTitle>Selected Work</SectionTitle>
          <SelectedWork projects={featured} />
        </section>
      )}

      {writing.length > 0 && (
        <section className={section}>
          <SectionTitle>Recent Writing</SectionTitle>
          <PostList entries={writing.slice(0, 5)} />
          <Link href="/writing" className="mt-6 inline-block text-[0.9375rem] text-text hover:text-muted">
            View all writing →
          </Link>
        </section>
      )}

      {photos.length > 0 && (
        <section className={section}>
          <SectionTitle>Photography</SectionTitle>
          <PhotoGrid photos={photos.slice(0, 5)} />
          <Link href="/photography" className="mt-6 inline-block text-[0.9375rem] text-text hover:text-muted">
            View photography →
          </Link>
        </section>
      )}

      {life.length > 0 && (
        <section className={section}>
          <SectionTitle>Life</SectionTitle>
          <ul className="space-y-8">
            {life.slice(0, 3).map((e) => (
              <li key={e.id}>
                <Link href={e.href} className="group grid gap-1 md:grid-cols-[10rem_1fr] md:gap-8">
                  <span className="text-sm text-muted tabular-nums md:pt-0.5">{formatMonth(e.date)}</span>
                  <span>
                    <span className="block font-medium text-text group-hover:text-muted">{e.title}</span>
                    {e.summary && <span className="mt-1 block text-[0.9375rem] text-muted">{e.summary}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
