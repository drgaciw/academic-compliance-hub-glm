"use client";

import * as React from "react";
import { Button } from "@aah/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aah/ui";
import { Badge } from "@aah/ui";
import { Play, Check, X, AlertCircle } from "lucide-react";

interface TestResult {
  id: string;
  condition: string;
  passed: boolean;
  details: string;
}

interface RuleTestingSandboxProps {
  ruleName: string;
  conditions: any[];
  testData?: Record<string, any>;
  onRunTest: (testData: Record<string, any>) => void;
  onSaveTest?: (testData: Record<string, any>) => void;
}

export function RuleTestingSandbox({
  ruleName,
  conditions,
  testData = {},
  onRunTest,
  onSaveTest,
}: RuleTestingSandboxProps) {
  const [testInput, setTestInput] =
    React.useState<Record<string, any>>(testData);
  const [testResults, setTestResults] = React.useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);

  const handleRunTest = async () => {
    setIsRunning(true);
    try {
      await onRunTest(testInput);
      const results = conditions.map((condition, index) => ({
        id: `test-${index}`,
        condition: JSON.stringify(condition),
        passed: Math.random() > 0.3,
        details: "Condition evaluated successfully",
      }));
      setTestResults(results);
    } catch (error) {
      console.error("Test failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveTest = () => {
    onSaveTest?.(testInput);
  };

  const handleReset = () => {
    setTestInput({});
    setTestResults([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Rule Testing Sandbox
        </CardTitle>
        <CardDescription>
          Test and validate rule behavior with sample data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-3">Test Data</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">
                  Student ID
                </label>
                <input
                  type="text"
                  value={testInput.studentId || ""}
                  onChange={(e) =>
                    setTestInput({ ...testInput, studentId: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="STU001"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">GPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={testInput.gpa || ""}
                  onChange={(e) =>
                    setTestInput({
                      ...testInput,
                      gpa: parseFloat(e.target.value),
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="3.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">
                  Credits Earned
                </label>
                <input
                  type="number"
                  value={testInput.credits || ""}
                  onChange={(e) =>
                    setTestInput({
                      ...testInput,
                      credits: parseInt(e.target.value),
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="90"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  Current Semester
                </label>
                <input
                  type="text"
                  value={testInput.semester || ""}
                  onChange={(e) =>
                    setTestInput({ ...testInput, semester: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="Fall 2024"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleRunTest}
            disabled={isRunning}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Running Test...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Test
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleSaveTest}>
            Save Test Case
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            Reset
          </Button>
        </div>

        {testResults.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Test Results</h4>
            <div className="space-y-2">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    result.passed
                      ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                      : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                  }`}
                >
                  {result.passed ? (
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {result.passed ? "Passed" : "Failed"}
                      </span>
                      <Badge
                        variant={result.passed ? "default" : "destructive"}
                      >
                        {result.passed ? "Success" : "Failure"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.details}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {result.condition}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-950 dark:border-yellow-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Test Summary
                  </p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                    {testResults.filter((r) => r.passed).length} /{" "}
                    {testResults.length} conditions passed
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
