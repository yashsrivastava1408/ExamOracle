import { prisma } from "@/lib/prisma";
import {
  assertCommunityTextAllowed,
  getModerationOutcome,
  getVoteTransition,
  sortCommunityPosts,
} from "@/lib/communityPolicy.mjs";

type SortKey = "latest" | "top" | "active";

type VoteAction = "upvote" | "downvote";

export const POST_INCLUDE = {
  alias: {
    select: { 
      name: true,
      posts: {
        where: { upvotes: { gte: 20 } },
        take: 1,
        select: { id: true }
      }
    },
  },
  _count: {
    select: { comments: true },
  },
  pollOptions: {
    include: {
      _count: { select: { votes: true } }
    }
  },
  whisperVotes: {
    select: { value: true, aliasId: true }
  }
} as const;

export const COMMENT_INCLUDE = {
  alias: {
    select: { 
      name: true,
      posts: {
        where: { upvotes: { gte: 20 } },
        take: 1,
        select: { id: true }
      }
    },
  },
} as const;

function assertAliasCanParticipate(alias: { isBlocked: boolean }) {
  if (alias.isBlocked) {
    throw new Error("This anonymous identity has been blocked from community actions");
  }
}

function normalizePostPayload<T extends {
  votes?: Array<{ aliasId: string; value: number }>;
  reports?: Array<{ aliasId: string }>;
  pollVotes?: Array<{ pollOptionId: string }>;
  alias: { name: string; posts?: Array<{ id: string }> };
}>(post: T, aliasId?: string) {
  const { alias, ...rest } = post;
  return {
    ...rest,
    alias: {
      name: alias.name,
      hasGuruBadge: alias.posts && alias.posts.length > 0,
    },
    viewerVote:
      aliasId == null
        ? 0
        : rest.votes?.find((vote) => vote.aliasId === aliasId)?.value ?? 0,
    viewerReported:
      aliasId == null
        ? false
        : (rest.reports?.some((report) => report.aliasId === aliasId) ?? false),
    viewerPollVoteId:
      aliasId == null
        ? null
        : (rest.pollVotes?.[0]?.pollOptionId ?? null),
    whisperStats: (() => {
      const votes = (rest as any).whisperVotes || [];
      const total = votes.length;
      return {
        total,
        true: votes.filter((v: any) => v.value === "TRUE").length,
        cap: votes.filter((v: any) => v.value === "CAP").length,
        idk: votes.filter((v: any) => v.value === "IDK").length,
      };
    })(),
    viewerWhisperVote:
      aliasId == null
        ? null
        : ((rest as any).whisperVotes?.find((v: any) => v.aliasId === aliasId)?.value ?? null),
  };
}

function normalizeCommentPayload<T extends {
  votes?: Array<{ aliasId: string; value: number }>;
  reports?: Array<{ aliasId: string }>;
  alias: { name: string; posts?: Array<{ id: string }> };
}>(comment: T, aliasId?: string) {
  const { alias, ...rest } = comment;
  return {
    ...rest,
    alias: {
      name: alias.name,
      hasGuruBadge: alias.posts && alias.posts.length > 0,
    },
    viewerVote:
      aliasId == null
        ? 0
        : rest.votes?.find((vote) => vote.aliasId === aliasId)?.value ?? 0,
    viewerReported:
      aliasId == null
        ? false
        : (rest.reports?.some((report) => report.aliasId === aliasId) ?? false),
  };
}

export async function fetchCommunityPosts(input?: {
  aliasId?: string;
  sort?: SortKey;
  tab?: "oracle" | "whisper";
}) {
  const oracleSignals = [
    "warning",
    "resource",
    "doubt",
    "library_live",
    "survival_thread",
    "poll",
  ];
  const whisperSignals = ["confession", "hot_take", "intel_drop"];

  const posts = await prisma.post.findMany({
    where: {
      isHidden: false,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      signalType:
        input?.tab === "whisper"
          ? { in: whisperSignals }
          : { in: oracleSignals },
    },
    include: {
      ...POST_INCLUDE,
      votes: input?.aliasId
        ? {
            where: { aliasId: input.aliasId },
            select: { aliasId: true, value: true },
          }
        : false,
      reports: input?.aliasId
        ? {
            where: { aliasId: input.aliasId },
            select: { aliasId: true },
          }
        : false,
      // @ts-ignore
      pollVotes: input?.aliasId
        ? {
            where: { aliasId: input.aliasId },
            select: { pollOptionId: true },
          }
        : false,
    },
  });

  const sorted = sortCommunityPosts(posts, input?.sort ?? "latest");
  // @ts-ignore
  return sorted.map((post) => normalizePostPayload(post, input?.aliasId));
}

