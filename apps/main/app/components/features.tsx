import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aah/ui/card";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Target,
  Clock,
  BarChart3,
  ShieldCheck,
  FileText,
} from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Academic Tracking",
    description:
      "Monitor GPA, credit hours, and degree progress in real-time with intelligent alerts for at-risk athletes.",
  },
  {
    icon: Target,
    title: "Eligibility Engine",
    description:
      "Automatically assess NCAA eligibility based on real-time academic data and compliance rules.",
  },
  {
    icon: Clock,
    title: "Transfer Credits",
    description:
      "Streamline credit transfers with automated equivalency analysis and document processing.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Comprehensive insights into athlete performance, compliance status, and retention metrics.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Guardrails",
    description:
      "Stay ahead of NCAA requirements with proactive notifications and audit-ready reporting.",
  },
  {
    icon: FileText,
    title: "Document Management",
    description:
      "Secure transcript storage, official document generation, and digital signatures integration.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function Features() {
  return (
    <section className="py-20 dark:bg-gray-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Everything You Need to Succeed
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Comprehensive tools designed specifically for student-athlete
            academic support programs.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                      <Icon className="size-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent />
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
