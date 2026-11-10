import { cn } from "@/lib/utils";

const gradients = [
  "linear-gradient(135deg, #f6d365, #fda085)",
  "linear-gradient(135deg, #a1c4fd, #c2e9fb)",
  "linear-gradient(135deg, #84fab0, #8fd3f4)",
  "linear-gradient(135deg, #fbc2eb, #a6c1ee)",
  "linear-gradient(135deg, #ffecd2, #fcb69f)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
  "linear-gradient(135deg, #d4fc79, #96e6a1)",
  "linear-gradient(135deg, #89f7fe, #66a6ff)",
  "linear-gradient(135deg, #fddb92, #d1fdff)",
  "linear-gradient(135deg, #e0c3fc, #8ec5fc)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
];

function gradientOf(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.codePointAt(0)!) >>> 0;
  return gradients[h % gradients.length];
}

export function SeriesCover({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center p-6 text-center", className)}
      style={{ backgroundImage: gradientOf(name) }}
    >
      <span className="font-serif text-[1.75rem] leading-tight font-semibold text-[oklch(0.25_0.02_60)]">{name}</span>
    </div>
  );
}
