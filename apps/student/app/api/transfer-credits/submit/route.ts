import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@aah/auth";
import {
  TransferCreditSubmitInputSchema,
  ValidationErrorSchema,
} from "@aah/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createValidationErrorResponse(errors: ValidationErrorSchema[]) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        errors,
      },
    },
    { status: 400 },
  );
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    const formData = await request.formData();

    const rawData = {
      institutionId: formData.get("institutionId") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      notes: formData.get("notes") as string | null,
      documents: formData.getAll("documents") as File[],
    };

    const validationResult = TransferCreditSubmitInputSchema.safeParse(rawData);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
        value: issue.received,
      }));
      return createValidationErrorResponse(errors);
    }

    const validatedData = validationResult.data;

    console.log("Transfer credit submission:", {
      userId: user.id,
      institutionId: validatedData.institutionId,
      startDate: validatedData.startDate,
      endDate: validatedData.endDate,
      notes: validatedData.notes,
      documentCount: validatedData.documents?.length || 0,
    });

    const submissionId = `TC-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    return NextResponse.json({
      success: true,
      data: {
        id: submissionId,
        status: "submitted",
      },
      message: "Transfer credit request submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting transfer credit:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to submit transfer credit request",
        },
      },
      { status: 500 },
    );
  }
}
