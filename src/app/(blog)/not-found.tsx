import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center px-5 py-32 text-center">
      <p className="text-muted">这个页面不存在，或者还没有公开。</p>
      <Link href="/" className="mt-6 text-text underline decoration-accent underline-offset-[3px]">
        Back home
      </Link>
    </div>
  );
}
