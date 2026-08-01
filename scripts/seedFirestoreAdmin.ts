import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Firebase Admin SDKの初期化
const app = initializeApp({
  credential: cert(require("../secrets/cultura-sa.json")),
});

const auth = getAuth();
const db = getFirestore();

// ---- Reliable placeholder photos ----
// i.pravatar.cc (based on randomuser.me) never 404s and always returns a real
// human face, unlike the now-defunct source.unsplash.com redirect service.
const avatar = (imgId: number) => `https://i.pravatar.cc/500?img=${imgId}`;

// A small set of Unsplash photo IDs already trusted/used elsewhere in this repo
// (see components/ProfileCompactCard.tsx fallbackImage and the previous
// seed-aupairs.ts), reused here for gallery photos.
const UNSPLASH_IDS = [
  "1494790108377-be9c29b29330",
  "1438761681033-6461ffad8d80",
  "1544005313-94ddf0286df2",
  "1488426862026-3ee34a7d66df",
  "1517841905240-472988babdf9",
  "1524504388940-b1c1722653e1",
  "1500648767791-00dcc994a43e",
  "1506794778202-cad84cf45f1d",
  "1491349174775-aaafddd81942",
  "1487412720507-e7ab37603c6f",
];
const gallery = (...indexes: number[]) =>
  indexes.map(
    (i) =>
      `https://images.unsplash.com/photo-${UNSPLASH_IDS[i % UNSPLASH_IDS.length]}?w=900&h=900&fit=crop&crop=faces&q=80`
  );

const emptyStats = { profileViews: 0, likesReceived: 0, matchCount: 0 };

// ---------------------------------------------------------------------------
// Au Pair seed data
// ---------------------------------------------------------------------------

type AuPairSeed = {
  name: string;
  age: number;
  nationality: string;
  nationalityCode: string;
  flag: string;
  city: string;
  country: string;
  careType: "aupair" | "demipair" | "babysitter";
  aboutMe: string;
  skills: { name: string; emoji: string; level: "beginner" | "intermediate" | "advanced" }[];
  canTeach: string[];
  certifications: string[];
  personalityTraits: string[];
  experienceYears: number;
  experienceDetails: string;
  languagePrimary: { language: string; proficiency: "basic" | "intermediate" | "fluent" | "native" };
  languageSecondary: { language: string; proficiency: "basic" | "intermediate" | "fluent" | "native" }[];
  availableFrom: string;
  duration: string;
  durationMonths: number;
  workingHoursType: "fulltime" | "parttime" | "flexible";
  preferredDays: string[];
  desiredCountries: { country: string; flag: string; cities: string[] }[];
  avatarImg: number;
  galleryIdx: number[];
};

