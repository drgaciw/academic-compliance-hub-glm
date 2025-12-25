import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { logger } from "../middleware";
import { prisma } from "@aah/database";

export const courseRecommendationInput = z.object({
  studentId: z.string().cuid(),
  currentGPA: z.number().min(0).max(4).optional(),
  completedCredits: z.number().min(0).optional(),
  major: z.string().optional(),
  interests: z.array(z.string()).optional(),
  semester: z.string(),
  year: z.number(),
});

export const getCourseRecommendations = protectedProcedure
  .input(courseRecommendationInput)
  .output(
    z.object({
      recommendedCourses: z.array(
        z.object({
          courseCode: z.string(),
          courseName: z.string(),
          credits: z.number(),
          department: z.string(),
          reasoning: z.string(),
          priority: z.enum(["high", "medium", "low"]),
        }),
      ),
      totalRecommendations: z.number(),
      generatedAt: z.date(),
    }),
  )
  .query(async ({ input, ctx }) => {
    logger.info("Generating course recommendations", {
      studentId: input.studentId,
      user: ctx.user.id,
      semester: input.semester,
      year: input.year,
    });

    try {
      const recommendedCourses = [
        {
          courseCode: `${input.major || "GEN"}101`,
          courseName: `${input.major || "General"} Fundamentals`,
          credits: 3,
          department: input.major || "General Studies",
          reasoning: "Foundational course based on major requirements",
          priority: "high" as const,
        },
        {
          courseCode: "ENG101",
          courseName: "English Composition",
          credits: 3,
          department: "English",
          reasoning: "Core curriculum requirement",
          priority: "high" as const,
        },
        {
          courseCode: "MATH101",
          courseName: "College Algebra",
          credits: 4,
          department: "Mathematics",
          reasoning: "Quantitative literacy requirement",
          priority: "medium" as const,
        },
      ];

      return {
        recommendedCourses,
        totalRecommendations: recommendedCourses.length,
        generatedAt: new Date(),
      };
    } catch (error) {
      logger.error("Failed to generate course recommendations", error);
      throw error;
    }
  });

export const advisorInput = z.object({
  advisorId: z.string().cuid().optional(),
  studentId: z.string().cuid().optional(),
});

