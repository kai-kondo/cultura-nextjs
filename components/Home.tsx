import { useState, useMemo, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { SearchFilters } from "./SearchFilters";
import { AirbnbCard } from "./AirbnbCard";
import { RecentlyAddedCard } from "./RecentlyAddedCard";
import { HorizontalScrollRow } from "./HorizontalScrollRow";
import { FeaturedProfilesGrid } from "./FeaturedProfilesGrid";
import { TrustSection } from "./TrustSection";
import { HowItWorks } from "./HowItWorks";
import { CommunityHighlights } from "./CommunityHighlights";
import { motion } from "motion/react";
import { Users, Home as HomeIcon, Baby } from "lucide-react";

// Minimal card-facing types (derived from FIREBASE_DATA_STRUCTURE.md)
interface AuPairCardData {
  id: string;
  userId?: string;
  name: string;
  nationality?: string;
  nationalityCode?: string;
  flag?: string;
  imageUrl?: string;
  type?: "aupair" | "demipair" | "babysitter";
  primaryLanguage?: { code: string; name: string; level?: string };
  secondaryLanguages?: { code: string; name: string; level?: string }[];
  skills?: { emoji?: string; name: string; code?: string }[];
  duration?: string;
  durationMonths?: number;
  availability?: string;
  workDays?: string[];
  availableFrom?: string;
  hourlyRate?: number;
}

interface FamilyCardData {
  id: string;
  userId?: string;
  name: string;
  location?: string;
  nationalityCode?: string;
  flag?: string;
  imageUrl?: string;
  primaryLanguage?: { code: string; name: string };
  secondaryLanguages?: { code: string; name: string }[];
  children?: { age?: number; emoji?: string }[];
  lookingFor?: { name: string; code?: string }[];
  lookingForType?: "aupair" | "demipair" | "babysitter";
  duration?: string;
  durationMonths?: number;
  availability?: string;
  needDays?: string[];
  startDate?: string;
}

interface HomeProps {
  userType: "family" | "aupair";
  onViewProfile?: (id: string) => void;
  onOpenSettings?: () => void;
  onOpenMyProfile?: () => void;
  onOpenCommunity?: () => void;
}

function CardRowSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="w-[45vw] shrink-0 space-y-2 sm:w-[220px]">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function Home({
  userType,
  onViewProfile,
  onOpenSettings,
  onOpenMyProfile,
  onOpenCommunity,
}: HomeProps) {
  const [activeTab, setActiveTab] = useState<"aupair" | "babysitter" | "family">(
    userType === "family" ? "aupair" : "family"
  );
  // New filter states
  const [selectedNationality, setSelectedNationality] = useState("");
  const [selectedDesiredCountry, setSelectedDesiredCountry] = useState("");
  const [selectedPrimaryLanguage, setSelectedPrimaryLanguage] = useState("");
  const [selectedSecondaryLanguage, setSelectedSecondaryLanguage] =
    useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedEthnicity, setSelectedEthnicity] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isSearching = false;

  const [auPairs, setAuPairs] = useState<AuPairCardData[]>([]);

  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  // Firestore → auPairProfiles (latest 24)
  useEffect(() => {
    const q = query(
      collection(db, "auPairProfiles"),
      orderBy("createdAt", "desc"),
      limit(24)
    );
    const unsub = onSnapshot(q, (snap) => {
      const rows: AuPairCardData[] = snap.docs.map((d) => {
        const p: any = d.data();
        // Map Firestore fields → card-facing shape (best-effort based on spec)
        const primaryLang = p?.languages?.primary?.language;
        const secondary = (p?.languages?.secondary || []).map((l: any) => ({
          code: String(l?.language || "").toLowerCase(),
          name: l?.language || "",
          level: l?.proficiency || "",
        }));
        return {
          id: d.id,
          userId: p?.userId,
          name: p?.name || "",
          nationality: p?.nationality || p?.originCountry || "",
          nationalityCode:
            (p?.nationalityCode || p?.originCountryCode || "").toLowerCase() ||
            undefined,
          flag: p?.flag || undefined,
          imageUrl: p?.profileImage || p?.photos?.[0] || undefined,
          type: p?.workType || p?.careType || p?.type || undefined,
          primaryLanguage: primaryLang
            ? {
                code: String(primaryLang).toLowerCase(),
                name: primaryLang,
                level: p?.languages?.primary?.proficiency,
              }
            : undefined,
          secondaryLanguages: secondary,
          skills: (p?.skills || []).map((s: any) => ({
            emoji: s?.emoji,
            name: s?.name || String(s),
            code: s?.code,
          })),
          duration: p?.durationLabel || undefined,
          durationMonths: p?.durationMonths || undefined,
          availability: p?.availability || undefined,
          workDays: p?.workDays || p?.availabilityDays || [],
          availableFrom:
            p?.availability?.availableFrom || p?.availableFrom || undefined,
          hourlyRate: p?.hourlyRate ?? undefined,
          isDeleted: p?.isDeleted === true,
        };
      });
      const filtered = rows.filter((r: any) => r?.isDeleted !== true);
      setAuPairs(filtered);
    });
    return () => unsub();
  }, []);

  const [families, setFamilies] = useState<FamilyCardData[]>([]);

  // Firestore → familyProfiles (latest 24)
  useEffect(() => {
    const q = query(
      collection(db, "familyProfiles"),
      orderBy("createdAt", "desc"),
      limit(24)
    );
    const unsub = onSnapshot(q, (snap) => {
      const rows: FamilyCardData[] = snap.docs.map((d) => {
        const p: any = d.data();
        const city = p?.location?.city || p?.address?.city || "";
        const country = p?.location?.country || p?.address?.country || "";
        const primaryLang =
          p?.languages?.primary?.language || p?.primaryLanguage;
        const secondary = (
          p?.languages?.secondary ||
          p?.secondaryLanguages ||
          []
        ).map((l: any) => ({
          code: String(l?.language || l)?.toLowerCase(),
          name: l?.language || l,
        }));
        return {
          id: d.id,
          userId: p?.userId,
          name: p?.familyName || p?.name || "",
          location: [city, country].filter(Boolean).join(", ") || undefined,
          nationalityCode:
            (p?.nationalityCode || p?.countryCode || "").toLowerCase() ||
            undefined,
          flag: p?.flag || undefined,
          imageUrl:
            p?.familyPhoto || p?.profileImage || p?.photos?.[0] || undefined,
          primaryLanguage: primaryLang
            ? { code: String(primaryLang).toLowerCase(), name: primaryLang }
            : undefined,
          secondaryLanguages: secondary,
          children: (p?.children || p?.familyMembers?.children || []).map((c: any) => ({
            age: c?.age,
            emoji: c?.emoji,
          })),
          lookingFor: (p?.lookingFor || p?.desiredSkills || []).map(
            (s: any) => ({ name: s?.name || String(s), code: s?.code })
          ),
          lookingForType: p?.lookingForType || p?.careType || undefined,
          duration: p?.durationLabel || undefined,
          durationMonths: p?.durationMonths || undefined,
          availability: p?.availability || undefined,
          needDays: p?.needDays || p?.requiredDays || [],
          startDate: p?.startDate || p?.availability?.startDate || undefined,
          isDeleted: p?.isDeleted === true,
        };
      });
      const filtered = rows.filter((r: any) => r?.isDeleted !== true);
      setFamilies(filtered);
    });
    return () => unsub();
  }, []);

  // Load current user's profile image for header avatar
  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const load = async () => {
      try {
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));
        const userData = userSnap.data() as any;
        if (!userData?.profileRef || !userData?.userType) return;

        const profileCollection =
          userData.userType === "aupair" ? "auPairProfiles" : "familyProfiles";

        // `profileRef` can be stored either as a plain doc id ("abc123") or as a path
        // ("auPairProfiles/abc123" or even "auPairProfiles/auPairProfiles/abc123").
        // Firestore `doc(db, collection, id)` requires the id to NOT contain slashes.
        const rawProfileRef = String(userData.profileRef || "");
        const profileId = rawProfileRef.includes("/")
          ? rawProfileRef.split("/").filter(Boolean).slice(-1)[0]
          : rawProfileRef;

        const profileSnap = await getDoc(doc(db, profileCollection, profileId));
        const profile = profileSnap.data() as any;
        const photo =
          profile?.profileImage ||
          profile?.familyPhoto ||
          (Array.isArray(profile?.photos) ? profile.photos[0] : null);

        if (photo) setUserPhoto(photo);
      } catch (e) {
        console.error("Failed to load user avatar:", e);
      }
    };

    load();
  }, []);

  // Filter au pairs
  const filteredAuPairs = useMemo(() => {
    return auPairs.filter((auPair) => {
      if (selectedType && (auPair.type || "") !== selectedType) return false;
      if (
        selectedNationality &&
        (auPair.nationalityCode || "") !== selectedNationality
      )
        return false;
      if (selectedEthnicity) {
        // ethnicity is not guaranteed in schema → skip unless present
        const eth = (auPair as any)?.ethnicity;
        if (!eth || eth !== selectedEthnicity) return false;
      }
      if (selectedDesiredCountry) {
        const wants: string[] = (auPair as any)?.desiredCountries || [];
        if (!wants.includes(selectedDesiredCountry)) return false;
      }
      if (selectedPrimaryLanguage) {
        if ((auPair.primaryLanguage?.code || "") !== selectedPrimaryLanguage)
          return false;
      }
      if (selectedSecondaryLanguage) {
        const sec = (auPair.secondaryLanguages || []).some(
          (l) => l.code === selectedSecondaryLanguage
        );
        if (!sec) return false;
      }
      if (selectedSkill) {
        const has = (auPair.skills || []).some(
          (s) => (s.code || s.name?.toLowerCase()) === selectedSkill
        );
        if (!has) return false;
      }
      if (selectedDuration) {
        const [min, max] = selectedDuration.split("-").map(Number);
        const m = auPair.durationMonths ?? 0;
        if (max ? m < min || m > max : m < min) return false;
      }
      if (
        selectedAvailability &&
        (auPair.availability || "") !== selectedAvailability
      )
        return false;
      if (selectedDays.length > 0) {
        const days = auPair.workDays || [];
        const hasAll = selectedDays.every((d) => days.includes(d));
        if (!hasAll) return false;
      }
      return true;
    });
  }, [
    auPairs,
    selectedType,
    selectedNationality,
    selectedEthnicity,
    selectedDesiredCountry,
    selectedPrimaryLanguage,
    selectedSecondaryLanguage,
    selectedSkill,
    selectedDuration,
    selectedAvailability,
    selectedDays,
  ]);

  const filteredRegularAuPairs = useMemo(
    () => filteredAuPairs.filter((profile) => profile.type !== "babysitter"),
    [filteredAuPairs]
  );

  const filteredBabysitters = useMemo(
    () => filteredAuPairs.filter((profile) => profile.type === "babysitter"),
    [filteredAuPairs]
  );

  // No rating data exists yet, so "featured" is approximated from how complete
  // a profile is (photo, language, skills/duration filled in) — a reasonable
  // stand-in signal until real ratings/reviews land.
  const auPairCompleteness = (p: AuPairCardData) =>
    (p.imageUrl ? 1 : 0) +
    (p.primaryLanguage ? 1 : 0) +
    ((p.skills?.length || 0) > 0 ? 1 : 0) +
    (p.duration || p.durationMonths ? 1 : 0) +
    (p.nationality ? 1 : 0);

  const familyCompleteness = (f: FamilyCardData) =>
    (f.imageUrl ? 1 : 0) +
    (f.primaryLanguage ? 1 : 0) +
    ((f.lookingFor?.length || 0) > 0 ? 1 : 0) +
    ((f.children?.length || 0) > 0 ? 1 : 0) +
    (f.location ? 1 : 0);

  function pickFeatured<T>(items: T[], score: (item: T) => number, count = 6): T[] {
    if (items.length < 4) return [];
    return items
      .map((item, index) => ({ item, index, score: score(item) }))
      .filter((entry) => entry.score >= 3)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, count)
      .map((entry) => entry.item);
  }

  const featuredRegularAuPairs = useMemo(
    () => pickFeatured(filteredRegularAuPairs, auPairCompleteness, 10),
    [filteredRegularAuPairs]
  );

  const featuredBabysitters = useMemo(
    () => pickFeatured(filteredBabysitters, auPairCompleteness, 10),
    [filteredBabysitters]
  );

  const filteredFamilies = useMemo(() => {
    return families.filter((family) => {
      if (
        selectedNationality &&
        (family.nationalityCode || "") !== selectedNationality
      )
        return false;
      if (
        selectedPrimaryLanguage &&
        (family.primaryLanguage?.code || "") !== selectedPrimaryLanguage
      )
        return false;
      if (selectedSecondaryLanguage) {
        const sec = (family.secondaryLanguages || []).some(
          (l) => l.code === selectedSecondaryLanguage
        );
        if (!sec) return false;
      }
      if (selectedSkill) {
        const has = (family.lookingFor || []).some(
          (s) => (s.code || s.name?.toLowerCase()) === selectedSkill
        );
        if (!has) return false;
      }
      if (selectedDuration) {
        const [min, max] = selectedDuration.split("-").map(Number);
        const m = family.durationMonths ?? 0;
        if (max ? m < min || m > max : m < min) return false;
      }
      if (
        selectedAvailability &&
        (family.availability || "") !== selectedAvailability
      )
        return false;
      if (selectedDays.length > 0) {
        const days = family.needDays || [];
        const hasAll = selectedDays.every((d) => days.includes(d));
        if (!hasAll) return false;
      }
      return true;
    });
  }, [
    families,
    selectedNationality,
    selectedPrimaryLanguage,
    selectedSecondaryLanguage,
    selectedSkill,
    selectedDuration,
    selectedAvailability,
    selectedDays,
  ]);

  const featuredFamilies = useMemo(
    () => pickFeatured(filteredFamilies, familyCompleteness, 10),
    [filteredFamilies]
  );

  const hasActiveFilters = [
    selectedType,
    selectedEthnicity,
    selectedNationality,
    selectedDesiredCountry,
    selectedPrimaryLanguage,
    selectedSecondaryLanguage,
    selectedSkill,
    selectedDuration,
    selectedAvailability,
    ...selectedDays,
    ...activeTags,
  ].filter(Boolean).length > 0;
  const resultCount =
    activeTab === "aupair"
      ? filteredRegularAuPairs.length
      : activeTab === "babysitter"
        ? filteredBabysitters.length
        : filteredFamilies.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-100">
      {/* Main Content */}
      <main className="mx-auto max-w-[1760px] px-4 py-6 sm:px-8 lg:px-10">
        <SearchFilters
          activeTab={activeTab}
          resultCount={resultCount}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedNationality={selectedNationality}
          setSelectedNationality={setSelectedNationality}
          selectedDesiredCountry={selectedDesiredCountry}
          setSelectedDesiredCountry={setSelectedDesiredCountry}
          selectedPrimaryLanguage={selectedPrimaryLanguage}
          setSelectedPrimaryLanguage={setSelectedPrimaryLanguage}
          selectedSecondaryLanguage={selectedSecondaryLanguage}
          setSelectedSecondaryLanguage={setSelectedSecondaryLanguage}
          selectedSkill={selectedSkill}
          setSelectedSkill={setSelectedSkill}
          selectedEthnicity={selectedEthnicity}
          setSelectedEthnicity={setSelectedEthnicity}
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
          selectedAvailability={selectedAvailability}
          setSelectedAvailability={setSelectedAvailability}
          selectedDays={selectedDays}
          setSelectedDays={setSelectedDays}
          activeTags={activeTags}
          setActiveTags={setActiveTags}
        />

        {/* Category tabs — centered modern pill switcher */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "aupair" | "babysitter" | "family")}
          className="w-full"
        >
          <div className="mb-8 flex justify-center">
            <TabsList className="h-auto gap-1 rounded-full bg-gray-100 p-1.5">
              <TabsTrigger
                value="aupair"
                className="gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-gray-500 transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
              >
                <Users className="h-4 w-4" />
                Au Pairs
              </TabsTrigger>
              <TabsTrigger
                value="family"
                className="gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-gray-500 transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
              >
                <HomeIcon className="h-4 w-4" />
                Families
              </TabsTrigger>
              <TabsTrigger
                value="babysitter"
                className="gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-gray-500 transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
              >
                <Baby className="h-4 w-4" />
                Babysitters
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="aupair" className="mt-0">
            {isSearching ? (
              <CardRowSkeleton />
            ) : filteredRegularAuPairs.length > 0 ? (
              <>
                {featuredRegularAuPairs.length > 0 ? (
                  <FeaturedProfilesGrid title="Featured au pairs">
                    {featuredRegularAuPairs.map((auPair) => (
                      <AirbnbCard
                        key={auPair.id}
                        id={auPair.id}
                        userId={auPair.userId}
                        imageUrl={auPair.imageUrl}
                        badge={auPair.flag ? `${auPair.flag} ${auPair.nationality || ""}`.trim() : undefined}
                        title={auPair.name}
                        subtitle={auPair.primaryLanguage?.name}
                        meta={
                          auPair.duration ||
                          (auPair.durationMonths ? `${auPair.durationMonths} months` : auPair.availableFrom || "Flexible")
                        }
                        onClick={() => onViewProfile?.(auPair.id)}
                      />
                    ))}
                  </FeaturedProfilesGrid>
                ) : null}

                <HorizontalScrollRow title="Au pairs recently added">
                  {filteredRegularAuPairs.map((auPair) => (
                    <div key={auPair.id} className="w-[82vw] shrink-0 sm:w-[360px]">
                      <RecentlyAddedCard
                        id={auPair.id}
                        userId={auPair.userId}
                        imageUrl={auPair.imageUrl}
                        badge={auPair.flag ? `${auPair.flag} ${auPair.nationality || ""}`.trim() : undefined}
                        title={auPair.name}
                        subtitle={auPair.primaryLanguage?.name}
                        meta={
                          auPair.duration ||
                          (auPair.durationMonths ? `${auPair.durationMonths} months` : auPair.availableFrom || "Flexible")
                        }
                        onClick={() => onViewProfile?.(auPair.id)}
                      />
                    </div>
                  ))}
                </HorizontalScrollRow>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gray-200 bg-gray-50 py-16 text-center"
              >
                <div className="mb-4 text-5xl">🔍</div>
                <h3 className="mb-2 text-gray-700">No results found</h3>
                <p className="mb-6 text-gray-500">Try adjusting your filters or search criteria</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="text-sm text-gray-600">Try these instead:</span>
                  <Badge
                    variant="outline"
                    className="cursor-pointer transition-colors hover:border-gray-400 hover:bg-white"
                    onClick={() => {
                      setSelectedNationality("fr");
                      setSelectedDesiredCountry("");
                      setSelectedPrimaryLanguage("");
                      setSelectedSecondaryLanguage("");
                      setSelectedSkill("");
                    }}
                  >
                    🇫🇷 France
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer transition-colors hover:border-gray-400 hover:bg-white"
                    onClick={() => {
                      setSelectedNationality("");
                      setSelectedDesiredCountry("");
                      setSelectedPrimaryLanguage("");
                      setSelectedSecondaryLanguage("");
                      setSelectedSkill("music");
                    }}
                  >
                    🎵 Music
                  </Badge>
                </div>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="babysitter" className="mt-0">
            {isSearching ? (
              <CardRowSkeleton />
            ) : filteredBabysitters.length > 0 ? (
              <>
                {featuredBabysitters.length > 0 ? (
                  <FeaturedProfilesGrid title="Featured babysitters">
                    {featuredBabysitters.map((babysitter) => (
                      <AirbnbCard
                        key={babysitter.id}
                        id={babysitter.id}
                        userId={babysitter.userId}
                        imageUrl={babysitter.imageUrl}
                        badge={babysitter.hourlyRate ? `${babysitter.hourlyRate}/hr` : undefined}
                        title={babysitter.name}
                        subtitle={babysitter.nationality}
                        meta={babysitter.availableFrom ? `Available ${babysitter.availableFrom}` : "Flexible"}
                        onClick={() => onViewProfile?.(babysitter.id)}
                      />
                    ))}
                  </FeaturedProfilesGrid>
                ) : null}

                <HorizontalScrollRow title="Babysitters near you">
                  {filteredBabysitters.map((babysitter) => (
                    <div key={babysitter.id} className="w-[82vw] shrink-0 sm:w-[360px]">
                      <RecentlyAddedCard
                        id={babysitter.id}
                        userId={babysitter.userId}
                        imageUrl={babysitter.imageUrl}
                        badge={babysitter.hourlyRate ? `${babysitter.hourlyRate}/hr` : undefined}
                        title={babysitter.name}
                        subtitle={babysitter.nationality}
                        meta={babysitter.availableFrom ? `Available ${babysitter.availableFrom}` : "Flexible"}
                        onClick={() => onViewProfile?.(babysitter.id)}
                      />
                    </div>
                  ))}
                </HorizontalScrollRow>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gray-200 bg-gray-50 py-16 text-center"
              >
                <div className="mb-4 text-5xl">👶</div>
                <h3 className="mb-2 text-gray-700">No babysitters found</h3>
                <p className="text-gray-500">Try adjusting your filters or checking back later</p>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="family" className="mt-0">
            {isSearching ? (
              <CardRowSkeleton />
            ) : filteredFamilies.length > 0 ? (
              <>
                {featuredFamilies.length > 0 ? (
                  <FeaturedProfilesGrid title="Featured host families">
                    {featuredFamilies.map((family) => (
                      <AirbnbCard
                        key={family.id}
                        id={family.id}
                        userId={family.userId}
                        imageUrl={family.imageUrl}
                        badge={family.flag ? `${family.flag}` : undefined}
                        title={family.name}
                        subtitle={family.location}
                        meta={
                          family.children?.length
                            ? `${family.children.length} ${family.children.length === 1 ? "child" : "children"}`
                            : family.lookingForType || "Flexible"
                        }
                        onClick={() => onViewProfile?.(family.id)}
                      />
                    ))}
                  </FeaturedProfilesGrid>
                ) : null}

                <HorizontalScrollRow title="Host families looking now">
                  {filteredFamilies.map((family) => (
                    <div key={family.id} className="w-[82vw] shrink-0 sm:w-[360px]">
                      <RecentlyAddedCard
                        id={family.id}
                        userId={family.userId}
                        imageUrl={family.imageUrl}
                        badge={family.flag ? `${family.flag}` : undefined}
                        title={family.name}
                        subtitle={family.location}
                        meta={
                          family.children?.length
                            ? `${family.children.length} ${family.children.length === 1 ? "child" : "children"}`
                            : family.lookingForType || "Flexible"
                        }
                        onClick={() => onViewProfile?.(family.id)}
                      />
                    </div>
                  ))}
                </HorizontalScrollRow>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gray-200 bg-gray-50 py-16 text-center"
              >
                <div className="mb-4 text-5xl">🔍</div>
                <h3 className="mb-2 text-gray-700">No families match your criteria</h3>
                <p className="text-gray-500">Try broadening your search</p>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

        <HowItWorks />
        <CommunityHighlights />

        <div className="mt-10">
          <TrustSection />
        </div>
      </main>
    </div>
  );
}