export async function createCommunityPost(input: {
  signalType: string;
  title: string;
  content: string;
  subjectTag?: string;
  locationHint?: string;
  quietLevel?: number | null;
  hotTakeScore?: number | null;
  expiresInHours?: number | null;
  pollOptions?: string[];
  aliasId: string;
}) {
  const signalType = input.signalType.trim();
  const title = assertCommunityTextAllowed(input.title, 120, "Title");
  const content = assertCommunityTextAllowed(input.content, 2000, "Post");
  const subjectTag = input.subjectTag?.trim() || null;
  const locationHint = input.locationHint?.trim() || null;
  const aliasId = input.aliasId.trim();
  const quietLevel = input.quietLevel ?? null;
  const hotTakeScore = input.hotTakeScore ?? null;
  const expiresInHours = input.expiresInHours ?? null;
  const submittedPollOptions = input.pollOptions?.map(o => o.trim()).filter(o => o.length > 0) || [];

  const validSignalTypes = new Set([
    "confession",
    "warning",
    "resource",
    "doubt",
    "hot_take",
    "library_live",
    "survival_thread",
    "intel_drop",
    "poll",
  ]);

  if (!aliasId || !signalType || !validSignalTypes.has(signalType)) {
    throw new Error("Missing required fields");
  }

  if (subjectTag && subjectTag.length > 40) {
    throw new Error("Subject tag must be 40 characters or fewer");
  }

  if (locationHint && locationHint.length > 80) {
    throw new Error("Location hint must be 80 characters or fewer");
  }

  if (signalType === "hot_take" && (hotTakeScore == null || hotTakeScore < 1 || hotTakeScore > 10)) {
    throw new Error("Hot take meter must be between 1 and 10");
  }

  if (signalType === "library_live" && (!locationHint || quietLevel == null || quietLevel < 1 || quietLevel > 5)) {
    throw new Error("Library live posts need a location and quiet meter");
  }

  if (signalType === "intel_drop" && (expiresInHours == null || expiresInHours < 1 || expiresInHours > 72)) {
    throw new Error("Campus intel drops need an expiry window between 1 and 72 hours");
  }

  if (signalType === "survival_thread" && !subjectTag) {
    throw new Error("Survival threads need a subject tag");
  }

  if (signalType === "poll" && submittedPollOptions.length < 2) {
    throw new Error("Polls require at least 2 valid options");
  }

  const alias = await prisma.alias.findUnique({
    where: { id: aliasId },
    select: { isBlocked: true },
  });

  if (!alias) {
    throw new Error("Anonymous identity is missing");
  }

  assertAliasCanParticipate(alias);

  const post = await prisma.post.create({
    data: {
      signalType,
      title,
      content,
      subjectTag,
      locationHint,
      quietLevel,
      hotTakeScore,
      expiresAt:
        signalType === "intel_drop" && expiresInHours != null
          ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
          : null,
      isPinned: signalType === "survival_thread",
      aliasId,
      pollOptions: signalType === "poll" && submittedPollOptions.length > 0 ? {
        create: submittedPollOptions.map(text => ({ text }))
      } : undefined,
    },
    include: {
      ...POST_INCLUDE,
      votes: {
        where: { aliasId },
        select: { aliasId: true, value: true },
      },
      reports: {
        where: { aliasId },
        select: { aliasId: true },
      },
      // @ts-ignore
      pollVotes: {
        where: { aliasId },
        select: { pollOptionId: true },
      },
    },
  });

  // @ts-ignore
  return normalizePostPayload(post, aliasId);
}

export async function fetchPostComments(input: {
  postId: string;
  aliasId?: string;
}) {
  const comments = await prisma.comment.findMany({
    where: {
      postId: input.postId,
      isHidden: false,
    },
    orderBy: { createdAt: "asc" },
    include: {
      ...COMMENT_INCLUDE,
      votes: input.aliasId
        ? {
            where: { aliasId: input.aliasId },
            select: { aliasId: true, value: true },
          }
        : false,
      reports: input.aliasId
        ? {
            where: { aliasId: input.aliasId },
            select: { aliasId: true },
          }
        : false,
    },
  });

  return comments.map((comment) => normalizeCommentPayload(comment, input.aliasId));
}

