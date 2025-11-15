import { NextResponse } from "next/server";
import { z } from "zod";
import { createPropalWorkflow } from "@/app/workflows/create-propal-workflow";

const webhookSchema = z.object({
  qdrantCollectionId: z.string().min(1),
  dealSlug: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = webhookSchema.parse(body);

    await createPropalWorkflow({
      qdrantCollectionId: validatedData.qdrantCollectionId,
      dealSlug: validatedData.dealSlug,
    });

    return NextResponse.json(
      { success: true, message: "Workflow started" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
