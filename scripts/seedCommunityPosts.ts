import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Reuses the 26 test accounts created by scripts/seedFirestoreAdmin.ts
// (aupair1-10, family1-10, babysitter1-6 @example.com) as post/comment
// authors, mirroring the exact document shape components/Community.tsx
// writes (see resolveCurrentAuthor / handleCreatePost / handleCreateComment).

const app = initializeApp({
  credential: cert(require("../secrets/cultura-sa.json")),
});
const db = getFirestore();

type Author = {
  uid: string;
  userType: "aupair" | "family";
  profileRef: string | null;
  name: string;
  avatar: string;
  location: string;
};

async function loadAuthors(): Promise<Record<string, Author>> {
  const snap = await db.collection("users").get();
  const authors: Record<string, Author> = {};

  for (const doc of snap.docs) {
    const data = doc.data() as any;
    const email: string | undefined = data.email;
    if (!email || !/^(aupair|family|babysitter)\d+@example\.com$/.test(email)) continue;

    const profileRef: string | undefined = data.profileRef;
    let name = email;
    let avatar = "";
    let location = "";

    if (profileRef) {
      const [collectionName, profileId] = profileRef.split("/");
      const profileSnap = await db.collection(collectionName).doc(profileId).get();
      const p = profileSnap.data() as any;
      if (p) {
        avatar = p.profileImage || "";
        if (collectionName === "familyProfiles") {
          name = p.familyName || name;
          location = [p.location?.city, p.location?.country].filter(Boolean).join(", ");
        } else {
          name = p.name || name;
          location = [p.currentLocation?.city, p.currentLocation?.country].filter(Boolean).join(", ");
        }
      }
    }

    authors[email] = {
      uid: doc.id,
      userType: data.userType,
      profileRef: profileRef || null,
      name,
      avatar,
      location,
    };
  }

  return authors;
}

// ---------------------------------------------------------------------------
// Post seed data
// ---------------------------------------------------------------------------

type CommentSeed = { authorEmail: string; content: string };

type PostSeed = {
  id: string;
  authorEmail: string;
  category: "questions" | "tips" | "experience";
  tags: string[];
  content: string;
  likedByEmails: string[];
  comments: CommentSeed[];
};