const AUPAIR_SEEDS: AuPairSeed[] = [
  {
    name: "Maria Silva",
    age: 24,
    nationality: "Brazil",
    nationalityCode: "br",
    flag: "🇧🇷",
    city: "São Paulo",
    country: "Brazil",
    careType: "demipair",
    aboutMe:
      "Art student who grew up looking after three younger cousins — I love turning ordinary afternoons into little adventures with drawing, baking, and made-up games.",
    skills: [
      { name: "Art & Crafts", emoji: "🎨", level: "advanced" },
      { name: "Swimming", emoji: "🏊", level: "intermediate" },
      { name: "Cooking", emoji: "🍳", level: "intermediate" },
    ],
    canTeach: ["Portuguese", "Drawing", "Basic swimming"],
    certifications: ["First Aid & CPR (Red Cross)"],
    personalityTraits: ["Creative", "Patient", "Energetic"],
    experienceYears: 3,
    experienceDetails:
      "3 years as a part-time nanny for two families in São Paulo, caring for children aged 2-8.",
    languagePrimary: { language: "Portuguese", proficiency: "native" },
    languageSecondary: [
      { language: "English", proficiency: "fluent" },
      { language: "Japanese", proficiency: "intermediate" },
    ],
    availableFrom: "2026-09-01",
    duration: "9 months",
    durationMonths: 9,
    workingHoursType: "parttime",
    preferredDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    desiredCountries: [
      { country: "Japan", flag: "🇯🇵", cities: ["Tokyo", "Osaka"] },
      { country: "Australia", flag: "🇦🇺", cities: ["Sydney"] },
    ],
    avatarImg: 47,
    galleryIdx: [0, 2],
  },
  {
    name: "Yuki Tanaka",
    age: 22,
    nationality: "Japan",
    nationalityCode: "jp",
    flag: "🇯🇵",
    city: "Yokohama",
    country: "Japan",
    careType: "aupair",
    aboutMe:
      "Former elementary school tutoring assistant. I'm calm, organized, and genuinely happy spending my day building block towers and reading picture books.",
    skills: [
      { name: "Babysitting", emoji: "🧸", level: "advanced" },
      { name: "Tutoring", emoji: "📚", level: "advanced" },
      { name: "Music (piano)", emoji: "🎵", level: "intermediate" },
    ],
    canTeach: ["Japanese", "Piano basics", "Homework support"],
    certifications: ["Child Care Level 2 (Japan)"],
    personalityTraits: ["Reliable", "Gentle", "Organized"],
    experienceYears: 2,
    experienceDetails:
      "2 years assisting at an after-school program for children aged 6-10.",
    languagePrimary: { language: "Japanese", proficiency: "native" },
    languageSecondary: [{ language: "English", proficiency: "intermediate" }],
    availableFrom: "2026-10-01",
    duration: "12 months",
    durationMonths: 12,
    workingHoursType: "fulltime",
    preferredDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    desiredCountries: [
      { country: "Canada", flag: "🇨🇦", cities: ["Toronto", "Vancouver"] },
      { country: "United Kingdom", flag: "🇬🇧", cities: ["London"] },
    ],
    avatarImg: 44,
    galleryIdx: [1, 5],
  },
  {
    name: "Claire Martin",
    age: 26,
    nationality: "France",
    nationalityCode: "fr",
    flag: "🇫🇷",
    city: "Lyon",
    country: "France",
    careType: "aupair",
    aboutMe:
      "Trained preschool assistant with a soft spot for storytelling and bilingual play. I believe the best childcare feels like fun, not a schedule.",
    skills: [
      { name: "Art & Crafts", emoji: "🎨", level: "advanced" },
      { name: "Language Support", emoji: "🗣️", level: "advanced" },
      { name: "Reading", emoji: "📖", level: "advanced" },
    ],
    canTeach: ["French", "Storytelling", "Basic art techniques"],
    certifications: ["CAP Petite Enfance (Early Childhood Diploma)"],
    personalityTraits: ["Warm", "Playful", "Patient"],
    experienceYears: 4,
    experienceDetails:
      "4 years working in a preschool (crèche) with children aged 1-4, plus regular weekend babysitting.",
    languagePrimary: { language: "French", proficiency: "native" },
    languageSecondary: [
      { language: "English", proficiency: "fluent" },
      { language: "Japanese", proficiency: "basic" },
    ],
    availableFrom: "2026-08-15",
    duration: "6 months",
    durationMonths: 6,
    workingHoursType: "fulltime",
    preferredDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    desiredCountries: [
      { country: "Japan", flag: "🇯🇵", cities: ["Tokyo"] },
      { country: "Germany", flag: "🇩🇪", cities: ["Berlin", "Munich"] },
    ],
    avatarImg: 33,
    galleryIdx: [2, 6],
  },
  {
    name: "Sofia García",
    age: 23,
    nationality: "Spain",
    nationalityCode: "es",
    flag: "🇪🇸",
    city: "Valencia",
    country: "Spain",
    careType: "demipair",
    aboutMe:
      "Sports science student and former summer-camp counselor — happiest outdoors, teaching kids to swim, play football, or just run off energy in the park.",
    skills: [
      { name: "Sports", emoji: "⚽", level: "advanced" },
      { name: "Cooking", emoji: "🍳", level: "intermediate" },
      { name: "Babysitting", emoji: "🧸", level: "intermediate" },
    ],
    canTeach: ["Spanish", "Football basics", "Healthy cooking for kids"],
    certifications: ["Lifeguard Certificate"],
    personalityTraits: ["Active", "Cheerful", "Responsible"],
    experienceYears: 3,
    experienceDetails:
      "3 summers as a camp counselor for groups of 15-20 children aged 6-12.",
    languagePrimary: { language: "Spanish", proficiency: "native" },
    languageSecondary: [{ language: "English", proficiency: "fluent" }],
    availableFrom: "2026-09-15",
    duration: "9 months",
    durationMonths: 9,
    workingHoursType: "parttime",
    preferredDays: ["Mon", "Wed", "Fri", "Sat", "Sun"],
    desiredCountries: [
      { country: "United States", flag: "🇺🇸", cities: ["San Diego", "Austin"] },
      { country: "Italy", flag: "🇮🇹", cities: ["Milan"] },
    ],
    avatarImg: 29,
    galleryIdx: [3, 7],
  },
  {
    name: "Emily Johnson",
    age: 25,
    nationality: "Australia",
    nationalityCode: "au",
    flag: "🇦🇺",
    city: "Brisbane",
    country: "Australia",
    careType: "aupair",
    aboutMe:
      "Nursing student with a lifeguard background. I'm safety-minded but never boring — expect obstacle courses, science experiments, and a lot of laughing.",
    skills: [
      { name: "Swimming", emoji: "🏊", level: "advanced" },
      { name: "Outdoor Play", emoji: "🌿", level: "advanced" },
      { name: "First Aid", emoji: "🩹", level: "advanced" },
    ],
    canTeach: ["English", "Swimming", "Basic first aid awareness"],
    certifications: ["Pediatric First Aid", "Working with Children Check"],
    personalityTraits: ["Confident", "Caring", "Adventurous"],
    experienceYears: 5,
    experienceDetails:
      "5 years of babysitting and 1 year as a part-time swim instructor for children aged 3-9.",
    languagePrimary: { language: "English", proficiency: "native" },
    languageSecondary: [{ language: "Japanese", proficiency: "basic" }],
    availableFrom: "2026-11-01",
    duration: "12 months",
    durationMonths: 12,
    workingHoursType: "fulltime",
    preferredDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    desiredCountries: [
      { country: "Japan", flag: "🇯🇵", cities: ["Osaka", "Kyoto"] },
      { country: "France", flag: "🇫🇷", cities: ["Paris"] },
    ],
    avatarImg: 25,
    galleryIdx: [4, 8],
  },
  {
    name: "Hannah Müller",
    age: 27,
    nationality: "Germany",
    nationalityCode: "de",
    flag: "🇩🇪",
    city: "Freiburg",
    country: "Germany",
    careType: "demipair",
    aboutMe:
      "Music teacher taking a career break to see the world. I bring a small keyboard wherever I go and love turning practice time into playtime.",
    skills: [
      { name: "Tutoring", emoji: "📚", level: "advanced" },
      { name: "Music", emoji: "🎵", level: "advanced" },
      { name: "House Support", emoji: "🏠", level: "intermediate" },
    ],
    canTeach: ["German", "Piano", "Violin basics"],
    certifications: ["Bachelor of Music Education"],
    personalityTraits: ["Patient", "Disciplined", "Warm"],
    experienceYears: 6,
    experienceDetails:
      "6 years teaching music to children aged 5-15, plus regular after-school babysitting.",
    languagePrimary: { language: "German", proficiency: "native" },
    languageSecondary: [{ language: "English", proficiency: "fluent" }],
    availableFrom: "2026-09-01",
    duration: "6 months",
    durationMonths: 6,
    workingHoursType: "parttime",
    preferredDays: ["Tue", "Wed", "Thu", "Fri"],
    desiredCountries: [
      { country: "Spain", flag: "🇪🇸", cities: ["Barcelona"] },
      { country: "Japan", flag: "🇯🇵", cities: ["Tokyo"] },
    ],
    avatarImg: 36,
    galleryIdx: [5, 9],
  },
  {
    name: "Ana Santos",
    age: 28,
    nationality: "Philippines",
    nationalityCode: "ph",
    flag: "🇵🇭",
    city: "Cebu City",
    country: "Philippines",
    careType: "aupair",
    aboutMe:
      "Early childhood education graduate with almost a decade of hands-on experience. Families tell me I bring calm, structure, and a lot of warmth to busy households.",
    skills: [
      { name: "Babysitting", emoji: "🧸", level: "advanced" },
      { name: "Cooking", emoji: "🍳", level: "advanced" },
      { name: "Homework Support", emoji: "✏️", level: "advanced" },
    ],
    canTeach: ["English", "Tagalog", "Basic cooking"],
    certifications: ["Early Childhood Education Diploma", "First Aid & CPR"],
    personalityTraits: ["Nurturing", "Dependable", "Cheerful"],
    experienceYears: 8,
    experienceDetails:
      "8 years as a live-in nanny for families in Cebu and Manila, caring for infants through school-age children.",
    languagePrimary: { language: "English", proficiency: "fluent" },
    languageSecondary: [{ language: "Tagalog", proficiency: "native" }],
    availableFrom: "2026-08-01",
    duration: "12 months",
    durationMonths: 12,
    workingHoursType: "fulltime",
    preferredDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    desiredCountries: [
      { country: "Canada", flag: "🇨🇦", cities: ["Calgary"] },
      { country: "United Kingdom", flag: "🇬🇧", cities: ["Manchester"] },
    ],
    avatarImg: 45,
    galleryIdx: [6, 0],
  },
  {
    name: "Giulia Rossi",
    age: 24,
    nationality: "Italy",
    nationalityCode: "it",
    flag: "🇮🇹",
    city: "Bologna",
    country: "Italy",
    careType: "demipair",
    aboutMe:
      "Culinary school graduate who believes the kitchen is the best classroom. I love cooking alongside kids and turning story time into a nightly ritual.",
    skills: [
      { name: "Art & Crafts", emoji: "🎨", level: "intermediate" },
      { name: "Cooking", emoji: "🍳", level: "advanced" },
      { name: "Storytelling", emoji: "📖", level: "advanced" },
    ],
    canTeach: ["Italian", "Baking", "Drawing"],
    certifications: ["Culinary Arts Diploma"],
    personalityTraits: ["Warm", "Expressive", "Easygoing"],
    experienceYears: 3,
    experienceDetails:
      "3 years of weekend and summer babysitting for family friends' children aged 4-10.",
    languagePrimary: { language: "Italian", proficiency: "native" },
    languageSecondary: [{ language: "English", proficiency: "fluent" }],
    availableFrom: "2026-09-10",
    duration: "9 months",
    durationMonths: 9,
    workingHoursType: "parttime",
    preferredDays: ["Mon", "Tue", "Thu", "Fri"],
    desiredCountries: [
      { country: "United States", flag: "🇺🇸", cities: ["Boston"] },
      { country: "Australia", flag: "🇦🇺", cities: ["Melbourne"] },
    ],
    avatarImg: 26,
    galleryIdx: [7, 1],
  },
  {
    name: "Mei Chen",
    age: 21,
    nationality: "Taiwan",
    nationalityCode: "tw",
    flag: "🇹🇼",
    city: "Taipei",
    country: "Taiwan",
    careType: "aupair",
    aboutMe:
      "University language student who has tutored bilingual kids since high school. I love mixing Mandarin, English, and a little Japanese into everyday play.",
    skills: [
      { name: "Language Support", emoji: "🗣️", level: "advanced" },
      { name: "Tutoring", emoji: "📚", level: "intermediate" },
      { name: "Music", emoji: "🎵", level: "intermediate" },
    ],
    canTeach: ["Mandarin", "English", "Basic Japanese"],
    certifications: ["TESOL Certificate"],
    personalityTraits: ["Curious", "Patient", "Adaptable"],
    experienceYears: 2,
    experienceDetails:
      "2 years tutoring bilingual children aged 5-12 in Mandarin and English.",
    languagePrimary: { language: "Mandarin", proficiency: "native" },
    languageSecondary: [
      { language: "English", proficiency: "fluent" },
      { language: "Japanese", proficiency: "intermediate" },
    ],
    availableFrom: "2026-12-01",
    duration: "6 months",
    durationMonths: 6,
    workingHoursType: "flexible",
    preferredDays: ["Mon", "Wed", "Fri", "Sat"],
    desiredCountries: [
      { country: "Japan", flag: "🇯🇵", cities: ["Fukuoka", "Tokyo"] },
      { country: "Canada", flag: "🇨🇦", cities: ["Toronto"] },
    ],
    avatarImg: 43,
    galleryIdx: [8, 2],
  },
  {
    name: "Olivia Wilson",
    age: 22,
    nationality: "New Zealand",
    nationalityCode: "nz",
    flag: "🇳🇿",
    city: "Wellington",
    country: "New Zealand",
    careType: "demipair",
    aboutMe:
      "Outdoorsy and easygoing — grew up on a farm looking after younger siblings. I'm happiest hiking, kicking a ball around, or building a backyard cubby house.",
    skills: [
      { name: "Sports", emoji: "⚽", level: "advanced" },
      { name: "Swimming", emoji: "🏊", level: "intermediate" },
      { name: "Outdoor Play", emoji: "🌿", level: "advanced" },
    ],
    canTeach: ["English", "Basic sports coaching"],
    certifications: ["First Aid Certificate"],
    personalityTraits: ["Easygoing", "Active", "Trustworthy"],
    experienceYears: 4,
    experienceDetails:
      "4 years helping raise three younger siblings plus casual babysitting for neighbors.",
    languagePrimary: { language: "English", proficiency: "native" },
    languageSecondary: [{ language: "Japanese", proficiency: "basic" }],
    availableFrom: "2026-10-15",
    duration: "3 months",
    durationMonths: 3,
    workingHoursType: "fulltime",
    preferredDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    desiredCountries: [
      { country: "Japan", flag: "🇯🇵", cities: ["Sapporo"] },
      { country: "Germany", flag: "🇩🇪", cities: ["Hamburg"] },
    ],
    avatarImg: 20,
    galleryIdx: [9, 3],
  },
];

