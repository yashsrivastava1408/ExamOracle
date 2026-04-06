import { NextResponse } from "next/server";
import { getOrCreateAnonymousIdentity } from "@/lib/communityIdentity";

export async function GET() {
  try {
    const { alias, created } = await getOrCreateAnonymousIdentity();
    return NextResponse.json({
      alias: alias.name,
      isBlocked: alias.isBlocked,
      isNew: created,
      mode: "anonymous-pseudonymous-session",
    });
  } catch (error) {
    console.error("Failed to initialize anonymous identity:", error);
    return NextResponse.json(
      { error: "Failed to initialize anonymous identity" },
      { status: 500 }
    );
  }
}
