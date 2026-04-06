import { NextResponse } from "next/server";
import { reportPost } from "@/lib/community";
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
      key: `post-report:${alias.id}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
      label: "reports",
    });

    const post = await reportPost({
      postId: id,
      aliasId: alias.id,
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Failed to report post:", error);
    if (error instanceof Error) {
      const status = error.message.includes("Too many") ? 429 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Failed to report post" }, { status: 500 });
  }
}