// ---------------------------------------------------------------------------
// Family seed data
// ---------------------------------------------------------------------------

type FamilySeed = {
  familyName: string;
  country: string;
  nationalityCode: string;
  flag: string;
  city: string;
  adults: number;
  children: { age: number; gender: "boy" | "girl"; emoji: string }[];
  pets: string[];
  aboutUs: string;
  lookingForType: "aupair" | "demipair" | "babysitter";
  // Short tags (drawn from the same vocabulary as SearchFilters.tsx's skill
  // list) — this is what Home.tsx's card-grid mapper `.map()`s over, so it
  // MUST be an array, not a free-text sentence.
  lookingForTags: string[];
  // Longer, human-readable version of the same thing, folded into aboutUs.
  lookingForNote: string;
  availabilityLabel: string;
  accommodationType: string;
  hasPrivateBathroom: boolean;
  accommodationDescription: string;
  meals: string;
  allowanceAmount: number;
  allowanceCurrency: string;
  allowanceFrequency: "weekly" | "monthly";
  benefits: string[];
  startDate: string;
  duration: string;
  durationMonths: number;
  workingHoursType: "fulltime" | "parttime" | "flexible";
  preferredDays: string[];
  hoursPerWeek: number;
  languagePrimary: string;
  languageSecondary: string[];
  avatarImg: number;
  galleryIdx: number[];
};

