"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@aah/ui";
import { Button } from "@aah/ui";
import { Label } from "@aah/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aah/ui";
import { Bell, Mail, CheckCircle2 } from "lucide-react";

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  digestFrequency: "immediate" | "daily" | "weekly";
  notificationTypes: {
    eligibility: boolean;
    compliance: boolean;
    documents: boolean;
    reports: boolean;
    deadlines: boolean;
  };
}

export function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    digestFrequency: "immediate",
    notificationTypes: {
      eligibility: true,
      compliance: true,
      documents: true,
      reports: true,
      deadlines: true,
    },
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K],
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const updateNotificationType = (
    type: keyof NotificationPreferences["notificationTypes"],
    value: boolean,
  ) => {
    setPreferences((prev) => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [type]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notification Preferences</h1>
          <p className="text-muted-foreground mt-1">
            Manage how you receive notifications
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Saved</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <input
                id="email-notifications"
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) =>
                  updatePreference("emailNotifications", e.target.checked)
                }
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Receive push notifications in your browser
                </p>
              </div>
              <input
                id="push-notifications"
                type="checkbox"
                checked={preferences.pushNotifications}
                onChange={(e) =>
                  updatePreference("pushNotifications", e.target.checked)
                }
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="inapp-notifications">
                  In-App Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Show notifications within app
                </p>
              </div>
              <input
                id="inapp-notifications"
                type="checkbox"
                checked={preferences.inAppNotifications}
                onChange={(e) =>
                  updatePreference("inAppNotifications", e.target.checked)
                }
                className="h-4 w-4"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="digest-frequency">Email Digest Frequency</Label>
            <Select
              value={preferences.digestFrequency}
              onValueChange={(value: any) =>
                updatePreference("digestFrequency", value)
              }
            >
              <SelectTrigger id="digest-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notification Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="eligibility-notifications">
                Eligibility Updates
              </Label>
              <p className="text-xs text-muted-foreground">
                Changes to your eligibility status
              </p>
            </div>
            <input
              id="eligibility-notifications"
              type="checkbox"
              checked={preferences.notificationTypes.eligibility}
              onChange={(e) =>
                updateNotificationType("eligibility", e.target.checked)
              }
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compliance-notifications">
                Compliance Alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                Important compliance reminders and updates
              </p>
            </div>
            <input
              id="compliance-notifications"
              type="checkbox"
              checked={preferences.notificationTypes.compliance}
              onChange={(e) =>
                updateNotificationType("compliance", e.target.checked)
              }
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="documents-notifications">Document Updates</Label>
              <p className="text-xs text-muted-foreground">
                Status updates on uploaded documents
              </p>
            </div>
            <input
              id="documents-notifications"
              type="checkbox"
              checked={preferences.notificationTypes.documents}
              onChange={(e) =>
                updateNotificationType("documents", e.target.checked)
              }
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reports-notifications">
                Report Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                When reports are ready for download
              </p>
            </div>
            <input
              id="reports-notifications"
              type="checkbox"
              checked={preferences.notificationTypes.reports}
              onChange={(e) =>
                updateNotificationType("reports", e.target.checked)
              }
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="deadlines-notifications">
                Deadline Reminders
              </Label>
              <p className="text-xs text-muted-foreground">
                Reminders for upcoming deadlines
              </p>
            </div>
            <input
              id="deadlines-notifications"
              type="checkbox"
              checked={preferences.notificationTypes.deadlines}
              onChange={(e) =>
                updateNotificationType("deadlines", e.target.checked)
              }
              className="h-4 w-4"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