export async function createPostComment(input: {
  postId: string;
  content: string;
  aliasId: string;
}) {
  const postId = input.postId.trim();
  const content = assertCommunityTextAllowed(input.content, 800, "Comment");
  const aliasId = input.aliasId.trim();

  if (!postId || !aliasId) {
    throw new Error("Missing required fields");
  }

  const [alias, post] = await Promise.all([
    prisma.alias.findUnique({
      where: { id: aliasId },
      select: { isBlocked: true },
    }),
    prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, isHidden: true, expiresAt: true },
    }),
  ]);

  if (!alias) {
    throw new Error("Anonymous identity is missing");
  }

  assertAliasCanParticipate(alias);

  if (!post || post.isHidden || (post.expiresAt && post.expiresAt <= new Date())) {
    throw new Error("This post is no longer available");
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      aliasId,
    },
    include: {
      ...COMMENT_INCLUDE,
      votes: {
        where: { aliasId },
        select: { aliasId: true, value: true },
      },
      reports: {
        where: { aliasId },
        select: { aliasId: true },
      },
    },
  });

  // @ts-ignore
  return normalizeCommentPayload(comment, aliasId);
}

async function applyVoteToPost(input: {
  entityId: string;
  aliasId: string;
  action: VoteAction;
}) {
  const existingVote = await prisma.postVote.findUnique({
    where: {
      postId_aliasId: {
        postId: input.entityId,
        aliasId: input.aliasId,
      },
    },
  });

  const transition = getVoteTransition(existingVote?.value ?? 0, input.action);

  if (transition.noChange) {
    const post = await prisma.post.findUnique({
      where: { id: input.entityId },
      include: {
        ...POST_INCLUDE,
        votes: {
          where: { aliasId: input.aliasId },
          select: { aliasId: true, value: true },
        },
        reports: {
          where: { aliasId: input.aliasId },
          select: { aliasId: true },
        },
        // @ts-ignore
        pollVotes: {
          where: { aliasId: input.aliasId },
          select: { pollOptionId: true },
        },
      },
    });
    // @ts-ignore
    return post ? normalizePostPayload(post, input.aliasId) : null;
  }

  const post = await prisma.$transaction(async (tx) => {
    if (!existingVote) {
      await tx.postVote.create({
        data: {
          postId: input.entityId,
          aliasId: input.aliasId,
          value: transition.nextValue,
        },
      });
    } else {
      await tx.postVote.update({
        where: { id: existingVote.id },
        data: { value: transition.nextValue },
      });
    }

    return tx.post.update({
      where: { id: input.entityId },
      data: {
        upvotes: { increment: transition.upvoteDelta },
        downvotes: { increment: transition.downvoteDelta },
      },
      include: {
        ...POST_INCLUDE,
        votes: {
          where: { aliasId: input.aliasId },
          select: { aliasId: true, value: true },
        },
        reports: {
          where: { aliasId: input.aliasId },
          select: { aliasId: true },
        },
        // @ts-ignore
        pollVotes: {
          where: { aliasId: input.aliasId },
          select: { pollOptionId: true },
        },
      },
    });
  });

  // @ts-ignore
  return normalizePostPayload(post, input.aliasId);
}

async function applyVoteToComment(input: {
  entityId: string;
  aliasId: string;
  action: VoteAction;
}) {
  const existingVote = await prisma.commentVote.findUnique({
    where: {
      commentId_aliasId: {
        commentId: input.entityId,
        aliasId: input.aliasId,
      },
    },
  });

  const transition = getVoteTransition(existingVote?.value ?? 0, input.action);

  if (transition.noChange) {
    const comment = await prisma.comment.findUnique({
      where: { id: input.entityId },
      include: {
        ...COMMENT_INCLUDE,
        votes: {
          where: { aliasId: input.aliasId },
          select: { aliasId: true, value: true },
        },
        reports: {
          where: { aliasId: input.aliasId },
          select: { aliasId: true },
        },
      },
    });
    return comment ? normalizeCommentPayload(comment, input.aliasId) : null;
  }

  const comment = await prisma.$transaction(async (tx) => {
    if (!existingVote) {
      await tx.commentVote.create({
        data: {
          commentId: input.entityId,
          aliasId: input.aliasId,
          value: transition.nextValue,
        },
      });
    } else {
      await tx.commentVote.update({
        where: { id: existingVote.id },
        data: { value: transition.nextValue },
      });
    }

    return tx.comment.update({
      where: { id: input.entityId },
      data: {
        upvotes: { increment: transition.upvoteDelta },
        downvotes: { increment: transition.downvoteDelta },
      },
      include: {
        ...COMMENT_INCLUDE,
        votes: {
          where: { aliasId: input.aliasId },
          select: { aliasId: true, value: true },
        },
        reports: {
          where: { aliasId: input.aliasId },
          select: { aliasId: true },
        },
      },
    });
  });

  return normalizeCommentPayload(comment, input.aliasId);
}