const FAMILY_SEEDS: FamilySeed[] = [
  {
    familyName: "The Andersson Family",
    country: "Sweden",
    nationalityCode: "se",
    flag: "🇸🇪",
    city: "Stockholm",
    adults: 2,
    children: [
      { age: 4, gender: "girl", emoji: "👧" },
      { age: 2, gender: "boy", emoji: "👦" },
    ],
    pets: ["Cat"],
    aboutUs:
      "We're a relaxed, outdoorsy family near a big park. Both parents work hybrid schedules, so we're looking for someone warm and independent to help with school runs and afternoon play.",
    lookingForType: "aupair",
    lookingForTags: ["Childcare", "Sports", "Swimming"],
    lookingForNote: "A patient, active au pair who enjoys outdoor play and light Swedish practice with the kids.",
    availabilityLabel: "Within 1 month",
    accommodationType: "private_room",
    hasPrivateBathroom: true,
    accommodationDescription: "Bright private room with a desk, on the top floor of our house, own bathroom.",
    meals: "all_meals",
    allowanceAmount: 4500,
    allowanceCurrency: "SEK",
    allowanceFrequency: "monthly",
    benefits: ["Public transport pass", "Gym membership", "Weekends off"],
    startDate: "2026-09-01",
    duration: "12 months",
    durationMonths: 12,
    workingHoursType: "fulltime",
    preferredDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    hoursPerWeek: 25,
    languagePrimary: "Swedish",
    languageSecondary: ["English"],
    avatarImg: 12,
    galleryIdx: [0, 4],
  },
  {
    familyName: "The Dubois Family",
    country: "France",
    nationalityCode: "fr",
    flag: "🇫🇷",
    city: "Lyon",
    adults: 2,
    children: [{ age: 6, gender: "boy", emoji: "👦" }],
    pets: [],
    aboutUs:
      "A quiet household in the city center with one energetic six-year-old who loves football and drawing. We'd love an au pair who can help with homework and speak a little English with him.",
    lookingForType: "aupair",
    lookingForTags: ["Childcare", "Tutoring"],
    lookingForNote: "Someone reliable and playful who can help with after-school pickup and homework.",
    availabilityLabel: "Within 3 months",
    accommodationType: "private_room",
    hasPrivateBathroom: false,
    accommodationDescription: "Cozy private room, shared family bathroom, in a central apartment near the metro.",
    meals: "some_meals",
    allowanceAmount: 400,
    allowanceCurrency: "EUR",
    allowanceFrequency: "monthly",
    benefits: ["Public transport pass", "French lessons"],
    startDate: "2026-09-15",
    duration: "9 months",
    durationMonths: 9,
    workingHoursType: "parttime",
    preferredDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    hoursPerWeek: 20,
    languagePrimary: "French",
    languageSecondary: ["English"],
    avatarImg: 15,
    galleryIdx: [1, 5],
  },
  {
    familyName: "The Nakamura Family",
    country: "Japan",
    nationalityCode: "jp",
    flag: "🇯🇵",
    city: "Tokyo",
    adults: 2,
    children: [
      { age: 3, gender: "girl", emoji: "👧" },
      { age: 1, gender: "girl", emoji: "👧" },
    ],
    pets: ["Dog"],
    aboutUs:
      "Busy working parents with two toddlers and a very friendly dog. We're hoping for someone patient and hands-on who can bring some English into daily life.",
    lookingForType: "demipair",
    lookingForTags: ["Childcare", "Babysitting"],
    lookingForNote: "A gentle, hands-on demi pair comfortable with toddlers and happy to speak English during play.",
    availabilityLabel: "Available now",
    accommodationType: "private_room",
    hasPrivateBathroom: true,
    accommodationDescription: "Modern private room with ensuite in our house near Setagaya, quiet residential area.",
    meals: "all_meals",
    allowanceAmount: 80000,
    allowanceCurrency: "JPY",
    allowanceFrequency: "monthly",
    benefits: ["Commuter pass", "Japanese lessons", "Flexible days off"],
    startDate: "2026-08-01",
    duration: "12 months",
    durationMonths: 12,
    workingHoursType: "parttime",
    preferredDays: ["Mon", "Tue", "Wed", "Thu"],
    hoursPerWeek: 18,
    languagePrimary: "Japanese",
    languageSecondary: ["English"],
    avatarImg: 8,
    galleryIdx: [2, 6],
  },
  {
    familyName: "The Reynolds Family",
    country: "United States",
    nationalityCode: "us",
    flag: "🇺🇸",
    city: "Austin",
    adults: 2,
    children: [
      { age: 8, gender: "boy", emoji: "👦" },
      { age: 5, gender: "boy", emoji: "👦" },
    ],
    pets: ["Dog", "Fish"],
    aboutUs:
      "Sporty family of four — our boys are into soccer, swimming, and building elaborate Lego cities. We're looking for someone active who can keep up with them.",
    lookingForType: "aupair",
    lookingForTags: ["Childcare", "Sports", "Driving"],
    lookingForNote: "An energetic, sporty au pair for after-school activities and summer break supervision.",
    availabilityLabel: "Available now",
    accommodationType: "private_room",
    hasPrivateBathroom: true,
    accommodationDescription: "Large private room and bathroom above the garage, own entrance.",
    meals: "some_meals",
    allowanceAmount: 500,
    allowanceCurrency: "USD",
    allowanceFrequency: "weekly",
    benefits: ["Car for personal use", "Gym membership", "Paid vacation days"],
    startDate: "2026-08-20",
    duration: "12 months",
    durationMonths: 12,
    workingHoursType: "fulltime",
    preferredDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    hoursPerWeek: 30,
    languagePrimary: "English",
    languageSecondary: ["Spanish"],
    avatarImg: 18,
    galleryIdx: [3, 7],
  },
  {
    familyName: "The Fischer Family",
    country: "Germany",
    nationalityCode: "de",
    flag: "🇩🇪",
    city: "Munich",
    adults: 2,
    children: [{ age: 7, gender: "girl", emoji: "👧" }],
    pets: ["Cat"],
    aboutUs:
      "Music-loving family with one curious seven-year-old who's learning violin. We'd love an au pair who enjoys creative activities as much as she does.",
    lookingForType: "aupair",
    lookingForTags: ["Childcare", "Music", "Tutoring"],
    lookingForNote: "A creative, musical au pair to support homework, practice time, and weekend outings.",
    availabilityLabel: "Within 1 month",
    accommodationType: "private_room",
    hasPrivateBathroom: false,
    accommodationDescription: "Sunny private room, shared bathroom, in a quiet residential apartment building.",
    meals: "all_meals",
    allowanceAmount: 320,
    allowanceCurrency: "EUR",
    allowanceFrequency: "monthly",
    benefits: ["German lessons", "Bicycle provided", "Museum passes"],
    startDate: "2026-09-01",
    duration: "6 months",
    durationMonths: 6,
    workingHoursType: "parttime",
    preferredDays: ["Tue", "Wed", "Thu", "Fri"],
    hoursPerWeek: 15,
    languagePrimary: "German",
    languageSecondary: ["English"],
    avatarImg: 22,
    galleryIdx: [4, 8],
  },
  {
    familyName: "The Whitfield Family",
    country: "United Kingdom",
    nationalityCode: "gb",
    flag: "🇬🇧",
    city: "Manchester",
    adults: 2,
    children: [
      { age: 10, gender: "girl", emoji: "👧" },
      { age: 6, gender: "boy", emoji: "👦" },
    ],
    pets: [],
    aboutUs:
      "A warm, easygoing household with two school-age kids who love books and baking. Looking for someone dependable who can manage the after-school routine.",
    lookingForType: "aupair",
    lookingForTags: ["Childcare", "Cooking", "Tutoring"],
    lookingForNote: "A reliable, home-loving au pair to help with school pickup, homework, and cooking together.",
    availabilityLabel: "Within 1 month",
    accommodationType: "private_room",
    hasPrivateBathroom: true,
    accommodationDescription: "Comfortable private room with ensuite bathroom, quiet suburban street.",
    meals: "some_meals",
    allowanceAmount: 110,
    allowanceCurrency: "GBP",
    allowanceFrequency: "weekly",
    benefits: ["Bus pass", "Weekends off", "English course support"],
    startDate: "2026-09-01",
    duration: "9 months",
    durationMonths: 9,
    workingHoursType: "parttime",
    preferredDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    hoursPerWeek: 22,
    languagePrimary: "English",
    languageSecondary: [],
    avatarImg: 32,
    galleryIdx: [5, 9],
  },
  {
    familyName: "The Rossi-Bianchi Family",
    country: "Italy",
    nationalityCode: "it",
    flag: "🇮🇹",
    city: "Milan",
    adults: 2,
    children: [{ age: 2, gender: "boy", emoji: "👦" }],
    pets: ["Dog"],
    aboutUs:
      "First-time parents with a very active toddler and a big friendly dog. Looking for someone gentle, patient, and comfortable with early-childhood routines.",
    lookingForType: "demipair",
    lookingForTags: ["Childcare", "Babysitting"],
    lookingForNote: "A calm, patient demi pair experienced with toddlers.",
    availabilityLabel: "Within 3 months",
    accommodationType: "private_room",
    hasPrivateBathroom: false,
    accommodationDescription: "Private room in a central Milan apartment, shared bathroom with family.",
    meals: "all_meals",
    allowanceAmount: 350,
    allowanceCurrency: "EUR",
    allowanceFrequency: "monthly",
    benefits: ["Italian lessons", "Metro pass"],
    startDate: "2026-10-01",
    duration: "9 months",
    durationMonths: 9,
    workingHoursType: "parttime",
    preferredDays: ["Mon", "Wed", "Fri"],
    hoursPerWeek: 16,
    languagePrimary: "Italian",
    languageSecondary: ["English"],
    avatarImg: 38,
    galleryIdx: [6, 0],
  },
  {
    familyName: "The van der Berg Family",
    country: "Netherlands",
    nationalityCode: "nl",
    flag: "🇳🇱",
    city: "Amsterdam",
    adults: 2,
    children: [
      { age: 5, gender: "boy", emoji: "👦" },
      { age: 3, gender: "girl", emoji: "👧" },
    ],
    pets: ["Rabbit"],
    aboutUs:
      "A bike-loving family of four near a canal-side park. We value independence and creativity and want someone who'll bring their own hobbies into playtime.",
    lookingForType: "aupair",
    lookingForTags: ["Childcare", "Arts & crafts", "Driving"],
    lookingForNote: "An independent, creative au pair comfortable biking the kids to and from school.",
    availabilityLabel: "Available now",
    accommodationType: "private_room",
    hasPrivateBathroom: true,
    accommodationDescription: "Private attic room with ensuite bathroom and a small reading nook.",
    meals: "some_meals",
    allowanceAmount: 450,
    allowanceCurrency: "EUR",
    allowanceFrequency: "monthly",
    benefits: ["Bicycle provided", "Dutch lessons", "Flexible schedule"],
    startDate: "2026-08-15",
    duration: "12 months",
    durationMonths: 12,
    workingHoursType: "fulltime",
    preferredDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    hoursPerWeek: 28,
    languagePrimary: "Dutch",
    languageSecondary: ["English"],
    avatarImg: 41,
    galleryIdx: [7, 1],
  },
  {
    familyName: "The Tan Family",
    country: "Singapore",
    nationalityCode: "sg",
    flag: "🇸🇬",
    city: "Singapore",
    adults: 2,
    children: [{ age: 9, gender: "girl", emoji: "👧" }],
    pets: [],
    aboutUs:
      "Both parents work in tech with flexible-but-full schedules. Our daughter is bright, independent, and loves reading — we'd love someone who can support her English and homework routine.",
    lookingForType: "aupair",
    lookingForTags: ["Childcare", "Tutoring"],
    lookingForNote: "An academically-minded au pair who enjoys reading and homework support.",
    availabilityLabel: "Within 1 month",
    accommodationType: "private_room",
    hasPrivateBathroom: true,
    accommodationDescription: "Private room with ensuite in a modern condo, access to pool and gym facilities.",
    meals: "all_meals",
    allowanceAmount: 700,
    allowanceCurrency: "SGD",
    allowanceFrequency: "monthly",
    benefits: ["Condo pool & gym access", "Grab credit", "Weekends off"],
    startDate: "2026-09-01",
    duration: "12 months",
    durationMonths: 12,
    workingHoursType: "parttime",
    preferredDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    hoursPerWeek: 20,
    languagePrimary: "English",
    languageSecondary: ["Mandarin"],
    avatarImg: 5,
    galleryIdx: [8, 2],
  },
  {
    familyName: "The Costa Family",
    country: "Australia",
    nationalityCode: "au",
    flag: "🇦🇺",
    city: "Melbourne",
    adults: 2,
    children: [
      { age: 4, gender: "boy", emoji: "👦" },
      { age: 2, gender: "boy", emoji: "👦" },
    ],
    pets: ["Cat", "Dog"],
    aboutUs:
      "A cheerful, busy household with two little boys, a cat, and a dog. We spend a lot of time outdoors and love a demi pair who's up for muddy adventures.",
    lookingForType: "demipair",
    lookingForTags: ["Childcare", "Pet care", "Sports"],
    lookingForNote: "An active, animal-friendly demi pair who enjoys outdoor play with young boys.",
    availabilityLabel: "Within 3 months",
    accommodationType: "private_room",
    hasPrivateBathroom: false,
    accommodationDescription: "Private room in a family home with a big backyard, shared bathroom.",
    meals: "some_meals",
    allowanceAmount: 280,
    allowanceCurrency: "AUD",
    allowanceFrequency: "weekly",
    benefits: ["Car for errands", "Beach nearby", "Weekends off"],
    startDate: "2026-10-15",
    duration: "6 months",
    durationMonths: 6,
    workingHoursType: "parttime",
    preferredDays: ["Mon", "Tue", "Thu", "Fri"],
    hoursPerWeek: 18,
    languagePrimary: "English",
    languageSecondary: [],
    avatarImg: 51,
    galleryIdx: [9, 3],
  },
];

