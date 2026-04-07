import { prisma } from "./lib/prisma";

async function seed() {
  let alias = await prisma.alias.findFirst();
  if (!alias) {
    alias = await prisma.alias.create({
      data: { name: "Campus_Insider" },
    });
  }

  const gossips = [
    { signalType: "confession", title: "Library Crush", content: "To the person in the blue hoodie on Floor 3: You have been studying for 8 hours. Drink some water!" },
    { signalType: "intel_drop", title: "Prof Smith Secret", content: "Prof Smith was seen carrying a box of pizza into the tenure meeting. Bribe?" },
    { signalType: "hot_take", title: "Unit 4 is easy", content: "Everyone says Unit 4 is hard but honestly it is just memorization. Do not believe the hype." },
    { signalType: "confession", title: "I stole the mascot", content: "The small teddy bear from the front desk? It is on my shelf now. It needed a home." },
    { signalType: "intel_drop", title: "Early Exams?", content: "Heard the registrar talking about moving the lab exams up by a week. Prepare now." },
    { signalType: "hot_take", title: "Canteen Samosas", content: "The samosas in the canteen are 95% air and 5% regret. Avoid." },
    { signalType: "confession", title: "Front Row sleeper", content: "I fell asleep in the front row of OOPS class. The prof just walked around me. Legendary." },
    { signalType: "intel_drop", title: "Wifi Hack", content: "If you connect to the GUEST-INTERNAL-5G network, there is no bandwidth limit. Best for downloads." },
    { signalType: "confession", title: "Forgot my name", content: "In the surprise quiz, I forgot my own name for 2 minutes due to panic. Peak efficiency." },
    { signalType: "hot_take", title: "Morning classes", content: "Anything before 10 AM should be illegal and considered a human rights violation." },
    { signalType: "intel_drop", title: "Hidden Beanbag", content: "Behind the old archives in the social science floor, there is a hidden beanbag. Best nap spot." },
    { signalType: "confession", title: "The ChatGPT Lie", content: "I used ChatGPT for my entire ethics report. The irony is not lost on me." },
    { signalType: "hot_take", title: "ExamOracle is life", content: "This app is the only thing keeping me sane. The prediction accuracy is actually scary." },
    { signalType: "intel_drop", title: "Dean sighting", content: "Dean was spotted at the 24/7 cafe at 3 AM looking at memes. One of us!" },
    { signalType: "confession", title: "Late Night Regret", content: "I have 3 exams tomorrow and I have spent the last 2 hours reading this chat. Help me." },
    { signalType: "intel_drop", title: "The Lab 4 Ghost", content: "Midnight in Lab 4... you can hear someone typing but the room is empty. Spooky." },
    { signalType: "hot_take", title: "Mac vs Windows", content: "The computer labs need Macs. Using those 2012 Windows boxes is a struggle." },
    { signalType: "confession", title: "Secret Snack Stash", content: "I hid a bag of chips inside the printer paper tray. Don't tell the librarian." },
    { signalType: "intel_drop", title: "Canceled Lecture?", content: "Rumor has it Prof G is canceling the Friday lecture for a research conference." },
    { signalType: "hot_take", title: "Winter is coming", content: "The campus heating is either 0 or 100. There is no in-between." }
  ];

  console.log("Flooding database with gossips...");
  for (const g of gossips) {
    await prisma.post.create({
      data: {
        ...g,
        aliasId: alias.id,
      },
    });
  }
}

seed()
  .then(() => {
    console.log("Flood complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
