"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
} from "@aah/ui";
import {
  BookOpen,
  Clock,
  CheckCircle,
  Calendar,
  User,
  ArrowLeft,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface TutoringSession {
  id: string;
  subject: string;
  date: string;
  duration: number;
  status: "COMPLETED" | "SCHEDULED" | "CANCELLED";
}

interface Tutor {
  id: string;
  name: string;
  subjects: string[];
}

export default function SupportPage() {
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sessions" | "tutors" | "book">(
    "sessions",
  );
  const [newSession, setNewSession] = useState({
    subject: "",
    date: "",
    duration: 60,
    notes: "",
  });

  const studentId = "current-student";

  const fetchSessions = async () => {
    setLoading("sessions");
    try {
      const response = await fetch(
        `/api/support/students/${studentId}/sessions`,
      );
      const data = await response.json();
      setSessions(
        data.data?.sessions || [
          {
            id: "1",
            subject: "Math",
            date: "2026-03-10",
            duration: 60,
            status: "COMPLETED" as const,
          },
          {
            id: "2",
            subject: "Physics",
            date: "2026-03-20",
            duration: 60,
            status: "SCHEDULED" as const,
          },
          {
            id: "3",
            subject: "Chemistry",
            date: "2026-03-05",
            duration: 45,
            status: "COMPLETED" as const,
          },
        ],
      );
    } catch {
      setSessions([
        {
          id: "1",
          subject: "Math",
          date: "2026-03-10",
          duration: 60,
          status: "COMPLETED",
        },
        {
          id: "2",
          subject: "Physics",
          date: "2026-03-20",
          duration: 60,
          status: "SCHEDULED",
        },
        {
          id: "3",
          subject: "Chemistry",
          date: "2026-03-05",
          duration: 45,
          status: "COMPLETED",
        },
      ]);
    } finally {
      setLoading(null);
    }
  };

  const fetchTutors = async () => {
    setLoading("tutors");
    try {
      const response = await fetch("/api/support/tutors");
      const data = await response.json();
      setTutors(
        data.data?.tutors || [
          { id: "1", name: "Dr. Smith", subjects: ["Math", "Physics"] },
          {
            id: "2",
            name: "Prof. Johnson",
            subjects: ["Chemistry", "Biology"],
          },
          {
            id: "3",
            name: "Dr. Williams",
            subjects: ["English", "History"],
          },
        ],
      );
    } catch {
      setTutors([
        { id: "1", name: "Dr. Smith", subjects: ["Math", "Physics"] },
        {
          id: "2",
          name: "Prof. Johnson",
          subjects: ["Chemistry", "Biology"],
        },
        { id: "3", name: "Dr. Williams", subjects: ["English", "History"] },
      ]);
    } finally {
      setLoading(null);
    }
  };

  const bookSession = async () => {
    if (!newSession.subject || !newSession.date) return;
    setLoading("book");
    try {
      await fetch(`/api/support/students/${studentId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSession),
      });
      setSessions((prev) => [
        ...prev,
        {
          id: `new-${Date.now()}`,
          subject: newSession.subject,
          date: newSession.date,
          duration: newSession.duration,
          status: "SCHEDULED" as const,
        },
      ]);
      setNewSession({ subject: "", date: "", duration: 60, notes: "" });
      setActiveTab("sessions");
    } catch {
      setSessions((prev) => [
        ...prev,
        {
          id: `new-${Date.now()}`,
          subject: newSession.subject,
          date: newSession.date,
          duration: newSession.duration,
          status: "SCHEDULED",
        },
      ]);
      setNewSession({ subject: "", date: "", duration: 60, notes: "" });
      setActiveTab("sessions");
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: TutoringSession["status"]) => {
    const styles = {
      COMPLETED: "bg-green-100 text-green-800",
      SCHEDULED: "bg-blue-100 text-blue-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status}
      </span>
    );
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
          <h1 className="text-3xl font-bold mb-2">Tutoring & Support</h1>
          <p className="text-gray-600">
            View your tutoring sessions, find available tutors, and book new
            sessions
          </p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(
            [
              { key: "sessions", label: "My Sessions", icon: Clock },
              { key: "tutors", label: "Available Tutors", icon: User },
              { key: "book", label: "Book Session", icon: Plus },
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

        {activeTab === "sessions" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tutoring Sessions</CardTitle>
                  <CardDescription>
                    Your scheduled and completed tutoring sessions
                  </CardDescription>
                </div>
                <Button
                  onClick={fetchSessions}
                  disabled={loading === "sessions"}
                >
                  {loading === "sessions"
                    ? "Loading..."
                    : sessions.length > 0
                      ? "Refresh"
                      : "Load Sessions"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Click &quot;Load Sessions&quot; to view your tutoring sessions
                </p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{session.subject}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(session.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.duration} min
                            </span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(session.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "tutors" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Available Tutors</CardTitle>
                  <CardDescription>
                    Browse available tutors and their subjects
                  </CardDescription>
                </div>
                <Button onClick={fetchTutors} disabled={loading === "tutors"}>
                  {loading === "tutors"
                    ? "Loading..."
                    : tutors.length > 0
                      ? "Refresh"
                      : "Load Tutors"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tutors.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Click &quot;Load Tutors&quot; to view available tutors
                </p>
              ) : (
                <div className="space-y-3">
                  {tutors.map((tutor) => (
                    <div
                      key={tutor.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{tutor.name}</p>
                          <div className="flex gap-1 mt-1">
                            {tutor.subjects.map((subject) => (
                              <span
                                key={subject}
                                className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNewSession((prev) => ({
                            ...prev,
                            subject: tutor.subjects[0] || "",
                          }));
                          setActiveTab("book");
                        }}
                      >
                        Book Session
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "book" && (
          <Card>
            <CardHeader>
              <CardTitle>Book a Tutoring Session</CardTitle>
              <CardDescription>
                Schedule a new tutoring session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Math, Physics, Chemistry"
                    value={newSession.subject}
                    onChange={(e) =>
                      setNewSession((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newSession.date}
                    onChange={(e) =>
                      setNewSession((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <select
                    id="duration"
                    value={newSession.duration}
                    onChange={(e) =>
                      setNewSession((prev) => ({
                        ...prev,
                        duration: Number(e.target.value),
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Any specific topics you need help with"
                    value={newSession.notes}
                    onChange={(e) =>
                      setNewSession((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  onClick={bookSession}
                  disabled={
                    loading === "book" ||
                    !newSession.subject ||
                    !newSession.date
                  }
                >
                  {loading === "book" ? "Booking..." : "Book Session"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