// ---------------------------------------------------------------------------
// Babysitter seed data
// ---------------------------------------------------------------------------
// Babysitters aren't a separate Firestore collection — components/ProfileLayout.tsx
// (`isBabysitter = isAuPair && profile?.workType === "babysitter"`) and
// components/Home.tsx's card mapper (`type: p?.workType || p?.careType || p?.type`)
// both key off a `workType` field on an `auPairProfiles` document, so babysitter
// profiles live in the same collection as regular au pairs.

type BabysitterSeed = {
  name: string;
  age: number;
  nationality: string;
  nationalityCode: string;
  flag: string;
  city: string;
  country: string;
  aboutMe: string;
  skills: { name: string; emoji: string; level: "beginner" | "intermediate" | "advanced" }[];
  certifications: string[];
  personalityTraits: string[];
  experienceYears: number;
  experienceDetails: string;
  languagePrimary: { language: string; proficiency: "basic" | "intermediate" | "fluent" | "native" };
  languageSecondary: { language: string; proficiency: "basic" | "intermediate" | "fluent" | "native" }[];
  hourlyRate: number;
  maxTravelDistance: number;
  availableFrom: string;
  workingHoursType: "fulltime" | "parttime" | "flexible";
  preferredDays: string[];
  avatarImg: number;
  galleryIdx: number[];
};

