import Database from "better-sqlite3";
import crypto from "node:crypto";

const db = new Database("dev.db");

const aliases = [
  "Aarav_Coder21",
  "Priya_NightOwl",
  "Rohan_MetroKid",
  "Ishita_MidsemSOS",
  "Kabir_ChaiPowered",
  "Ananya_3AMPrep",
  "Yash_LabEscape",
  "Meera_SilentBench",
  "Dev_ProxyLegend",
  "Sana_LastBench",
  "Arjun_AttendanceRisk",
  "Nisha_Gate3Intel",
];

const subjects = [
  "DBMS",
  "CN",
  "OS",
  "DSA",
  "Mechanics",
  "Signals",
  "Maths 3",
  "COA",
  "OOP",
  "EVS",
];

const librarySpots = [
  "Central Library 2F",
  "Knowledge Block Reading Hall",
  "APJ Library Side Wing",
  "Mechanical Block Quiet Corner",
  "Hostel Study Lounge A",
];

const postTemplates = [
  {
    signalType: "warning",
    title: "DBMS viva is asking normalization from every team",
    content:
      "If your lab slot is tomorrow, revise 1NF to BCNF properly. Senior said sir is not asking definitions only, he is asking why decomposition is lossless.",
    subjectTag: "DBMS",
  },
  {
    signalType: "resource",
    title: "CN unit 4 one-shot notes actually saved me",
    content:
      "I compressed congestion control, leaky bucket, token bucket, and TCP flow control into six pages. Whoever is doing last-night prep should build answers around differences and examples.",
    subjectTag: "CN",
  },
  {
    signalType: "doubt",
    title: "Will OS long answers come more from deadlock or memory management?",
    content:
      "Faculty kept repeating paging, segmentation, and thrashing in class, but previous papers still had deadlock-heavy questions. Trying to decide what deserves more time tonight.",
    subjectTag: "OS",
  },
  {
    signalType: "hot_take",
    title: "This assignment rubric is harsher than the actual exam",
    content:
      "Hot take: the DSA assignment checking is more brutal than what will come in the paper. Half the panic is because the rubric punishes tiny formatting mistakes.",
    subjectTag: "DSA",
    hotTakeScore: 8,
  },
  {
    signalType: "library_live",
    title: "Quiet seats available near the back glass wall",
    content:
      "Central AC is freezing but the zone is almost silent. Good for memorizing formulas. Two charging sockets are free right now.",
    subjectTag: "General",
    locationHint: "Central Library 2F",
    quietLevel: 5,
  },
  {
    signalType: "survival_thread",
    title: "Maths 3 survival thread",
    content:
      "Dump likely derivations, shortcut integrations, matrix trick mnemonics, and which units can safely be skimmed without getting destroyed in the paper.",
    subjectTag: "Maths 3",
  },
  {
    signalType: "intel_drop",
    title: "Possible surprise quiz in Signals lab tomorrow",
    content:
      "Lab assistant told one group to come revised on Laplace transforms and step response plots. Could be nothing, could be pain. Prep at least the standard transforms.",
    subjectTag: "Signals",
    expiresInHours: 18,
    locationHint: "ECE Lab Block",
  },
  {
    signalType: "confession",
    title: "I have understood COA only through memes and fear",
    content:
      "Not joking. Pipelining hazards finally made sense only after I drew the entire thing like hostel mess token flow. If anyone has a cleaner analogy, save me.",
    subjectTag: "COA",
  },
  {
    signalType: "warning",
    title: "Lab file check is rejecting copied aim statements",
    content:
      "Please rewrite your aim and result lines in your own words. Two people got sent back because every page looked copy-pasted from the same PDF.",
    subjectTag: "OOP",
  },
  {
    signalType: "resource",
    title: "Mechanics likely questions grouped by derivation type",
    content:
      "Grouped the unit by direct derivations, explain-with-diagram questions, and force-balance numericals. If you do only one thing, learn the diagram labels properly.",
    subjectTag: "Mechanics",
  },
  {
    signalType: "library_live",
    title: "Hostel lounge is noisy but seats are open",
    content:
      "Not ideal for theory learning, but decent if you are just solving numericals with headphones. Four tables open near the vending machine side.",
    subjectTag: "General",
    locationHint: "Hostel Study Lounge A",
    quietLevel: 2,
  },
  {
    signalType: "intel_drop",
    title: "Attendance cut discussion happening today",
    content:
      "Class rep said some sections are getting a manual review for shortage before hall ticket freeze. If you are borderline, talk to your mentor today itself.",
    subjectTag: "Admin",
    expiresInHours: 10,
    locationHint: "Academic Block",
  },
];

const commentTemplates = [
  "Can confirm this. Our section got asked the same thing.",
  "This is the most useful thread on the board right now.",
  "Senior told us exactly this after the previous internals.",
  "I am cooked but this helps.",
  "Please keep updating if anyone gets fresh intel after lunch.",
  "Adding this to my night-before list.",
  "The quiet meter is accurate. Sat there for two hours.",
  "Hot take is valid, the rubric is genuinely cursed.",
  "Dropping one more likely question: compare segmentation and paging with one real drawback each.",
  "This thread deserves to stay pinned till the exam is over.",
];

