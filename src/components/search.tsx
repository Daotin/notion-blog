"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { EntryType } from "@/lib/notion";

export type SearchItem = {
  title: string;
  type: EntryType;
  url: string;
  tags: string[];
  summary: string;
};

const groups: [EntryType, string][] = [
  ["Writing", "Writing"],
  ["Project", "Projects"],
  ["Photography", "Photography"],
  ["Life", "Life"],
];

export function Search({
  items,
  open,
  onOpenChange,
}: {
  items: SearchItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle className="sr-only">Search</DialogTitle>
        <Command>
          <CommandInput placeholder="Search writing, projects, photos..." />
          <CommandList>
            <CommandEmpty>没有找到相关内容。</CommandEmpty>
            {groups.map(([type, heading]) => {
              const list = items.filter((i) => i.type === type);
              if (!list.length) return null;
              return (
                <CommandGroup key={type} heading={heading}>
                  {list.map((item) => (
                    <CommandItem
                      key={item.url}
                      value={`${item.title} ${item.url}`}
                      keywords={[...item.tags, item.summary]}
                      onSelect={() => {
                        onOpenChange(false);
                        router.push(item.url);
                      }}
                    >
                      <span className="font-medium text-text">{item.title}</span>
                      {item.summary && <span className="truncate text-[0.8125rem] text-muted">{item.summary}</span>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