const BABYSITTER_SEEDS: BabysitterSeed[] = [
  {
    name: "Chloe Bennett",
    age: 21,
    nationality: "United States",
    nationalityCode: "us",
    flag: "🇺🇸",
    city: "Austin",
    country: "United States",
    aboutMe:
      "Local college student studying early childhood development. I babysit most evenings and weekends and always come with a backpack of craft supplies.",
    skills: [
      { name: "Arts & Crafts", emoji: "🎨", level: "advanced" },
      { name: "Homework Support", emoji: "✏️", level: "intermediate" },
    ],
    certifications: ["CPR & First Aid"],
    personalityTraits: ["Playful", "Reliable", "Punctual"],
    experienceYears: 3,
    experienceDetails: "3 years of regular evening and weekend babysitting for two neighborhood families.",
    languagePrimary: { language: "English", proficiency: "native" },
    languageSecondary: [{ language: "Spanish", proficiency: "basic" }],
    hourlyRate: 22,
    maxTravelDistance: 15,
    availableFrom: "2026-08-01",
    workingHoursType: "flexible",
    preferredDays: ["Tue", "Thu", "Fri", "Sat"],
    avatarImg: 49,
    galleryIdx: [0, 3],
  },
  {
    name: "Noah Kim",
    age: 24,
    nationality: "South Korea",
    nationalityCode: "kr",
    flag: "🇰🇷",
    city: "Seoul",
    country: "South Korea",
    aboutMe:
      "Former summer-camp coordinator who loves board games and building blanket forts. Comfortable with kids of all ages, including infants.",
    skills: [
      { name: "Babysitting", emoji: "🧸", level: "advanced" },
      { name: "Sports", emoji: "⚽", level: "intermediate" },
    ],
    certifications: ["Pediatric First Aid"],
    personalityTraits: ["Energetic", "Patient", "Trustworthy"],
    experienceYears: 5,
    experienceDetails: "5 years babysitting for families in Seoul, including overnight and short-notice bookings.",
    languagePrimary: { language: "Korean", proficiency: "native" },
    languageSecondary: [{ language: "English", proficiency: "fluent" }],
    hourlyRate: 18000,
    maxTravelDistance: 10,
    availableFrom: "2026-08-15",
    workingHoursType: "parttime",
    preferredDays: ["Mon", "Wed", "Fri", "Sat", "Sun"],
    avatarImg: 14,
    galleryIdx: [1, 4],
  },
  {
    name: "Ella Thompson",
    age: 26,
    nationality: "United Kingdom",
    nationalityCode: "gb",
    flag: "🇬🇧",
    city: "Manchester",
    country: "United Kingdom",
    aboutMe:
      "Qualified nursery assistant offering after-school and weekend care. I bring structure, snacks, and a lot of patience to every booking.",
    skills: [
      { name: "Cooking", emoji: "🍳", level: "intermediate" },
      { name: "Tutoring", emoji: "📚", level: "advanced" },
    ],
    certifications: ["Level 2 Certificate in Children's Care", "DBS Checked"],
    personalityTraits: ["Nurturing", "Organized", "Calm"],
    experienceYears: 6,
    experienceDetails: "6 years as a nursery assistant plus regular private babysitting for children aged 1-10.",
    languagePrimary: { language: "English", proficiency: "native" },
    languageSecondary: [],
    hourlyRate: 14,
    maxTravelDistance: 12,
    availableFrom: "2026-08-01",
    workingHoursType: "parttime",
    preferredDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    avatarImg: 31,
    galleryIdx: [2, 5],
  },
  {
    name: "Lucas Meyer",
    age: 23,
    nationality: "Germany",
    nationalityCode: "de",
    flag: "🇩🇪",
    city: "Munich",
    country: "Germany",
    aboutMe:
      "Sports science student who babysits on the side — expect backyard games, bike rides, and homework help in equal measure.",
    skills: [
      { name: "Sports", emoji: "⚽", level: "advanced" },
      { name: "Homework Support", emoji: "✏️", level: "intermediate" },
    ],
    certifications: ["First Aid Certificate"],
    personalityTraits: ["Active", "Friendly", "Dependable"],
    experienceYears: 2,
    experienceDetails: "2 years of weekend babysitting for family friends' children aged 5-11.",
    languagePrimary: { language: "German", proficiency: "native" },
    languageSecondary: [{ language: "English", proficiency: "fluent" }],
    hourlyRate: 15,
    maxTravelDistance: 8,
    availableFrom: "2026-09-01",
    workingHoursType: "flexible",
    preferredDays: ["Sat", "Sun"],
    avatarImg: 52,
    galleryIdx: [3, 6],
  },
  {
    name: "Isabella Moretti",
    age: 25,
    nationality: "Italy",
    nationalityCode: "it",
    flag: "🇮🇹",
    city: "Milan",
    country: "Italy",
    aboutMe:
      "Music school graduate who loves turning babysitting evenings into mini piano lessons and story time.",
    skills: [
      { name: "Music", emoji: "🎵", level: "advanced" },
      { name: "Arts & Crafts", emoji: "🎨", level: "intermediate" },
    ],
    certifications: ["First Aid & CPR"],
    personalityTraits: ["Creative", "Warm", "Patient"],
    experienceYears: 4,
    experienceDetails: "4 years of evening babysitting for two families, including infants and toddlers.",
    languagePrimary: { language: "Italian", proficiency: "native" },
    languageSecondary: [{ language: "English", proficiency: "fluent" }],
    hourlyRate: 13,
    maxTravelDistance: 10,
    availableFrom: "2026-08-10",
    workingHoursType: "flexible",
    preferredDays: ["Mon", "Wed", "Fri"],
    avatarImg: 9,
    galleryIdx: [4, 7],
  },
  {
    name: "Ryan O'Connor",
    age: 27,
    nationality: "Australia",
    nationalityCode: "au",
    flag: "🇦🇺",
    city: "Melbourne",
    country: "Australia",
    aboutMe:
      "Primary school teaching assistant who babysits on weekends. Big fan of outdoor play, science experiments, and calm bedtime routines.",
    skills: [
      { name: "Tutoring", emoji: "📚", level: "advanced" },
      { name: "Outdoor Play", emoji: "🌿", level: "advanced" },
    ],
    certifications: ["Working with Children Check", "First Aid"],
    personalityTraits: ["Responsible", "Fun", "Patient"],
    experienceYears: 5,
    experienceDetails: "5 years as a teaching assistant plus weekend babysitting for children aged 4-12.",
    languagePrimary: { language: "English", proficiency: "native" },
    languageSecondary: [],
    hourlyRate: 25,
    maxTravelDistance: 20,
    availableFrom: "2026-08-01",
    workingHoursType: "parttime",
    preferredDays: ["Sat", "Sun"],
    avatarImg: 54,
    galleryIdx: [5, 8],
  },
];

