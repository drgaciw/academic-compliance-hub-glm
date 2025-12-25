import * as React from "react";
import { Card, CardContent } from "@aah/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@aah/ui/carousel";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "Director of Academic Services",
    university: "State University",
    content:
      "The platform has transformed how we track student-athlete progress. Compliance has never been easier to manage.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Athletic Academic Advisor",
    university: "Metro College",
    content:
      "Our advisors can now focus on student support instead of paperwork. The automation is incredible.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Compliance Officer",
    university: "Tech Institute",
    content:
      "Audit-ready reporting at click of a button. This tool is essential for any NCAA program.",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Head Academic Coach",
    university: "Liberty University",
    content:
      "The real-time eligibility tracking has prevented numerous eligibility issues. Highly recommended!",
    rating: 5,
  },
];

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof testimonials)[0];
}) {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col justify-center p-8">
        <div className="mb-4 flex gap-1">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="size-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <div className="relative mb-6">
          <Quote className="absolute -top-2 -left-2 size-8 text-gray-200 dark:text-gray-700" />
          <p className="relative pl-6 italic text-gray-700 dark:text-gray-300">
            {testimonial.content}
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {testimonial.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {testimonial.role}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {testimonial.university}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function Testimonials() {
  return (
    <section className="bg-gray-50 py-20 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Trusted by Leading Institutions
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            See how universities are transforming their student-athlete academic
            support programs.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Carousel
            className="mx-auto max-w-5xl"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {testimonials.map((testimonial) => (
                <CarouselItem
                  key={testimonial.name}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <TestimonialCard testimonial={testimonial} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
