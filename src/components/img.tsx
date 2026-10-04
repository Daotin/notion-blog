import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  fill?: boolean;
  preload?: boolean;
};

export function Img({ src, alt, sizes, className, fill, preload }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      sizes={sizes}
      preload={preload}
      unoptimized={!src.startsWith("https://images.unsplash.com/")}
      {...(fill ? { fill: true } : { width: 1600, height: 1067 })}
      className={cn(fill ? "object-cover" : "h-auto w-full", className)}
    />
  );
}
