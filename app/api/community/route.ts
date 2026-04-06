import { NextResponse } from "next/server";
import { createCommunityPost, fetchCommunityPosts } from "@/lib/community";
import { getOrCreateAnonymousIdentity } from "@/lib/communityIdentity";
import { assertTrustedMutationOrigin, enforceRateLimit } from "@/lib/communitySecurity";

export async function GET(request: Request) {
  try {
    const { alias } = await getOrCreateAnonymousIdentity();
    const sort = new URL(request.url).searchParams.get("sort");
    const posts = await fetchCommunityPosts({
      aliasId: alias.id,
      sort: sort === "top" || sort === "active" ? sort : "latest",
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Failed to fetch community posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch community posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    assertTrustedMutationOrigin(req);
    const {
      signalType,
      title,
      content,
      subjectTag,
      locationHint,
      quietLevel,
      hotTakeScore,
      expiresInHours,
    } = await req.json();
    const { alias } = await getOrCreateAnonymousIdentity();
    enforceRateLimit({
      key: `post:${alias.id}`,
      limit: 5,
      windowMs: 10 * 60 * 1000,
      label: "posts",
    });
    const post = await createCommunityPost({
      signalType,
      title,
      content,
      subjectTag,
      locationHint,
      quietLevel,
      hotTakeScore,
      expiresInHours,
      aliasId: alias.id,
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Failed to create community post:", error);

    if (error instanceof Error) {
      const status = error.message.includes("Too many") ? 429 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json(
      { error: "Failed to create community post" },
      { status: 500 }
    );
  }
}
