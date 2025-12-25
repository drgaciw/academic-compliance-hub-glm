import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@aah/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "How does platform ensure NCAA compliance?",
    answer:
      "Our platform uses real-time rule evaluation against current NCAA bylaws. We maintain an up-to-date database of compliance requirements and automatically assess eligibility based on academic data, credit hours, and progress toward degree requirements.",
  },
  {
    question: "Can students access their own academic information?",
    answer:
      "Yes, students have a dedicated portal where they can view their academic progress, eligibility status, transfer credit evaluations, and compliance requirements. They also receive proactive alerts when action is needed.",
  },
  {
    question: "How are transfer credits evaluated?",
    answer:
      "Our system automates transfer credit evaluation using official equivalency tables and course matching algorithms. Document processing includes OCR for transcripts and automated credit analysis with advisor review capabilities.",
  },
  {
    question: "What kind of reporting is available?",
    answer:
      "Generate compliance reports, eligibility summaries, academic progress reports, and audit-ready documentation. Reports can be exported as PDF, CSV, or Excel and can be scheduled for automatic delivery.",
  },
  {
    question: "Is platform secure and FERPA compliant?",
    answer:
      "Absolutely. We implement industry-standard encryption, role-based access controls, comprehensive audit logging, and maintain full FERPA compliance for all student academic records.",
  },
  {
    question: "How long does implementation take?",
    answer:
      "Typical implementation takes 4-6 weeks, including data migration, system integration, staff training, and go-live support. Our team provides dedicated implementation specialists to ensure a smooth transition.",
  },
  {
    question: "What integrations are available?",
    answer:
      "We integrate with major student information systems (SIS), learning management systems (LMS), document management platforms, and NCAA reporting systems. Custom integrations are also available.",
  },
  {
    question: "What support options are provided?",
    answer:
      "We offer 24/7 technical support, dedicated customer success managers, comprehensive training programs, online documentation, and a community forum for peer-to-peer assistance.",
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

export function FAQ() {
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
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Find answers to common questions about our platform and services.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto max-w-3xl"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem
                  value={`item-${index}`}
                  className="rounded-lg border bg-white px-6 dark:bg-gray-800"
                >
                  <AccordionTrigger className="text-left text-lg font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 dark:text-gray-300">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