export async function castPostVote(input: {
  postId: string;
  aliasId: string;
  action: VoteAction;
}) {
  const alias = await prisma.alias.findUnique({
    where: { id: input.aliasId },
    select: { isBlocked: true },
  });

  if (!alias) {
    throw new Error("Anonymous identity is missing");
  }

  assertAliasCanParticipate(alias);
  return applyVoteToPost({
    entityId: input.postId.trim(),
    aliasId: input.aliasId.trim(),
    action: input.action,
  });
}

export async function castCommentVote(input: {
  commentId: string;
  aliasId: string;
  action: VoteAction;
}) {
  const alias = await prisma.alias.findUnique({
    where: { id: input.aliasId },
    select: { isBlocked: true },
  });

  if (!alias) {
    throw new Error("Anonymous identity is missing");
  }

  assertAliasCanParticipate(alias);
  return applyVoteToComment({
    entityId: input.commentId.trim(),
    aliasId: input.aliasId.trim(),
    action: input.action,
  });
}

export async function reportPost(input: { postId: string; aliasId: string }) {
  const postId = input.postId.trim();
  const aliasId = input.aliasId.trim();

  const [alias, existingReport] = await Promise.all([
    prisma.alias.findUnique({
      where: { id: aliasId },
      select: { isBlocked: true },
    }),
    prisma.postReport.findUnique({
      where: { postId_aliasId: { postId, aliasId } },
    }),
  ]);

  if (!alias) {
    throw new Error("Anonymous identity is missing");
  }

  assertAliasCanParticipate(alias);

  if (existingReport) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        ...POST_INCLUDE,
        votes: {
          where: { aliasId },
          select: { aliasId: true, value: true },
        },
        reports: {
          where: { aliasId },
          select: { aliasId: true },
        },
        // @ts-ignore
        pollVotes: {
          where: { aliasId },
          select: { pollOptionId: true },
        },
      },
    });

    // @ts-ignore
    return post ? normalizePostPayload(post, aliasId) : null;
  }

  return prisma.$transaction(async (tx) => {
    const report = await tx.postReport.create({
      data: { postId, aliasId },
    });

    const post = await tx.post.update({
      where: { id: postId },
      data: { reportCount: { increment: 1 } },
      include: {
        alias: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    });

    const outcome = getModerationOutcome(post.reportCount);

    if (outcome.shouldHide && !post.isHidden) {
      await tx.post.update({
        where: { id: postId },
        data: { isHidden: true },
      });
    }

    const totalAuthorReports = await tx.post.aggregate({
      where: { aliasId: post.alias.id },
      _sum: { reportCount: true },
    });
    const totalCommentReports = await tx.comment.aggregate({
      where: { aliasId: post.alias.id },
      _sum: { reportCount: true },
    });
    const authorTotalReports =
      (totalAuthorReports._sum.reportCount ?? 0) +
      (totalCommentReports._sum.reportCount ?? 0);

    if (getModerationOutcome(post.reportCount, authorTotalReports).shouldBlockAuthor) {
      await tx.alias.update({
        where: { id: post.alias.id },
        data: {
          isBlocked: true,
          blockedAt: new Date(),
        },
      });
    }

    const freshPost = await tx.post.findUnique({
      where: { id: postId },
      include: {
        ...POST_INCLUDE,
        votes: {
          where: { aliasId },
          select: { aliasId: true, value: true },
        },
        reports: {
          where: { aliasId },
          select: { aliasId: true },
        },
        // @ts-ignore
        pollVotes: {
          where: { aliasId },
          select: { pollOptionId: true },
        },
      },
    });

    void report;
    // @ts-ignore
    return freshPost ? normalizePostPayload(freshPost, aliasId) : null;
  });
}

