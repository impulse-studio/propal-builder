import { os } from "@orpc/server";
import type { Database } from "@/db";

export const base = os
  .$context<{
    headers: Headers;
    db: Database;
  }>()
  .errors({
    UNAUTHORIZED: {
      status: 401,
    },
    FORBIDDEN: {
      status: 403,
    },
  });
