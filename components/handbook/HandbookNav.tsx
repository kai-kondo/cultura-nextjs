

"use client";

import Link from "next/link";

interface HandbookNavItem {
  title: string;
  href: string;
}

interface HandbookNavProps {
  items: HandbookNavItem[];
  currentPath?: string;
}

export function HandbookNav({ items, currentPath }: HandbookNavProps) {
  return (
    <nav className="space-y-2">
      {items.map((item) => {
        const isActive = currentPath === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-lg px-4 py-2 text-sm transition-colors ${
              isActive
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
            }`}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}