import { NextResponse } from "next/server";
import { castPostVote } from "@/lib/community";
import { getOrCreateAnonymousIdentity } from "@/lib/communityIdentity";
import { assertTrustedMutationOrigin, enforceRateLimit } from "@/lib/communitySecurity";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertTrustedMutationOrigin(req);
    const { id } = await params;
    const { action } = await req.json();
    const { alias } = await getOrCreateAnonymousIdentity();
    enforceRateLimit({
      key: `post-vote:${alias.id}`,
      limit: 60,
      windowMs: 60 * 1000,
      label: "votes",
    });

    if (action === "upvote" || action === "downvote") {
      const post = await castPostVote({
        postId: id,
        aliasId: alias.id,
        action,
      });
      return NextResponse.json(post);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update vote:", error);
    if (error instanceof Error) {
      const status =
        error.message.includes("Too many") || error.message.includes("Cross-origin")
          ? 429
          : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Failed to update vote" }, { status: 500 });
  }
}
