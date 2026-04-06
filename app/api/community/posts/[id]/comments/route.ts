import { NextResponse } from "next/server";
import { createPostComment, fetchPostComments } from "@/lib/community";
import { getOrCreateAnonymousIdentity } from "@/lib/communityIdentity";
import { assertTrustedMutationOrigin, enforceRateLimit } from "@/lib/communitySecurity";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { alias } = await getOrCreateAnonymousIdentity();
    const comments = await fetchPostComments({ postId: id, aliasId: alias.id });
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertTrustedMutationOrigin(req);
    const { id } = await params;
    const { content } = await req.json();
    const { alias } = await getOrCreateAnonymousIdentity();
    enforceRateLimit({
      key: `comment:${alias.id}`,
      limit: 12,
      windowMs: 10 * 60 * 1000,
      label: "comments",
    });
    const comment = await createPostComment({
      postId: id,
      content,
      aliasId: alias.id,
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Failed to create comment:", error);

    if (error instanceof Error) {
      const status = error.message.includes("Too many") ? 429 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
