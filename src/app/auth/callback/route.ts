import { NextResponse } from "next/server";
import { serverClient } from "@/backend/supabase/server";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const client = await serverClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/tasks", url.origin));
  }
  return NextResponse.redirect(
    new URL("/login?confirmation=failed", url.origin),
  );
}