const POST_SEEDS: PostSeed[] = [
  {
    id: "seed-post-1",
    authorEmail: "aupair1@example.com",
    category: "questions",
    tags: ["homesick", "first month"],
    content:
      "I'm three weeks into my placement and starting to feel really homesick in the evenings. Has anyone found things that actually helped in the first month? Would love some tips before it gets me down. 💛",
    likedByEmails: ["family1@example.com", "aupair3@example.com", "aupair7@example.com", "babysitter2@example.com"],
    comments: [
      { authorEmail: "aupair2@example.com", content: "So normal! A weekly video call at the same time every week helped me a lot." },
      { authorEmail: "family2@example.com", content: "Our au pair felt this too — we started a small weekend routine together and it really helped her settle in." },
      { authorEmail: "aupair9@example.com", content: "Journaling helped me more than I expected. Sending you strength!" },
    ],
  },
  {
    id: "seed-post-2",
    authorEmail: "family3@example.com",
    category: "tips",
    tags: ["hosting", "communication"],
    content:
      "5 things we wish we'd known before hosting our first au pair: 1) Write the house rules down, don't just say them out loud. 2) Ask about food preferences before they arrive. 3) Plan a proper welcome day, not just a pickup at the airport. 4) Set a weekly check-in time from day one. 5) Give them a real day off — not an 'on call' day off.",
    likedByEmails: ["family4@example.com", "family7@example.com", "aupair5@example.com", "aupair1@example.com", "babysitter4@example.com"],
    comments: [
      { authorEmail: "family5@example.com", content: "The weekly check-in tip is huge. Wish we'd started that from week one instead of month three." },
    ],
  },
  {
    id: "seed-post-3",
    authorEmail: "aupair3@example.com",
    category: "experience",
    tags: ["first month", "language"],
    content:
      "One month into my host family experience in Lyon and I can already follow most dinner conversations in French! It's been humbling and wonderful — the kids are patient with my mistakes and correct me gently. Never expected to make this much progress this fast.",
    likedByEmails: ["aupair1@example.com", "aupair4@example.com", "family2@example.com", "family9@example.com"],
    comments: [
      { authorEmail: "aupair6@example.com", content: "This is so encouraging, thank you for sharing! Also learning through the kids, it really works." },
      { authorEmail: "family3@example.com", content: "Kids really are the best language teachers, no judgment at all 😄" },
    ],
  },
  {
    id: "seed-post-4",
    authorEmail: "family5@example.com",
    category: "questions",
    tags: ["house rules", "communication"],
    content:
      "How do you all bring up house rules with a new au pair without it feeling like a lecture on day one? We want to be clear but also warm and welcoming from the start.",
    likedByEmails: ["family1@example.com", "family8@example.com"],
    comments: [
      { authorEmail: "aupair8@example.com", content: "I appreciated when my family framed it as 'here's how our house works' rather than a list of don'ts — felt much less intimidating." },
    ],
  },
  {
    id: "seed-post-5",
    authorEmail: "aupair5@example.com",
    category: "tips",
    tags: ["packing", "moving abroad"],
    content:
      "Packing list for anyone about to move abroad as an au pair: adapter plugs (bring 2!), one nice outfit for family dinners, photos from home to decorate your room, your favorite spices from home, and a printed copy of important documents just in case. Small comforts make a big difference in week one.",
    likedByEmails: ["aupair2@example.com", "aupair10@example.com", "babysitter1@example.com", "family6@example.com"],
    comments: [
      { authorEmail: "aupair7@example.com", content: "Adding spices from home is such an underrated tip, cooking something familiar helped me so much." },
      { authorEmail: "aupair4@example.com", content: "Wish I'd read this before I left! Forgot an adapter and had to buy one at the airport." },
    ],
  },
  {
    id: "seed-post-6",
    authorEmail: "family7@example.com",
    category: "experience",
    tags: ["first year", "hosting"],
    content:
      "Wrapping up our first year hosting an au pair and honestly it changed our family for the better. Our kids are more curious about the world, dinner conversations are richer, and we've learned so much about patience and communication along the way. Already looking forward to hosting again.",
    likedByEmails: ["family2@example.com", "family9@example.com", "family4@example.com", "aupair9@example.com", "aupair2@example.com"],
    comments: [
      { authorEmail: "family6@example.com", content: "This is exactly the kind of story that convinced us to start hosting too. Thank you for sharing!" },
    ],
  },
  {
    id: "seed-post-7",
    authorEmail: "aupair7@example.com",
    category: "questions",
    tags: ["language", "learning"],
    content:
      "For those of you who've picked up the local language fast — what actually worked? I've been here two months and want to speed things up beyond just 'picking it up from the kids.'",
    likedByEmails: ["aupair3@example.com", "aupair6@example.com"],
    comments: [
      { authorEmail: "aupair10@example.com", content: "Watching kids' cartoons in the local language sounds silly but it really works — simple vocabulary, repeated often." },
      { authorEmail: "aupair5@example.com", content: "A weekly 1:1 language exchange with a local student helped me a ton, and it's usually free." },
    ],
  },
  {
    id: "seed-post-8",
    authorEmail: "family9@example.com",
    category: "tips",
    tags: ["allowance", "time off", "fairness"],
    content:
      "How we handle allowance and time off fairly: pocket money paid on the same date every week (no exceptions), a shared calendar for requested days off, and we always ask before assuming she's free to babysit on her day off. Small things, but they've kept things drama-free for two placements now.",
    likedByEmails: ["family1@example.com", "family3@example.com", "family8@example.com", "aupair8@example.com"],
    comments: [],
  },
  {
    id: "seed-post-9",
    authorEmail: "aupair9@example.com",
    category: "experience",
    tags: ["six months", "confidence"],
    content:
      "Six month update: I went from being nervous about everything (the washing machine, public transport, ordering food) to actually feeling like a local. The kids call me by a little nickname now and I'm going to miss this family so much when my placement ends.",
    likedByEmails: ["aupair1@example.com", "aupair3@example.com", "aupair5@example.com", "family7@example.com", "family5@example.com", "babysitter3@example.com"],
    comments: [
      { authorEmail: "family9@example.com", content: "We felt exactly the same about our au pair leaving — these bonds are so real." },
      { authorEmail: "aupair2@example.com", content: "This made me tear up a little, congrats on 6 months! 🎉" },
    ],
  },
  {
    id: "seed-post-10",
    authorEmail: "aupair2@example.com",
    category: "questions",
    tags: ["staying in touch", "home"],
    content:
      "What apps or routines do you use to stay close with family back home without it eating your whole evening? Trying to find a balance between staying connected and actually being present here.",
    likedByEmails: ["aupair4@example.com", "aupair8@example.com"],
    comments: [
      { authorEmail: "aupair6@example.com", content: "One scheduled call a week instead of constant messaging changed everything for me — less guilt, more presence here." },
    ],
  },
  {
    id: "seed-post-11",
    authorEmail: "family1@example.com",
    category: "tips",
    tags: ["onboarding", "expectations"],
    content:
      "Setting expectations before your au pair arrives made our second placement so much smoother than our first: we now send a short welcome doc with our weekly schedule, a bit about the kids' personalities, meal preferences, and even our wifi password before they even land. Tiny effort, huge difference.",
    likedByEmails: ["family4@example.com", "family6@example.com", "family8@example.com", "aupair1@example.com"],
    comments: [
      { authorEmail: "family2@example.com", content: "Stealing the welcome doc idea, thank you!" },
    ],
  },
  {
    id: "seed-post-12",
    authorEmail: "babysitter2@example.com",
    category: "experience",
    tags: ["babysitting", "juggling families"],
    content:
      "A day in the life of a babysitter juggling three regular families: Monday homework help, Wednesday swim lessons pickup, weekend date-night coverage. It's a lot of calendar Tetris, but getting little updates from parents about how much their kids look forward to 'their' day with me makes it all worth it. 💜",
    likedByEmails: ["family3@example.com", "family5@example.com", "babysitter1@example.com", "babysitter4@example.com", "aupair2@example.com"],
    comments: [
      { authorEmail: "family5@example.com", content: "Our kids talk about babysitting day all week, you're doing an amazing job!" },
    ],
  },
];

