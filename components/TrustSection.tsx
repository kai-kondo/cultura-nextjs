"use client";

import { Globe, Heart, Users } from "lucide-react";
import { motion } from "motion/react";

export function TrustSection() {
  return (
    <section className="mt-12 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
            Connect and share with confidence
          </h2>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Cultura helps you find meaningful connections around the world
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Block 1 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Cultural exchange
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              It’s more than just work. Connect with people from different
              backgrounds and experience life in a new culture.
            </p>
          </motion.div>

          {/* Block 2 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-500">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Meaningful connections
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Find people who match your lifestyle and values, whether you’re
              a family, babysitter, or au pair.
            </p>
          </motion.div>

          {/* Block 3 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-500">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              A growing community
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Join a global network of people building trusted relationships
              through shared experiences.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
