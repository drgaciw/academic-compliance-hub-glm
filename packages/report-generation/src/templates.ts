import Handlebars from "handlebars";

export function registerHelpers(): void {
  Handlebars.registerHelper("eq", (a: any, b: any) => a === b);
  Handlebars.registerHelper("ne", (a: any, b: any) => a !== b);
  Handlebars.registerHelper("gt", (a: any, b: any) => a > b);
  Handlebars.registerHelper("lt", (a: any, b: any) => a < b);
  Handlebars.registerHelper("gte", (a: any, b: any) => a >= b);
  Handlebars.registerHelper("lte", (a: any, b: any) => a <= b);

  Handlebars.registerHelper("formatDate", (date: string) => {
    return new Date(date).toLocaleDateString();
  });

  Handlebars.registerHelper(
    "formatNumber",
    (num: number, decimals: number = 2) => {
      return num.toFixed(decimals);
    },
  );

  Handlebars.registerHelper("statusColor", (status: string) => {
    const colors: Record<string, string> = {
      Compliant: "green",
      "Non-Compliant": "red",
      Pending: "orange",
      "In Review": "blue",
    };
    return colors[status] || "gray";
  });

  Handlebars.registerHelper("sum", (...args: any[]) => {
    const values = args.slice(0, -1);
    return values.reduce((a: number, b: number) => a + b, 0);
  });

  Handlebars.registerHelper("count", (array: any[]) => {
    return array ? array.length : 0;
  });

  Handlebars.registerHelper(
    "ifEquals",
    function (this: any, arg1: any, arg2: any, options: any) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    },
  );
}

const templates: Map<string, ReturnType<typeof Handlebars.compile>> = new Map();

export function loadTemplate(name: string, template: string): void {
  registerHelpers();
  templates.set(name, Handlebars.compile(template));
}

export async function compileTemplate(
  name: string,
  data: any,
): Promise<string> {
  if (!templates.has(name)) {
    throw new Error(
      `Template '${name}' not found. Load it first with loadTemplate().`,
    );
  }

  const template = templates.get(name)!;
  return template(data);
}

export function createNCAAComplianceTemplate(): string {
  return `
# NCAA Compliance Report

**Student Information**
- Name: {{studentName}}
- Student ID: {{studentId}}
- Sport: {{sport}}
- Academic Year: {{academicYear}}

## Academic Progress Summary
- Current GPA: {{formatNumber gpa}}
- Total Credits: {{totalCredits}}
- Eligibility Credits: {{eligibilityCredits}}
- Progress Towards Degree: {{progressTowardsDegree}}%

## Course Compliance
{{#each courses}}
- {{courseCode}}: {{courseTitle}} ({{credits}} credits) - {{status}}
{{/each}}

## Compliance Status: {{status}}
{{#ifEquals status "Compliant"}}
✓ All NCAA requirements met
{{else}}
⚠ Issues identified requiring attention
{{/ifEquals}}
`;
}

export function createTransferCreditTemplate(): string {
  return `
# Transfer Credit Evaluation Report

**Student Information**
- Name: {{studentName}}
- Student ID: {{studentId}}
- Previous Institution: {{previousInstitution}}
- Transfer Date: {{formatDate transferDate}}

## Transfer Summary
- Total Courses Transferred: {{count courses}}
- Total Credits Accepted: {{formatNumber totalCredits}}
- Total GPA: {{formatNumber transferGPA}}

## Course Transfer Details
| Course Code | Course Title | Credits | Grade | Term |
|--------------|---------------|---------|-------|------|
{{#each courses}}
| {{courseCode}} | {{courseTitle}} | {{credits}} | {{grade}} | {{term}} |
{{/each}}

## NCAA Transfer Rules Compliance
{{#ifEquals transferRule "Bylaw 14.4.3.1"}}
✓ Transfer under Bylaw 14.4.3.1 (4-2-4 Transfer)
{{else}}
{{transferRule}}
{{/ifEquals}}

## Academic Progress Toward Degree
- Credits Required: {{creditsRequired}}
- Credits Earned: {{creditsEarned}}
- Percentage Complete: {{progressPercentage}}%
`;
}

export function createEligibilityReportTemplate(): string {
  return `
# NCAA Eligibility Report

**Student Information**
- Name: {{studentName}}
- Student ID: {{studentId}}
- Sport: {{sport}}
- Division: {{division}}

## Initial Eligibility
- Core Course GPA: {{formatNumber coreGPA}}
- Test Score (SAT/ACT): {{testScore}}
- Initial Eligibility Status: {{initialEligibility}}

## Continuing Eligibility
- Current GPA: {{formatNumber currentGPA}}
- Credits This Term: {{creditsThisTerm}}
- Cumulative Credits: {{cumulativeCredits}}
- APR Progress: {{aprProgress}}

## Full-Time Enrollment
- Minimum Credits Required: {{minCredits}}
- Current Credits: {{currentCredits}}
- Status: {{enrollmentStatus}}

## Six-Hour Rule
- Credits Completed: {{creditsCompleted}}
- Requirement Met: {{sixHourRule}}

## Academic Progress Requirements
{{#each requirements}}
- {{name}}: {{formatNumber value}} (Required: {{formatNumber required}}) - {{status}}
{{/each}}

## Eligibility Determination
{{#ifEquals eligibilityStatus "ELIGIBLE"}}
✓ Student is ELIGIBLE for competition
{{else}}
✗ Student is NOT ELIGIBLE - Reason: {{ineligibilityReason}}
{{/ifEquals}}
`;
}
