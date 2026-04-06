ALTER TABLE "Alias" ADD COLUMN "clientIdHash" TEXT;

CREATE UNIQUE INDEX "Alias_clientIdHash_key" ON "Alias"("clientIdHash");

CREATE TABLE "PostVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "aliasId" TEXT NOT NULL,
    CONSTRAINT "PostVote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostVote_aliasId_fkey" FOREIGN KEY ("aliasId") REFERENCES "Alias" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PostVote_postId_aliasId_key" ON "PostVote"("postId", "aliasId");
