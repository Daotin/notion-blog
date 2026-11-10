export { cn } from "cn";

const fmt = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options });

const monthFormat = fmt({ month: "short", year: "numeric" });

export const formatDate = (d: string | null) => (d ? d.slice(0, 10) : "");
export const formatMonth = (d: string | null) => (d ? monthFormat.format(new Date(d)) : "");
export const yearOf = (d: string | null) => (d ? d.slice(0, 4) : "");
