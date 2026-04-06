import test from "node:test";
import assert from "node:assert/strict";
import {
  assertCommunityTextAllowed,
  getModerationOutcome,
  getVoteTransition,
  sortCommunityPosts,
} from "../lib/communityPolicy.mjs";

test("getVoteTransition handles first vote and vote switch", () => {
  assert.deepEqual(getVoteTransition(0, "upvote"), {
    noChange: false,
    nextValue: 1,
    upvoteDelta: 1,
    downvoteDelta: 0,
  });

  assert.deepEqual(getVoteTransition(1, "downvote"), {
    noChange: false,
    nextValue: -1,
    upvoteDelta: -1,
    downvoteDelta: 1,
  });
});

test("getModerationOutcome hides earlier than it blocks", () => {
  assert.deepEqual(getModerationOutcome(3, 2), {
    shouldHide: true,
    shouldBlockAuthor: false,
  });

  assert.deepEqual(getModerationOutcome(4, 6), {
    shouldHide: true,
    shouldBlockAuthor: true,
  });
});

test("assertCommunityTextAllowed rejects spam patterns and blocked language", () => {
  assert.throws(
    () => assertCommunityTextAllowed("buy now on telegram", 200, "Post"),
    /looks like spam/
  );

  assert.throws(
    () => assertCommunityTextAllowed("this contains retard language", 200, "Post"),
    /blocked language/
  );
});

test("sortCommunityPosts supports latest, top, and active views", () => {
  const posts = [
    {
      id: "a",
      createdAt: "2026-04-01T10:00:00.000Z",
      upvotes: 6,
      downvotes: 1,
      _count: { comments: 1 },
    },
    {
      id: "b",
      createdAt: "2026-04-03T10:00:00.000Z",
      upvotes: 2,
      downvotes: 0,
      _count: { comments: 9 },
    },
    {
      id: "c",
      createdAt: "2026-04-02T10:00:00.000Z",
      upvotes: 10,
      downvotes: 8,
      _count: { comments: 3 },
    },
  ];

  assert.deepEqual(
    sortCommunityPosts(posts, "latest").map((post) => post.id),
    ["b", "c", "a"]
  );

  assert.deepEqual(
    sortCommunityPosts(posts, "top").map((post) => post.id),
    ["a", "b", "c"]
  );

  assert.deepEqual(
    sortCommunityPosts(posts, "active").map((post) => post.id),
    ["b", "c", "a"]
  );
});
