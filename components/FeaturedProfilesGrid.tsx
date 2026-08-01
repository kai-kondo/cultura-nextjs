"use client";

import { ReactNode } from "react";

export function FeaturedProfilesGrid({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {children}
      </div>
    </section>
  );
}
