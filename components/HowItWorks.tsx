"use client";

import { UserPlus, Search, MessageCircle } from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    icon: UserPlus,
    color: "orange",
    title: "Create your profile",
    description:
      "Share your story, languages, and what you're looking for so the right people can find you.",
  },
  {
    icon: Search,
    color: "rose",
    title: "Search & discover",
    description:
      "Browse au pairs, host families, and babysitters, then filter by nationality, skills, and availability.",
  },
  {
    icon: MessageCircle,
    color: "teal",
    title: "Connect & message",
    description:
      "Reach out directly, get to know each other, and take the next step when you're ready.",
  },
];

const colorClasses: Record<string, string> = {
  orange: "bg-orange-100 text-orange-500",
  rose: "bg-rose-100 text-rose-500",
  teal: "bg-teal-100 text-teal-500",
};

export function HowItWorks() {
  return (
    <section className="mt-12 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
            How Cultura works
          </h2>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Three simple steps to find your next match
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${colorClasses[step.color]}`}
              >
                <step.icon className="h-6 w-6" />
              </div>
              <span className="absolute right-6 top-6 text-3xl font-bold text-gray-100">
                {index + 1}
              </span>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