export async function reportComment(input: { commentId: string; aliasId: string }) {
  const commentId = input.commentId.trim();
  const aliasId = input.aliasId.trim();

  const [alias, existingReport] = await Promise.all([
    prisma.alias.findUnique({
      where: { id: aliasId },
      select: { isBlocked: true },
    }),
    prisma.commentReport.findUnique({
      where: { commentId_aliasId: { commentId, aliasId } },
    }),
  ]);

  if (!alias) {
    throw new Error("Anonymous identity is missing");
  }

  assertAliasCanParticipate(alias);

  if (existingReport) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        ...COMMENT_INCLUDE,
        votes: {
          where: { aliasId },
          select: { aliasId: true, value: true },
        },
        reports: {
          where: { aliasId },
          select: { aliasId: true },
        },
      },
    });

    return comment ? normalizeCommentPayload(comment, aliasId) : null;
  }

  return prisma.$transaction(async (tx) => {
    await tx.commentReport.create({
      data: { commentId, aliasId },
    });

    const comment = await tx.comment.update({
      where: { id: commentId },
      data: { reportCount: { increment: 1 } },
      include: {
        alias: { select: { id: true, name: true } },
      },
    });

    const outcome = getModerationOutcome(comment.reportCount);

    if (outcome.shouldHide && !comment.isHidden) {
      await tx.comment.update({
        where: { id: commentId },
        data: { isHidden: true },
      });
    }

    const totalAuthorReports = await tx.post.aggregate({
      where: { aliasId: comment.alias.id },
      _sum: { reportCount: true },
    });
    const totalCommentReports = await tx.comment.aggregate({
      where: { aliasId: comment.alias.id },
      _sum: { reportCount: true },
    });
    const authorTotalReports =
      (totalAuthorReports._sum.reportCount ?? 0) +
      (totalCommentReports._sum.reportCount ?? 0);

    if (getModerationOutcome(comment.reportCount, authorTotalReports).shouldBlockAuthor) {
      await tx.alias.update({
        where: { id: comment.alias.id },
        data: {
          isBlocked: true,
          blockedAt: new Date(),
        },
      });
    }

    const freshComment = await tx.comment.findUnique({
      where: { id: commentId },
      include: {
        ...COMMENT_INCLUDE,
        votes: {
          where: { aliasId },
          select: { aliasId: true, value: true },
        },
        reports: {
          where: { aliasId },
          select: { aliasId: true },
        },
      },
    });

    return freshComment ? normalizeCommentPayload(freshComment, aliasId) : null;
  });
}

export async function castWhisperVote(input: {
  postId: string;
  aliasId: string;
  value: "TRUE" | "CAP" | "IDK";
}) {
  const alias = await prisma.alias.findUnique({
    where: { id: input.aliasId },
    select: { isBlocked: true },
  });

  if (!alias) throw new Error("Anonymous identity is missing");
  assertAliasCanParticipate(alias);

  const postId = input.postId.trim();
  const aliasId = input.aliasId.trim();

  const post = await prisma.$transaction(async (tx) => {
    const existing = await tx.whisperVote.findUnique({
      where: { postId_aliasId: { postId, aliasId } }
    });

    if (existing) {
      if (existing.value === input.value) {
        // Remove vote if clicking same one
        await tx.whisperVote.delete({ where: { id: existing.id } });
      } else {
        // Change vote
        await tx.whisperVote.update({
          where: { id: existing.id },
          data: { value: input.value }
        });
      }
    } else {
      await tx.whisperVote.create({
        data: { postId, aliasId, value: input.value }
      });
    }

    return tx.post.findUnique({
      where: { id: postId },
      include: {
        ...POST_INCLUDE,
        votes: {
          where: { aliasId },
          select: { aliasId: true, value: true },
        },
        reports: {
          where: { aliasId },
          select: { aliasId: true },
        },
        // @ts-ignore
        pollVotes: {
          where: { aliasId },
          select: { pollOptionId: true },
        },
      },
    });
  });

  // @ts-ignore
  return post ? normalizePostPayload(post, aliasId) : null;
}
