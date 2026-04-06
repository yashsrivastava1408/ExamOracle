import { NextResponse } from "next/server";
import { castCommentVote } from "@/lib/community";
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
      key: `comment-vote:${alias.id}`,
      limit: 60,
      windowMs: 60 * 1000,
      label: "votes",
    });

    if (action === "upvote" || action === "downvote") {
      const comment = await castCommentVote({
        commentId: id,
        aliasId: alias.id,
        action,
      });
      return NextResponse.json(comment);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to vote on comment:", error);
    if (error instanceof Error) {
      const status =
        error.message.includes("Too many") || error.message.includes("Cross-origin")
          ? 429
          : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Failed to vote on comment" }, { status: 500 });
  }
}
