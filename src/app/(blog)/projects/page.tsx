import type { Metadata } from "next";
import { container, Empty, PageHeader, ProjectCard } from "@/components/entries";
import { site } from "@/content/site";
import { getEntriesOf } from "@/lib/notion";

export const revalidate = 600;
export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await getEntriesOf("Project");
  return (
    <div className={container}>
      <PageHeader title="Projects" text={site.sections.projects} />
      {projects.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-6 pb-24 lg:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.id} entry={p} />
          ))}
        </div>
      )}
    </div>
  );
}
