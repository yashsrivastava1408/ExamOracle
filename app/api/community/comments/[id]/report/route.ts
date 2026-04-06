import { NextResponse } from "next/server";
import { reportComment } from "@/lib/community";
import { getOrCreateAnonymousIdentity } from "@/lib/communityIdentity";
import { assertTrustedMutationOrigin, enforceRateLimit } from "@/lib/communitySecurity";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertTrustedMutationOrigin(req);
    const { id } = await params;
    const { alias } = await getOrCreateAnonymousIdentity();

    enforceRateLimit({
      key: `comment-report:${alias.id}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
      label: "reports",
    });

    const comment = await reportComment({
      commentId: id,
      aliasId: alias.id,
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Failed to report comment:", error);
    if (error instanceof Error) {
      const status = error.message.includes("Too many") ? 429 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Failed to report comment" }, { status: 500 });
  }
}
