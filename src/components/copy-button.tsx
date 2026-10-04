"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy code"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex size-7 items-center justify-center rounded-md transition-colors duration-200 ease-out-quint hover:bg-surface-muted hover:text-text"
    >
      {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
    </button>
  );
}
