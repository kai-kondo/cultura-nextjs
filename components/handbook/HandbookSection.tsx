

import { ReactNode } from "react";

interface HandbookSectionProps {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function HandbookSection({
  id,
  title,
  description,
  children,
}: HandbookSectionProps) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4 rounded-3xl border border-orange-100 bg-orange-50/30 p-6 sm:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-6 text-gray-600 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      <div className="space-y-4 text-sm leading-7 text-gray-700 sm:text-base">
        {children}
      </div>
    </section>
  );
}