// ---------------------------------------------------------------------------
// Document factories
// ---------------------------------------------------------------------------

function makeAuPairProfile(seed: AuPairSeed) {
  return {
    name: seed.name,
    age: seed.age,
    nationality: seed.nationality,
    nationalityCode: seed.nationalityCode,
    flag: seed.flag,
    currentLocation: { city: seed.city, country: seed.country },
    careType: seed.careType,
    type: seed.careType,
    aboutMe: seed.aboutMe,
    skills: seed.skills,
    canTeach: seed.canTeach,
    certifications: seed.certifications,
    personalityTraits: seed.personalityTraits,
    experienceYears: seed.experienceYears,
    childcareExperience: true,
    experienceDetails: seed.experienceDetails,
    experience: [{ type: "childcare", description: seed.experienceDetails }],
    languages: {
      primary: seed.languagePrimary,
      secondary: seed.languageSecondary,
    },
    availability: {
      status: "available",
      availableFrom: seed.availableFrom,
      duration: seed.duration,
      workingHoursType: seed.workingHoursType,
      preferredDays: seed.preferredDays,
    },
    // Flat convenience fields read directly by the Home.tsx card-grid mapper
    // (components/Home.tsx), in addition to the nested `availability` object
    // above, which the profile detail view (components/AuPairProfile.tsx) reads.
    durationMonths: seed.durationMonths,
    workDays: seed.preferredDays,
    desiredCountries: seed.desiredCountries,
    profileImage: avatar(seed.avatarImg),
    galleryImages: gallery(...seed.galleryIdx),
    stats: emptyStats,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

function makeFamilyProfile(seed: FamilySeed) {
  return {
    familyName: seed.familyName,
    location: { country: seed.country, flag: seed.flag, city: seed.city },
    familyMembers: {
      adults: seed.adults,
      children: seed.children,
      pets: seed.pets,
    },
    // aboutUs carries both the family's own description and the narrative
    // version of what they're looking for (see lookingForNote below).
    aboutUs: `${seed.aboutUs} ${seed.lookingForNote}`,
    // Home.tsx's card-grid mapper does
    // `(p?.lookingFor || p?.desiredSkills || []).map(...)`, so this MUST be
    // an array — a free-text sentence here throws "X.map is not a function".
    lookingFor: seed.lookingForTags,
    lookingForType: seed.lookingForType,
    offering: {
      accommodation: {
        type: seed.accommodationType,
        hasPrivateBathroom: seed.hasPrivateBathroom,
        description: seed.accommodationDescription,
      },
      meals: seed.meals,
      allowance: {
        amount: seed.allowanceAmount,
        currency: seed.allowanceCurrency,
        frequency: seed.allowanceFrequency,
      },
      benefits: seed.benefits,
    },
    position: {
      startDate: seed.startDate,
      duration: seed.duration,
      workingHoursType: seed.workingHoursType,
      preferredDays: seed.preferredDays,
      hoursPerWeek: seed.hoursPerWeek,
    },
    languages: {
      primary: { language: seed.languagePrimary },
      secondary: seed.languageSecondary.map((language) => ({ language })),
    },
    // Flat convenience fields for the Home.tsx card-grid mapper — it reads
    // these at the top level, NOT nested under location/familyMembers.
    nationalityCode: seed.nationalityCode,
    flag: seed.flag,
    children: seed.children,
    availability: seed.availabilityLabel,
    durationMonths: seed.durationMonths,
    needDays: seed.preferredDays,
    startDate: seed.startDate,
    profileImage: avatar(seed.avatarImg),
    galleryImages: gallery(...seed.galleryIdx),
    stats: emptyStats,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

function makeBabysitterProfile(seed: BabysitterSeed) {
  return {
    name: seed.name,
    age: seed.age,
    nationality: seed.nationality,
    nationalityCode: seed.nationalityCode,
    flag: seed.flag,
    currentLocation: { city: seed.city, country: seed.country },
    // components/ProfileLayout.tsx checks `profile?.workType === "babysitter"`
    // to decide whether to render BabysitterProfile.tsx instead of
    // AuPairProfile.tsx; careType/type are kept too since Home.tsx's
    // card-grid mapper falls back to those for the same purpose.
    workType: "babysitter",
    careType: "babysitter",
    type: "babysitter",
    aboutMe: seed.aboutMe,
    skills: seed.skills,
    certifications: seed.certifications,
    personalityTraits: seed.personalityTraits,
    experienceYears: seed.experienceYears,
    childcareExperience: true,
    experienceDetails: seed.experienceDetails,
    experience: [{ type: "childcare", description: seed.experienceDetails }],
    languages: {
      primary: seed.languagePrimary,
      secondary: seed.languageSecondary,
    },
    // Read directly by components/BabysitterProfile.tsx and by the
    // ProfileCompactCard secondaryLabel in Home.tsx's babysitter tab.
    hourlyRate: seed.hourlyRate,
    maxTravelDistance: seed.maxTravelDistance,
    availability: {
      status: "available",
      availableFrom: seed.availableFrom,
      workingHoursType: seed.workingHoursType,
      preferredDays: seed.preferredDays,
      maxTravelDistance: seed.maxTravelDistance,
    },
    workDays: seed.preferredDays,
    profileImage: avatar(seed.avatarImg),
    // BabysitterProfile.tsx reads `galleryPhotos`, not `galleryImages` —
    // provide both so the detail view and any shared card logic both work.
    galleryImages: gallery(...seed.galleryIdx),
    galleryPhotos: gallery(...seed.galleryIdx),
    stats: emptyStats,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

function makeUserDoc(params: {
  email: string;
  userType: "aupair" | "family";
  profileRef: string;
}) {
  return {
    email: params.email,
    userType: params.userType,
    profileRef: params.profileRef,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    isActive: true,
    isEmailVerified: true,
    isProfileComplete: true,
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      messageNotifications: true,
      matchNotifications: true,
    },
    privacySettings: {
      profileVisibility: "public",
      showOnlineStatus: true,
      showLocation: false,
    },
    onboarding: { step: "completed" },
  };
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

// Resolves the profile document ID a `users/{uid}` doc points to, whether
// `profileRef` is stored as a bare doc ID or as a "collection/id" path.
function profileIdFromRef(profileRef: unknown): string | null {
  if (!profileRef || typeof profileRef !== "string") return null;
  return profileRef.includes("/") ? profileRef.split("/").filter(Boolean).pop()! : profileRef;
}

async function seedAuth() {
  console.log("🔥 Seeding Authentication users + rich profiles...");

  for (const [i, seed] of AUPAIR_SEEDS.entries()) {
    const email = `aupair${i + 1}@example.com`;
    try {
      const userRecord = await auth.createUser({
        email,
        password: "test1234",
        displayName: seed.name,
      });

      const ref = db.collection("auPairProfiles").doc();
      await ref.set({ userId: userRecord.uid, ...makeAuPairProfile(seed) });

      await db
        .collection("users")
        .doc(userRecord.uid)
        .set(makeUserDoc({ email, userType: "aupair", profileRef: `auPairProfiles/${ref.id}` }));

      console.log(`✅ ${seed.name} (aupair) created → profileRef: ${ref.id}`);
    } catch (error: any) {
      if (error.code === "auth/email-already-exists") {
        // The auth account already exists from a previous run — refresh its
        // profile document in place instead of silently skipping, so fixes
        // to the seed data (like this one) actually reach already-seeded docs.
        const existing = await auth.getUserByEmail(email);
        const userSnap = await db.collection("users").doc(existing.uid).get();
        const profileId = profileIdFromRef(userSnap.data()?.profileRef);
        if (profileId) {
          await db
            .collection("auPairProfiles")
            .doc(profileId)
            .set({ userId: existing.uid, ...makeAuPairProfile(seed) }, { merge: true });
          console.log(`🔄 ${seed.name} (aupair) already existed → profile refreshed (${profileId})`);
        } else {
          console.log(`⚠️  ${email} exists but has no profileRef — skipped profile refresh`);
        }
      } else {
        console.error(`❌ ${email}:`, error);
      }
    }
  }

  for (const [i, seed] of FAMILY_SEEDS.entries()) {
    const email = `family${i + 1}@example.com`;
    try {
      const userRecord = await auth.createUser({
        email,
        password: "test1234",
        displayName: seed.familyName,
      });

      const ref = db.collection("familyProfiles").doc();
      await ref.set({ userId: userRecord.uid, ...makeFamilyProfile(seed) });

      await db
        .collection("users")
        .doc(userRecord.uid)
        .set(makeUserDoc({ email, userType: "family", profileRef: `familyProfiles/${ref.id}` }));

      console.log(`✅ ${seed.familyName} (family) created → profileRef: ${ref.id}`);
    } catch (error: any) {
      if (error.code === "auth/email-already-exists") {
        const existing = await auth.getUserByEmail(email);
        const userSnap = await db.collection("users").doc(existing.uid).get();
        const profileId = profileIdFromRef(userSnap.data()?.profileRef);
        if (profileId) {
          await db
            .collection("familyProfiles")
            .doc(profileId)
            .set({ userId: existing.uid, ...makeFamilyProfile(seed) }, { merge: true });
          console.log(`🔄 ${seed.familyName} (family) already existed → profile refreshed (${profileId})`);
        } else {
          console.log(`⚠️  ${email} exists but has no profileRef — skipped profile refresh`);
        }
      } else {
        console.error(`❌ ${email}:`, error);
      }
    }
  }

  for (const [i, seed] of BABYSITTER_SEEDS.entries()) {
    const email = `babysitter${i + 1}@example.com`;
    try {
      const userRecord = await auth.createUser({
        email,
        password: "test1234",
        displayName: seed.name,
      });

      // Babysitters live in auPairProfiles (workType: "babysitter"), not a
      // separate collection — see the comment above BABYSITTER_SEEDS.
      const ref = db.collection("auPairProfiles").doc();
      await ref.set({ userId: userRecord.uid, ...makeBabysitterProfile(seed) });

      await db
        .collection("users")
        .doc(userRecord.uid)
        .set(makeUserDoc({ email, userType: "aupair", profileRef: `auPairProfiles/${ref.id}` }));

      console.log(`✅ ${seed.name} (babysitter) created → profileRef: ${ref.id}`);
    } catch (error: any) {
      if (error.code === "auth/email-already-exists") {
        const existing = await auth.getUserByEmail(email);
        const userSnap = await db.collection("users").doc(existing.uid).get();
        const profileId = profileIdFromRef(userSnap.data()?.profileRef);
        if (profileId) {
          await db
            .collection("auPairProfiles")
            .doc(profileId)
            .set({ userId: existing.uid, ...makeBabysitterProfile(seed) }, { merge: true });
          console.log(`🔄 ${seed.name} (babysitter) already existed → profile refreshed (${profileId})`);
        } else {
          console.log(`⚠️  ${email} exists but has no profileRef — skipped profile refresh`);
        }
      } else {
        console.error(`❌ ${email}:`, error);
      }
    }
  }

  console.log("🎉 Done seeding Auth + profiles!");
}

seedAuth().catch((e) => {
  console.error(e);
  process.exit(1);
});
