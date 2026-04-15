import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateAnonymousIdentity } from "@/lib/communityIdentity";
import { assertTrustedMutationOrigin, enforceRateLimit } from "@/lib/communitySecurity";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertTrustedMutationOrigin(req);
    const { id: postId } = await params;
    const { pollOptionId } = await req.json();

    if (!pollOptionId) {
      return NextResponse.json(
        { error: "Poll option ID is required" },
        { status: 400 }
      );
    }

    const { alias } = await getOrCreateAnonymousIdentity();

    enforceRateLimit({
      key: `poll:${alias.id}`,
      limit: 10,
      windowMs: 60 * 1000,
      label: "poll_votes",
    });

    if (alias.isBlocked) {
      return NextResponse.json(
        { error: "You are blocked from participating" },
        { status: 403 }
      );
    }

    // Verify option belongs to post
    const option = await prisma.pollOption.findUnique({
      where: { id: pollOptionId },
    });

    if (!option || option.postId !== postId) {
      return NextResponse.json(
        { error: "Invalid poll option" },
        { status: 400 }
      );
    }

    // Try to vote, catching unique constraint violation if they already voted
    try {
      await prisma.pollVote.create({
        data: {
          postId,
          pollOptionId,
          aliasId: alias.id,
        },
      });
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
        return NextResponse.json(
          { error: "You have already voted on this poll" },
          { status: 400 }
        );
      }
      throw error;
    }

    // After voting, return the updated option counts so the UI can update
    const updatedOptions = await prisma.pollOption.findMany({
      where: { postId },
      include: {
        _count: { select: { votes: true } },
      },
    });

    return NextResponse.json({ 
      success: true, 
      pollOptions: updatedOptions,
      viewerPollVoteId: pollOptionId
    });
  } catch (error) {
    console.error("Failed to submit poll vote:", error);
    
    if (error instanceof Error) {
      const status = error.message.includes("Too many") ? 429 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
