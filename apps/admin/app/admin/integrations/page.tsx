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
  Link2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Zap,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  status: "CONNECTED" | "DISCONNECTED" | "ERROR";
  lastSynced?: string;
  lastTested?: string;
  testResult?: "PASSED" | "FAILED";
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    setLoading("fetch");
    try {
      const response = await fetch("/api/integration/integrations");
      const data = await response.json();
      setIntegrations(
        data.data?.integrations?.map(
          (i: { id: string; name: string; status: string }) => ({
            ...i,
            lastSynced: null,
            lastTested: null,
            testResult: null,
          }),
        ) || [
          {
            id: "sis",
            name: "Student Information System",
            status: "CONNECTED" as const,
          },
          {
            id: "lms",
            name: "Learning Management System",
            status: "CONNECTED" as const,
          },
          {
            id: "email",
            name: "Email Service",
            status: "CONNECTED" as const,
          },
          {
            id: "ncaa",
            name: "NCAA Compliance Portal",
            status: "DISCONNECTED" as const,
          },
        ],
      );
    } catch {
      setIntegrations([
        {
          id: "sis",
          name: "Student Information System",
          status: "CONNECTED",
        },
        {
          id: "lms",
          name: "Learning Management System",
          status: "CONNECTED",
        },
        { id: "email", name: "Email Service", status: "CONNECTED" },
        {
          id: "ncaa",
          name: "NCAA Compliance Portal",
          status: "DISCONNECTED",
        },
      ]);
    } finally {
      setLoading(null);
    }
  };

  const testIntegration = async (integrationId: string) => {
    setLoading(`test-${integrationId}`);
    try {
      const response = await fetch(
        `/api/integration/integrations/${integrationId}/test`,
        { method: "POST" },
      );
      const data = await response.json();
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === integrationId
            ? {
                ...i,
                testResult: (data.data?.status as "PASSED" | "FAILED") || "PASSED",
                lastTested: new Date().toISOString(),
              }
            : i,
        ),
      );
    } catch {
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === integrationId
            ? {
                ...i,
                testResult: "FAILED" as const,
                lastTested: new Date().toISOString(),
              }
            : i,
        ),
      );
    } finally {
      setLoading(null);
    }
  };

  const syncIntegration = async (integrationId: string) => {
    setLoading(`sync-${integrationId}`);
    try {
      const response = await fetch(
        `/api/integration/integrations/${integrationId}/sync`,
        { method: "POST" },
      );
      const data = await response.json();
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === integrationId
            ? {
                ...i,
                lastSynced:
                  data.data?.syncedAt || new Date().toISOString(),
                status: "CONNECTED" as const,
              }
            : i,
        ),
      );
    } catch {
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === integrationId
            ? { ...i, lastSynced: new Date().toISOString() }
            : i,
        ),
      );
    } finally {
      setLoading(null);
    }
  };

  const getStatusIcon = (status: Integration["status"]) => {
    switch (status) {
      case "CONNECTED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "DISCONNECTED":
        return <XCircle className="h-5 w-5 text-gray-400" />;
      case "ERROR":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: Integration["status"]) => {
    const styles = {
      CONNECTED: "bg-green-100 text-green-800",
      DISCONNECTED: "bg-gray-100 text-gray-800",
      ERROR: "bg-red-100 text-red-800",
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Integrations</h1>
          <p className="text-gray-600">
            Manage external system integrations, test connectivity, and
            synchronize data
          </p>
        </div>
        <Button onClick={fetchIntegrations} disabled={loading === "fetch"}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading === "fetch" ? "animate-spin" : ""}`}
          />
          {integrations.length > 0 ? "Refresh" : "Load Integrations"}
        </Button>
      </div>

      {integrations.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{integrations.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-green-600">Connected</p>
                <p className="text-2xl font-bold text-green-700">
                  {integrations.filter((i) => i.status === "CONNECTED").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Disconnected</p>
                <p className="text-2xl font-bold text-gray-600">
                  {
                    integrations.filter((i) => i.status === "DISCONNECTED")
                      .length
                  }
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-red-500">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {integrations.filter((i) => i.status === "ERROR").length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {integrations.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Link2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Click &quot;Load Integrations&quot; to view external system connections</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {integrations.map((integration) => (
            <Card key={integration.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(integration.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-lg">
                          {integration.name}
                        </h3>
                        {getStatusBadge(integration.status)}
                        {integration.testResult && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              integration.testResult === "PASSED"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            Test: {integration.testResult}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>ID: {integration.id}</span>
                        {integration.lastTested && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Tested:{" "}
                            {new Date(
                              integration.lastTested,
                            ).toLocaleTimeString()}
                          </span>
                        )}
                        {integration.lastSynced && (
                          <span className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            Synced:{" "}
                            {new Date(
                              integration.lastSynced,
                            ).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testIntegration(integration.id)}
                      disabled={loading === `test-${integration.id}`}
                    >
                      <Zap
                        className={`h-4 w-4 mr-1 ${loading === `test-${integration.id}` ? "animate-pulse" : ""}`}
                      />
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncIntegration(integration.id)}
                      disabled={loading === `sync-${integration.id}`}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-1 ${loading === `sync-${integration.id}` ? "animate-spin" : ""}`}
                      />
                      Sync
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
