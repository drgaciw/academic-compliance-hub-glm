import * as React from "react";
import Link from "next/link";
import { Button } from "@aah/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Shield, Users } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 dark:bg-blue-900 dark:text-blue-100"
          >
            <Shield className="mr-2 size-4" />
            NCAA Compliance Made Simple
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl"
          >
            Empower Student-Athletes with{" "}
            <span className="text-blue-600 dark:text-blue-400">
              Smart Compliance
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8 text-lg text-gray-600 dark:text-gray-300 md:text-xl"
          >
            The all-in-one platform for managing academic eligibility, transfer
            credits, and compliance tracking. Built for universities, designed
            for success.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button size="lg" className="group">
              Get Started Free
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline">
              <BookOpen className="mr-2 size-4" />
              View Documentation
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400"
          >
            <div className="flex items-center gap-2">
              <Users className="size-4" />
              <span>500+ Universities</span>
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center gap-2">
              <Shield className="size-4" />
              <span>100% NCAA Compliant</span>
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center gap-2">
              <BookOpen className="size-4" />
              <span>24/7 Support</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-purple-400/20 blur-3xl" />
      </div>
    </section>
  );
}
