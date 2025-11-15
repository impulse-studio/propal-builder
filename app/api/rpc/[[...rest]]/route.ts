import { ORPCError, onError, ValidationError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import {
  BatchHandlerPlugin,
  StrictGetMethodPlugin,
} from "@orpc/server/plugins";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import z from "zod";

import { db } from "@/db";
import { env } from "@/env";
import { appRouter } from "@/server/routers/_app";

const handler = new RPCHandler(appRouter, {
  plugins: [new StrictGetMethodPlugin(), new BatchHandlerPlugin()],
  clientInterceptors: [
    onError(async (error) => {
      if (env.NODE_ENV === "development") {
        console.error("ORPC Error:", error);
      }

      if (
        error instanceof ORPCError &&
        error.code === "BAD_REQUEST" &&
        error.cause instanceof ValidationError
      ) {
        const zodError = new z.ZodError(
          error.cause.issues as z.core.$ZodIssue[],
        );

        throw new ORPCError("INPUT_VALIDATION_FAILED", {
          status: 422,
          message: z.prettifyError(zodError),
          data: z.flattenError(zodError),
          cause: error.cause,
        });
      }
    }),
  ],
});

async function handleRequest(request: NextRequest) {
  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: {
      headers: await headers(),
      db,
    },
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
