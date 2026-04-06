import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateAlias } from "@/lib/aliasGenerator";

const COMMUNITY_COOKIE_NAME = "community_identity";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

function getCommunitySecret() {
  return process.env.COMMUNITY_IDENTITY_SECRET || "local-community-secret";
}

function hashIdentityToken(token: string) {
  return crypto
    .createHmac("sha256", getCommunitySecret())
    .update(token)
    .digest("hex");
}

function createIdentityToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function getOrCreateAnonymousIdentity() {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(COMMUNITY_COOKIE_NAME)?.value;

  if (existingToken) {
    const existingHash = hashIdentityToken(existingToken);
    const existingAlias = await prisma.alias.findUnique({
      where: { clientIdHash: existingHash },
      select: { id: true, name: true, isBlocked: true },
    });

    if (existingAlias) {
      return {
        alias: existingAlias,
        created: false,
      };
    }
  }

  let aliasName = generateAlias();
  let attempts = 0;

  while (attempts < 5) {
    const clash = await prisma.alias.findUnique({
      where: { name: aliasName },
      select: { id: true },
    });

    if (!clash) break;
    aliasName = generateAlias();
    attempts += 1;
  }

  const token = createIdentityToken();
  const tokenHash = hashIdentityToken(token);

  const alias = await prisma.alias.create({
    data: {
      name: aliasName,
      clientIdHash: tokenHash,
    },
    select: { id: true, name: true, isBlocked: true },
  });

  cookieStore.set(COMMUNITY_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
  });

  return {
    alias,
    created: true,
  };
}