async function seedPost(authors: Record<string, Author>, seed: PostSeed) {
  const author = authors[seed.authorEmail];
  if (!author) {
    console.log(`⚠️  Skipping ${seed.id}: author ${seed.authorEmail} not found (run seedFirestoreAdmin.ts first)`);
    return;
  }

  const postRef = db.collection("posts").doc(seed.id);
  await postRef.set({
    authorUid: author.uid,
    authorUserType: author.userType,
    authorProfileRef: author.profileRef,
    authorName: author.name,
    authorAvatar: author.avatar,
    authorLocation: author.location || "Unknown",
    content: seed.content,
    imageUrls: [],
    category: seed.category,
    tags: seed.tags,
    likeCount: seed.likedByEmails.length,
    commentCount: seed.comments.length,
    visibility: "public",
    status: "active",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  for (const likerEmail of seed.likedByEmails) {
    const liker = authors[likerEmail];
    if (!liker) continue;
    await db
      .collection("postLikes")
      .doc(`${seed.id}_${liker.uid}`)
      .set({ postId: seed.id, userId: liker.uid, createdAt: FieldValue.serverTimestamp() });
  }

  for (const [i, comment] of seed.comments.entries()) {
    const commenter = authors[comment.authorEmail];
    if (!commenter) continue;
    await db
      .collection("comments")
      .doc(`${seed.id}-comment-${i + 1}`)
      .set({
        postId: seed.id,
        authorUid: commenter.uid,
        authorUserType: commenter.userType,
        authorProfileRef: commenter.profileRef,
        authorName: commenter.name,
        authorAvatar: commenter.avatar,
        content: comment.content,
        likeCount: 0,
        status: "active",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
  }

  console.log(
    `✅ ${seed.id} by ${author.name} — ${seed.likedByEmails.length} likes, ${seed.comments.length} comments`
  );
}

async function main() {
  console.log("🔥 Loading test accounts...");
  const authors = await loadAuthors();
  console.log(`Found ${Object.keys(authors).length} test accounts to use as post authors.`);

  console.log("🔥 Seeding community posts...");
  for (const seed of POST_SEEDS) {
    await seedPost(authors, seed);
  }
  console.log("🎉 Done seeding community posts!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