export const advisorOutput = z.object({
  id: z.string().cuid(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  department: z.string(),
  office: z.string().optional(),
  specializations: z.array(z.string()),
  caseload: z.number(),
  availability: z.array(
    z.object({
      day: z.string(),
      startTime: z.string(),
      endTime: z.string(),
    }),
  ),
});

export const getAdvisor = protectedProcedure
  .input(advisorInput)
  .output(advisorOutput.nullable())
  .query(async ({ input, ctx }) => {
    logger.info("Fetching advisor information", {
      advisorId: input.advisorId,
      studentId: input.studentId,
      user: ctx.user.id,
    });

    try {
      if (!input.advisorId && !input.studentId) {
        logger.warn("No advisor or student ID provided");
        return null;
      }

      return {
        id: "adv_123",
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@university.edu",
        phone: "+1-555-0123",
        department: "Athletic Academic Support",
        office: "Athletics Building, Room 205",
        specializations: ["Basketball", "Track & Field", "Swimming"],
        caseload: 45,
        availability: [
          { day: "Monday", startTime: "09:00", endTime: "12:00" },
          { day: "Wednesday", startTime: "14:00", endTime: "17:00" },
          { day: "Friday", startTime: "10:00", endTime: "16:00" },
        ],
      };
    } catch (error) {
      logger.error("Failed to fetch advisor", error);
      throw error;
    }
  });

export const scheduleAppointmentInput = z.object({
  advisorId: z.string().cuid(),
  studentId: z.string().cuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  type: z.enum([
    "ACADEMIC_PLANNING",
    "COURSE_SELECTION",
    "COMPLIANCE_REVIEW",
    "GENERAL",
  ]),
  notes: z.string().optional(),
});

export const scheduleAppointmentOutput = z.object({
  appointmentId: z.string().cuid(),
  advisorId: z.string().cuid(),
  studentId: z.string().cuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  type: z.enum([
    "ACADEMIC_PLANNING",
    "COURSE_SELECTION",
    "COMPLIANCE_REVIEW",
    "GENERAL",
  ]),
  status: z.enum(["SCHEDULED", "CANCELLED", "COMPLETED"]),
  notes: z.string().optional(),
  createdAt: z.date(),
});

export const scheduleAppointment = protectedProcedure
  .input(scheduleAppointmentInput)
  .output(scheduleAppointmentOutput)
  .mutation(async ({ input, ctx }) => {
    logger.info("Scheduling appointment", {
      advisorId: input.advisorId,
      studentId: input.studentId,
      type: input.type,
      user: ctx.user.id,
    });

    try {
      const startDate = new Date(input.startTime);
      const endDate = new Date(input.endTime);

      const conflictCheck = await prisma.tutoringSession.findFirst({
        where: {
          AND: [
            { studentId: input.studentId },
            {
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
            {
              status: {
                notIn: ["CANCELLED" as const],
              },
            },
          ],
        },
      });

      if (conflictCheck) {
        throw new Error(
          "Student already has an appointment scheduled during this time",
        );
      }

      const appointment = await prisma.tutoringSession.create({
        data: {
          studentId: input.studentId,
          subject: input.type,
          date: startDate,
          duration: Math.round(
            (endDate.getTime() - startDate.getTime()) / 60000,
          ),
          notes: input.notes,
          status: "SCHEDULED",
        },
      });

      return {
        appointmentId: appointment.id,
        advisorId: input.advisorId,
        studentId: input.studentId,
        startTime: input.startTime,
        endTime: input.endTime,
        type: input.type,
        status: "SCHEDULED",
        notes: input.notes,
        createdAt: appointment.createdAt,
      };
    } catch (error) {
      logger.error("Failed to schedule appointment", error);
      throw error;
    }
  });

export const getAppointmentSlotsInput = z.object({
  advisorId: z.string().cuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const getAppointmentSlotsOutput = z.object({
  advisorId: z.string().cuid(),
  slots: z.array(
    z.object({
      startTime: z.string().datetime(),
      endTime: z.string().datetime(),
      isAvailable: z.boolean(),
      status: z.enum(["AVAILABLE", "BOOKED", "BLOCKED"]),
    }),
  ),
});

export const getAppointmentSlots = protectedProcedure
  .input(getAppointmentSlotsInput)
  .output(getAppointmentSlotsOutput)
  .query(async ({ input, ctx }) => {
    logger.info("Fetching appointment slots", {
      advisorId: input.advisorId,
      startDate: input.startDate,
      endDate: input.endDate,
      user: ctx.user.id,
    });

    try {
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);

      const appointments = await prisma.tutoringSession.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            in: ["SCHEDULED" as const, "COMPLETED" as const],
          },
        },
      });

      const bookedSlots = new Set(
        appointments.map((apt) => apt.date.getTime()),
      );

      const slots = [];
      const slotDuration = 30 * 60 * 1000;

      for (
        let current = startDate.getTime();
        current < endDate.getTime();
        current += slotDuration
      ) {
        const slotStart = new Date(current);
        const slotEnd = new Date(current + slotDuration);

        const dayOfWeek = slotStart.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          slots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            isAvailable: false,
            status: "BLOCKED" as const,
          });
        } else {
          const isBooked = bookedSlots.has(current);
          slots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            isAvailable: !isBooked,
            status: (isBooked ? "BOOKED" : "AVAILABLE") as
              | "BOOKED"
              | "AVAILABLE",
          });
        }
      }

      return {
        advisorId: input.advisorId,
        slots,
      };
    } catch (error) {
      logger.error("Failed to fetch appointment slots", error);
      throw error;
    }
  });

export const advisingRouter = router({
  getCourseRecommendations,
  getAdvisor,
  scheduleAppointment,
  getAppointmentSlots,
});
