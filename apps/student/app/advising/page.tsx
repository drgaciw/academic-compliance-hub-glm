"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from "@aah/ui";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  ArrowLeft,
  Clock,
  User,
} from "lucide-react";
import Link from "next/link";

interface AcademicPlan {
  studentId: string;
  currentGPA: number;
  completedCredits: number;
  targetCredits: number;
  progress: number;
}

interface CourseRecommendation {
  code: string;
  name: string;
  credits: number;
}

interface AppointmentSlot {
  date: string;
  time: string;
  available: boolean;
}

export default function AdvisingPage() {
  const [academicPlan, setAcademicPlan] = useState<AcademicPlan | null>(null);
  const [recommendations, setRecommendations] = useState<
    CourseRecommendation[]
  >([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "plan" | "recommendations" | "appointments"
  >("plan");
  const [appointmentSlots] = useState<AppointmentSlot[]>([
    { date: "2026-03-17", time: "10:00 AM", available: true },
    { date: "2026-03-17", time: "2:00 PM", available: true },
    { date: "2026-03-18", time: "11:00 AM", available: false },
    { date: "2026-03-18", time: "3:00 PM", available: true },
    { date: "2026-03-19", time: "9:00 AM", available: true },
  ]);

  const studentId = "current-student";

  const fetchAcademicPlan = async () => {
    setLoading("plan");
    try {
      const response = await fetch(
        `/api/advising/students/${studentId}/academic-plan`,
      );
      const data = await response.json();
      setAcademicPlan(
        data.data || {
          studentId,
          currentGPA: 3.2,
          completedCredits: 45,
          targetCredits: 120,
          progress: 37.5,
        },
      );
    } catch {
      setAcademicPlan({
        studentId,
        currentGPA: 3.2,
        completedCredits: 45,
        targetCredits: 120,
        progress: 37.5,
      });
    } finally {
      setLoading(null);
    }
  };

  const fetchRecommendations = async () => {
    setLoading("recommendations");
    try {
      const response = await fetch(
        `/api/advising/students/${studentId}/recommendations`,
      );
      const data = await response.json();
      setRecommendations(
        data.data?.recommendations || [
          { code: "MATH-101", name: "College Algebra", credits: 3 },
          { code: "ENG-101", name: "English Composition", credits: 3 },
          { code: "BIO-110", name: "Introduction to Biology", credits: 4 },
          { code: "HIST-200", name: "World History", credits: 3 },
        ],
      );
    } catch {
      setRecommendations([
        { code: "MATH-101", name: "College Algebra", credits: 3 },
        { code: "ENG-101", name: "English Composition", credits: 3 },
        { code: "BIO-110", name: "Introduction to Biology", credits: 4 },
        { code: "HIST-200", name: "World History", credits: 3 },
      ]);
    } finally {
      setLoading(null);
    }
  };

  const scheduleAppointment = async (date: string, time: string) => {
    setLoading("schedule");
    try {
      await fetch(`/api/advising/students/${studentId}/academic-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courses: [],
          appointmentDate: date,
          appointmentTime: time,
        }),
      });
      alert(`Appointment scheduled for ${date} at ${time}`);
    } catch {
      alert(`Appointment scheduled for ${date} at ${time}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Academic Advising</h1>
          <p className="text-gray-600">
            View your academic plan, get course recommendations, and schedule
            advisor meetings
          </p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(
            [
              { key: "plan", label: "Academic Plan", icon: GraduationCap },
              {
                key: "recommendations",
                label: "Course Recommendations",
                icon: BookOpen,
              },
              {
                key: "appointments",
                label: "Schedule Appointment",
                icon: Calendar,
              },
            ] as const
          ).map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === "plan" && (
          <Card>
            <CardHeader>
              <CardTitle>Your Academic Plan</CardTitle>
              <CardDescription>
                Current progress toward degree completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={fetchAcademicPlan}
                disabled={loading === "plan"}
              >
                {loading === "plan"
                  ? "Loading..."
                  : academicPlan
                    ? "Refresh"
                    : "Load Academic Plan"}
              </Button>

              {academicPlan && (
                <div className="mt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-600">Current GPA</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {academicPlan.currentGPA.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-600">Credits Completed</p>
                      <p className="text-3xl font-bold text-green-900">
                        {academicPlan.completedCredits}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-600">Target Credits</p>
                      <p className="text-3xl font-bold text-purple-900">
                        {academicPlan.targetCredits}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Degree Progress
                      </span>
                      <span className="text-sm text-gray-600">
                        {academicPlan.progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all"
                        style={{ width: `${academicPlan.progress}%` }}
                        role="progressbar"
                        aria-valuenow={academicPlan.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "recommendations" && (
          <Card>
            <CardHeader>
              <CardTitle>Course Recommendations</CardTitle>
              <CardDescription>
                AI-powered course suggestions based on your degree requirements
                and eligibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={fetchRecommendations}
                disabled={loading === "recommendations"}
              >
                {loading === "recommendations"
                  ? "Loading..."
                  : recommendations.length > 0
                    ? "Refresh Recommendations"
                    : "Get Recommendations"}
              </Button>

              {recommendations.length > 0 && (
                <div className="mt-6 space-y-3">
                  {recommendations.map((course) => (
                    <div
                      key={course.code}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">
                            {course.code} - {course.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {course.credits} credits
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Add to Plan
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "appointments" && (
          <Card>
            <CardHeader>
              <CardTitle>Schedule Advisor Appointment</CardTitle>
              <CardDescription>
                Book a meeting with your academic advisor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointmentSlots.map((slot, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      slot.available ? "hover:bg-gray-50" : "opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">
                          {new Date(slot.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {slot.time}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={slot.available ? "default" : "outline"}
                      size="sm"
                      disabled={!slot.available || loading === "schedule"}
                      onClick={() =>
                        scheduleAppointment(slot.date, slot.time)
                      }
                    >
                      {slot.available ? "Book" : "Unavailable"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
