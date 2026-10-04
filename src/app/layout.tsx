import type { Metadata } from "next";
import { Geist, Geist_Mono, Literata } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Nav } from "@/components/nav";
import { site } from "@/content/site";
import { getEntries } from "@/lib/notion";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.intro,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const items = (await getEntries()).map((e) => ({
    title: e.title,
    type: e.type,
    url: e.href,
    tags: e.tags,
    summary: e.summary,
  }));
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${literata.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
            <span>© {new Date().getFullYear()}</span>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
