import { BlogShell } from "@/components/blog-shell";

export default function BlogLayout({ children }: LayoutProps<"/">) {
  return <BlogShell>{children}</BlogShell>;
}
