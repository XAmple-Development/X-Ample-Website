import { NextResponse } from "next/server";

export function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return "Unknown error";
  }
}

export function errorJson(e: unknown, status = 502) {
  return NextResponse.json(
    {
      error: errorMessage(e),
    },
    { status },
  );
}

