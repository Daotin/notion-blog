import type { Metadata } from "next";
import "lxgw-wenkai-webfont/lxgwwenkai-regular.css";
import "./diary.css";

export const metadata: Metadata = {
  title: { absolute: "日记" },
  robots: { index: false, follow: false },
};

export default function DiaryLayout({ children }: LayoutProps<"/diary">) {
  return children;
}
