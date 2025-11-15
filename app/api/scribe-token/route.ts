import { NextResponse } from "next/server";

import { env } from "@/env";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v1/single-use-token/realtime_scribe",
      {
        method: "POST",
        headers: {
          "xi-api-key": env.ELEVENLABS_API_KEY,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs token error:", errorText);
      return NextResponse.json(
        { error: "Failed to create ElevenLabs token" },
        { status: 500 },
      );
    }

    const data = (await response.json()) as { token?: string };

    if (!data.token) {
      console.error("ElevenLabs token response missing token field");
      return NextResponse.json(
        { error: "Invalid ElevenLabs token response" },
        { status: 500 },
      );
    }

    return NextResponse.json({ token: data.token });
  } catch (error) {
    console.error("ElevenLabs token request failed:", error);
    return NextResponse.json(
      { error: "Internal server error while creating ElevenLabs token" },
      { status: 500 },
    );
  }
}
