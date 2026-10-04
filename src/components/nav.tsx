"use client";

import { Menu, Moon, Search as SearchIcon, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Search, type SearchItem } from "@/components/search";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/writing", label: "Writing" },
  { href: "/projects", label: "Projects" },
  { href: "/photography", label: "Photography" },
  { href: "/life", label: "Life" },
  { href: "/about", label: "About" },
];

const iconButton =
  "inline-flex size-10 items-center justify-center rounded-[10px] text-muted transition-colors duration-200 ease-out-quint hover:bg-surface-muted hover:text-text";

export function Nav({ items }: { items: SearchItem[] }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-colors duration-200 ease-out-quint",
          scrolled || menuOpen ? "border-border bg-bg" : "border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-6 px-5 md:px-8">
          <Link href="/" className="font-semibold text-text" onClick={() => setMenuOpen(false)}>
            {site.name}
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={cn(
                  "relative py-1 text-[0.9375rem] transition-colors duration-200 ease-out-quint hover:text-text",
                  isActive(l.href)
                    ? "text-text after:absolute after:inset-x-0 after:-bottom-1 after:mx-auto after:h-0.5 after:w-4 after:rounded-full after:bg-accent"
                    : "text-muted",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden h-10 items-center gap-3 rounded-[10px] border border-border px-3 text-sm text-muted transition-colors duration-200 ease-out-quint hover:border-border-strong hover:text-text md:inline-flex"
            >
              <SearchIcon className="size-4" aria-hidden />
              Search
              <kbd className="font-sans text-xs">⌘K</kbd>
            </button>
            <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)} className={cn(iconButton, "md:hidden")}>
              <SearchIcon className="size-[18px]" aria-hidden />
            </button>
            <button type="button" aria-label="Toggle theme" onClick={toggleTheme} className={iconButton}>
              <Sun className="size-[18px] dark:hidden" aria-hidden />
              <Moon className="hidden size-[18px] dark:block" aria-hidden />
            </button>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(iconButton, "md:hidden")}
            >
              {menuOpen ? <X className="size-[18px]" aria-hidden /> : <Menu className="size-[18px]" aria-hidden />}
            </button>
          </div>
        </div>
      </header>
      {menuOpen && (
        <nav aria-label="Mobile" className="fade-in fixed inset-x-0 top-16 bottom-0 z-30 bg-bg px-5 pt-8 md:hidden">
          <ul className="flex flex-col gap-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={cn("block py-2 text-[2rem] leading-tight font-medium", isActive(l.href) ? "text-text" : "text-muted")}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <Search items={items} open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
