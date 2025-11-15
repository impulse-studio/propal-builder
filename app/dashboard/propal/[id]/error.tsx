"use client";

import {
  RiErrorWarningLine,
  RiHomeLine,
  RiRefreshLine,
} from "@remixicon/react";
import Link from "next/link";
import Header from "@/components/header";
import * as Button from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string; code?: string; status?: number };
  reset: () => void;
}

function isORPCError(
  error: unknown,
): error is Error & { code: string; status?: number } {
  return (
    error instanceof Error &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  );
}

export default function PropalError({ error, reset }: ErrorProps) {
  const isNotFound = isORPCError(error) && error.code === "PROPAL_NOT_FOUND";
  const errorMessage = isNotFound
    ? "The propal you're looking for doesn't exist or has been deleted."
    : error.message || "Something went wrong while loading the propal.";

  return (
    <div className="flex h-screen flex-col bg-bg-weak-50">
      <Header />
      <main className="flex flex-1 items-center justify-center p-5">
        <div className="flex flex-col items-center gap-6 text-center">
          <RiErrorWarningLine className="size-16 text-error-base" />
          <div className="flex flex-col gap-2">
            <h1 className="text-label-lg font-semibold text-text-strong-950">
              {isNotFound ? "Propal Not Found" : "Error Loading Propal"}
            </h1>
            <p className="text-paragraph-sm text-text-sub-600">
              {errorMessage}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button.Root mode="filled" size="medium" onClick={reset}>
              <Button.Icon as={RiRefreshLine} />
              Try Again
            </Button.Root>
            <Button.Root variant="neutral" mode="stroke" size="medium" asChild>
              <Link href="/dashboard">
                <Button.Icon as={RiHomeLine} />
                Go to Dashboard
              </Link>
            </Button.Root>
          </div>
        </div>
      </main>
    </div>
  );
}
