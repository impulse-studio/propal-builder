import { Database } from "@/db";
import { os } from "@orpc/server";

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
