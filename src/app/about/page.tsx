import type { Metadata } from "next";
import { container, PageHeader } from "@/components/entries";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "About" };

const heading = "mb-6 text-[0.95rem] leading-[1.4] font-medium text-muted";
const link = "text-text underline decoration-accent decoration-1 underline-offset-[3px] hover:decoration-2";

export default function AboutPage() {
  const { about } = site;
  return (
    <div className={container}>
      <div className="max-w-[720px] pb-24">
        <PageHeader title="About" text={site.tagline} />
        <p className="text-[1.25rem] leading-[1.75] text-text-body">{about.intro}</p>

        <section className="mt-24">
          <h2 className={heading}>What I care about</h2>
          <ul className="space-y-5">
            {about.cares.map((c) => (
              <li key={c.title} className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <span className="font-medium text-text">{c.title}</span>
                <span className="text-text-body">{c.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-24">
          <h2 className={heading}>Selected experience</h2>
          <ul className="space-y-6">
            {about.experience.map((x) => (
              <li key={x.time + x.role} className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <span className="text-sm text-muted tabular-nums sm:pt-0.5">{x.time}</span>
                <span>
                  <span className="block font-medium text-text">{x.role}</span>
                  <span className="mt-1 block text-text-body">{x.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-24">
          <h2 className={heading}>Contact</h2>
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            <li>
              <a className={link} href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </li>
            {site.socials.map((s) => (
              <li key={s.href}>
                <a className={link} href={s.href}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