function cuid() {
  return `c${crypto.randomBytes(12).toString("hex")}`;
}

function randomHash() {
  return crypto.createHash("sha256").update(crypto.randomBytes(32)).digest("hex");
}

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

db.exec("PRAGMA foreign_keys = ON");

const clearOrder = [
  "DELETE FROM CommentReport",
  "DELETE FROM PostReport",
  "DELETE FROM CommentVote",
  "DELETE FROM PostVote",
  "DELETE FROM Comment",
  "DELETE FROM Post",
  "DELETE FROM Alias",
];

for (const statement of clearOrder) {
  db.prepare(statement).run();
}

const insertAlias = db.prepare(`
  INSERT INTO Alias (id, name, clientIdHash, isBlocked, createdAt)
  VALUES (@id, @name, @clientIdHash, 0, @createdAt)
`);

const insertPost = db.prepare(`
  INSERT INTO Post (
    id, signalType, title, content, subjectTag, locationHint, quietLevel, hotTakeScore,
    expiresAt, isPinned, upvotes, downvotes, reportCount, isHidden, createdAt, aliasId
  ) VALUES (
    @id, @signalType, @title, @content, @subjectTag, @locationHint, @quietLevel, @hotTakeScore,
    @expiresAt, @isPinned, @upvotes, @downvotes, 0, 0, @createdAt, @aliasId
  )
`);

const insertComment = db.prepare(`
  INSERT INTO Comment (
    id, content, upvotes, downvotes, reportCount, isHidden, createdAt, postId, aliasId
  ) VALUES (
    @id, @content, @upvotes, @downvotes, 0, 0, @createdAt, @postId, @aliasId
  )
`);

const insertPostVote = db.prepare(`
  INSERT INTO PostVote (id, value, createdAt, postId, aliasId)
  VALUES (@id, @value, @createdAt, @postId, @aliasId)
`);

const insertCommentVote = db.prepare(`
  INSERT INTO CommentVote (id, value, createdAt, commentId, aliasId)
  VALUES (@id, @value, @createdAt, @commentId, @aliasId)
`);

const aliasRows = aliases.map((name, index) => ({
  id: cuid(),
  name,
  clientIdHash: randomHash(),
  createdAt: new Date(Date.now() - (aliases.length - index) * 3600_000).toISOString(),
}));

for (const alias of aliasRows) {
  insertAlias.run(alias);
}

const postRows = [];

postTemplates.forEach((template, index) => {
  const createdAt = new Date(Date.now() - (index + 1) * 45 * 60_000).toISOString();
  postRows.push({
    id: cuid(),
    signalType: template.signalType,
    title: template.title,
    content: template.content,
    subjectTag: template.subjectTag ?? randomFrom(subjects),
    locationHint: template.locationHint ?? null,
    quietLevel: template.quietLevel ?? null,
    hotTakeScore: template.hotTakeScore ?? null,
    expiresAt:
      template.expiresInHours != null
        ? new Date(Date.now() + template.expiresInHours * 3600_000).toISOString()
        : null,
    isPinned: template.signalType === "survival_thread" ? 1 : 0,
    upvotes: randomInt(6, 32),
    downvotes: randomInt(0, 6),
    createdAt,
    aliasId: aliasRows[index % aliasRows.length].id,
  });
});

for (const post of postRows) {
  insertPost.run(post);
}

const commentRows = [];
for (const post of postRows) {
  const commentCount = randomInt(2, 6);
  for (let i = 0; i < commentCount; i += 1) {
    commentRows.push({
      id: cuid(),
      content: randomFrom(commentTemplates),
      upvotes: randomInt(1, 14),
      downvotes: randomInt(0, 3),
      createdAt: new Date(new Date(post.createdAt).getTime() + (i + 1) * 12 * 60_000).toISOString(),
      postId: post.id,
      aliasId: randomFrom(aliasRows).id,
    });
  }
}

for (const comment of commentRows) {
  insertComment.run(comment);
}

for (const post of postRows) {
  const voters = aliasRows.slice(0, randomInt(3, 7));
  for (const voter of voters) {
    insertPostVote.run({
      id: cuid(),
      value: Math.random() > 0.18 ? 1 : -1,
      createdAt: new Date().toISOString(),
      postId: post.id,
      aliasId: voter.id,
    });
  }
}

for (const comment of commentRows.slice(0, 30)) {
  const voters = aliasRows.slice(0, randomInt(2, 5));
  for (const voter of voters) {
    insertCommentVote.run({
      id: cuid(),
      value: Math.random() > 0.15 ? 1 : -1,
      createdAt: new Date().toISOString(),
      commentId: comment.id,
      aliasId: voter.id,
    });
  }
}

const counts = {
  aliases: db.prepare("SELECT COUNT(*) AS count FROM Alias").get().count,
  posts: db.prepare("SELECT COUNT(*) AS count FROM Post").get().count,
  comments: db.prepare("SELECT COUNT(*) AS count FROM Comment").get().count,
};

console.log(`Seeded community with ${counts.aliases} aliases, ${counts.posts} posts, ${counts.comments} comments.`);
