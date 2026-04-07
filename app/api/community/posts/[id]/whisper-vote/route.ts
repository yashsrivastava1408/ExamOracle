import { NextResponse } from "next/server";
import { castWhisperVote } from "@/lib/community";
import { getOrCreateAnonymousIdentity } from "@/lib/communityIdentity";
import { assertTrustedMutationOrigin } from "@/lib/communitySecurity";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertTrustedMutationOrigin(req);
    const { id: postId } = await params;
    const { value } = await req.json();

    if (!["TRUE", "CAP", "IDK"].includes(value)) {
      return NextResponse.json({ error: "Invalid vote value" }, { status: 400 });
    }

    const { alias } = await getOrCreateAnonymousIdentity();
    const post = await castWhisperVote({
      postId,
      aliasId: alias.id,
      value: value as "TRUE" | "CAP" | "IDK",
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Whisper vote failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Vote failed" },
      { status: 400 }
    );
  }
}
