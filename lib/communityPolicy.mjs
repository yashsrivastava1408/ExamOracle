export const COMMUNITY_REPORT_HIDE_THRESHOLD = 3;
export const COMMUNITY_REPORT_BLOCK_THRESHOLD = 6;

const DISALLOWED_TERMS = [
  "nigger",
  "faggot",
  "kike",
  "spic",
  "chink",
  "retard",
];

const PROMO_PATTERNS = [
  /buy now/i,
  /guaranteed money/i,
  /telegram/i,
  /whatsapp/i,
  /crypto signal/i,
  /dm me for/i,
];

export function assertCommunityTextAllowed(text, maxLength, label = "Content") {
  const normalized = String(text ?? "").trim();

  if (!normalized) {
    throw new Error(`${label} is required`);
  }

  if (normalized.length > maxLength) {
    throw new Error(`${label} must be ${maxLength.toLocaleString()} characters or fewer`);
  }

  const lower = normalized.toLowerCase();

  if (DISALLOWED_TERMS.some((term) => lower.includes(term))) {
    throw new Error(`${label} contains blocked language`);
  }

  if (PROMO_PATTERNS.some((pattern) => pattern.test(normalized))) {
    throw new Error(`${label} looks like spam`);
  }

  const repeatedCharacterRun = /(.)\1{11,}/.test(normalized);
  if (repeatedCharacterRun) {
    throw new Error(`${label} looks like spam`);
  }

  const linkCount = (normalized.match(/https?:\/\//g) ?? []).length;
  if (linkCount > 2) {
    throw new Error(`${label} contains too many links`);
  }

  return normalized;
}

export function getVoteTransition(currentValue, action) {
  const nextValue = action === "upvote" ? 1 : -1;

  if (currentValue === nextValue) {
    return {
      noChange: true,
      nextValue,
      upvoteDelta: 0,
      downvoteDelta: 0,
    };
  }

  if (currentValue === 0) {
    return {
      noChange: false,
      nextValue,
      upvoteDelta: nextValue === 1 ? 1 : 0,
      downvoteDelta: nextValue === -1 ? 1 : 0,
    };
  }

  return {
    noChange: false,
    nextValue,
    upvoteDelta: nextValue === 1 ? 1 : -1,
    downvoteDelta: nextValue === -1 ? 1 : -1,
  };
}

export function getModerationOutcome(reportCount, authorTotalReports = 0) {
  return {
    shouldHide: reportCount >= COMMUNITY_REPORT_HIDE_THRESHOLD,
    shouldBlockAuthor: authorTotalReports >= COMMUNITY_REPORT_BLOCK_THRESHOLD,
  };
}

export function sortCommunityPosts(posts, sortKey) {
  const next = [...posts];

  const comparePinned = (left, right) =>
    Number(Boolean(right.isPinned)) - Number(Boolean(left.isPinned));

  if (sortKey === "top") {
    return next.sort((left, right) => {
      const pinnedDiff = comparePinned(left, right);
      if (pinnedDiff !== 0) return pinnedDiff;
      const scoreDiff = right.upvotes - right.downvotes - (left.upvotes - left.downvotes);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }

  if (sortKey === "active") {
    return next.sort((left, right) => {
      const pinnedDiff = comparePinned(left, right);
      if (pinnedDiff !== 0) return pinnedDiff;
      const commentDiff = (right._count?.comments ?? 0) - (left._count?.comments ?? 0);
      if (commentDiff !== 0) return commentDiff;
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }

  return next.sort(
    (left, right) => {
      const pinnedDiff = comparePinned(left, right);
      if (pinnedDiff !== 0) return pinnedDiff;
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }
  );
}
