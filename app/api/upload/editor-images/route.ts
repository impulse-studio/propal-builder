import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
          ],
          maxSize: 10 * 1024 * 1024,
        };
      },
      onUploadCompleted: async ({ tokenPayload }) => {
        try {
          if (!tokenPayload) {
            throw new Error("No token payload");
          }
        } catch (error) {
          console.error(error);
          throw new Error("Failed to process editor image upload");
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
