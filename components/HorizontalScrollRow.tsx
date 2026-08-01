"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function HorizontalScrollRow({
  title,
  onSeeAll,
  children,
}: {
  title: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onSeeAll}
          className="flex items-center gap-1.5 text-lg font-semibold text-gray-900 hover:underline disabled:no-underline"
          disabled={!onSeeAll}
        >
          {title}
          {onSeeAll ? <ChevronRight className="h-4 w-4" /> : null}
        </button>

        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:scale-105 hover:shadow-md"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:scale-105 hover:shadow-md"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-none flex gap-4 overflow-x-auto scroll-smooth pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {children}
      </div>
    </section>
  );
}
