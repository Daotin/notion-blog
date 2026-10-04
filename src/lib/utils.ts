export { cn } from "cn";

const fmt = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options });

const dayFormat = fmt({ month: "short", day: "numeric", year: "numeric" });
const monthFormat = fmt({ month: "short", year: "numeric" });

export const formatDate = (d: string | null) => (d ? dayFormat.format(new Date(d)) : "");
export const formatMonth = (d: string | null) => (d ? monthFormat.format(new Date(d)) : "");
export const yearOf = (d: string | null) => (d ? d.slice(0, 4) : "");
