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
import { ProfileCompactCard } from "./ProfileCompactCard";
import { TrustSection } from "./TrustSection";
import { motion, AnimatePresence } from "motion/react";

// Minimal card-facing types (derived from FIREBASE_DATA_STRUCTURE.md)
interface AuPairCardData {
  id: string;
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
}

interface FamilyCardData {
  id: string;
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
  const [isSearchOpen, setIsSearchOpen] = useState(true);
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
          children: (p?.children || []).map((c: any) => ({
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

  const title =
    activeTab === "aupair"
      ? "Available Au Pairs"
      : activeTab === "babysitter"
        ? "Available Babysitters"
        : "Available Families";

  const subtitle =
    activeTab === "aupair"
      ? "Find the perfect match for your family"
      : activeTab === "babysitter"
        ? "Find trusted babysitters nearby"
        : "Find the perfect family for your cultural exchange";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
      

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
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

        {/* Tab Switcher */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "aupair" | "babysitter" | "family")}
          className="w-full mb-6"
        >
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-white/70 border border-orange-100">
              <TabsTrigger
                value="aupair"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-rose-500 data-[state=active]:text-white"
              >
                {userType === "family" ? "Find Au Pairs" : "Browse Au Pairs"}
              </TabsTrigger>
              <TabsTrigger
                value="family"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-rose-500 data-[state=active]:text-white"
              >
                {userType === "aupair" ? "Find Families" : "Browse Families"}
              </TabsTrigger>
              
              <TabsTrigger
                value="babysitter"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-rose-500 data-[state=active]:text-white"
              >
                Babysitters
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="aupair">
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-gray-700">{title}</h2>
              <p className="text-sm text-gray-500" id="search-results-count">
                {subtitle}
                {hasActiveFilters &&
                  ` • ${resultCount} result${
                    resultCount !== 1 ? "s" : ""
                  } found`}
              </p>
            </motion.div>

            {isSearching ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="space-y-3 w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Skeleton className="h-56 w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </motion.div>
                ))}
              </div>
            ) : filteredRegularAuPairs.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence mode="popLayout">
                  {filteredRegularAuPairs.map((auPair, index) => (
                    <motion.div
                      key={auPair.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                      className="w-full"
                    >
                      <ProfileCompactCard
                        name={auPair.name}
                        imageUrl={auPair.imageUrl || ""}
                        location={auPair.nationality || ""}
                        profileType="aupair"
                        primaryLabel={auPair.primaryLanguage?.name}
                        secondaryLabel={
                          auPair.duration ||
                          (auPair.durationMonths
                            ? `${auPair.durationMonths} months`
                            : undefined)
                        }
                        onClick={() => onViewProfile?.(auPair.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-white/50 rounded-2xl border border-orange-100"
              >
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  🔍
                </motion.div>
                <h3 className="text-gray-700 mb-2">No results found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="text-sm text-gray-600">
                    Try these instead:
                  </span>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-colors"
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
                    className="cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-colors"
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

          <TabsContent value="babysitter">
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-gray-700">Available Babysitters</h2>
              <p className="text-sm text-gray-500" id="babysitter-search-results-count">
                Find trusted babysitters nearby
                {hasActiveFilters &&
                  ` • ${filteredBabysitters.length} result${
                    filteredBabysitters.length !== 1 ? "s" : ""
                  } found`}
              </p>
            </motion.div>

            {isSearching ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="space-y-3 w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Skeleton className="h-56 w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </motion.div>
                ))}
              </div>
            ) : filteredBabysitters.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence mode="popLayout">
                  {filteredBabysitters.map((babysitter, index) => (
                    <motion.div
                      key={babysitter.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                      className="w-full"
                    >
                      <ProfileCompactCard
                        name={babysitter.name}
                        imageUrl={babysitter.imageUrl || ""}
                        location={(babysitter as any).location || babysitter.nationality || ""}
                        profileType="babysitter"
                        primaryLabel={babysitter.primaryLanguage?.name}
                        secondaryLabel={
                          (babysitter as any).hourlyRate
                            ? `$${(babysitter as any).hourlyRate}/hr`
                            : babysitter.availableFrom || undefined
                        }
                        onClick={() => onViewProfile?.(babysitter.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-white/50 rounded-2xl border border-purple-100"
              >
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  👶
                </motion.div>
                <h3 className="text-gray-700 mb-2">No babysitters found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or checking back later
                </p>
              </motion.div>
            )}
          </TabsContent>
          <TabsContent value="family">
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-gray-700">{title}</h2>
              <p className="text-sm text-gray-500" id="search-results-count">
                {subtitle}
                {hasActiveFilters &&
                  ` • ${resultCount} result${
                    resultCount !== 1 ? "s" : ""
                  } found`}
              </p>
            </motion.div>

            {isSearching ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="space-y-3 w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Skeleton className="h-56 w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </motion.div>
                ))}
              </div>
            ) : filteredFamilies.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence mode="popLayout">
                  {filteredFamilies.map((family, index) => (
                    <motion.div
                      key={family.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                      className="w-full"
                    >
                      <ProfileCompactCard
                        name={family.name}
                        imageUrl={family.imageUrl || ""}
                        location={family.location || ""}
                        profileType="family"
                        primaryLabel={family.primaryLanguage?.name}
                        secondaryLabel={
                          family.children?.length
                            ? `${family.children.length} children`
                            : family.lookingForType || undefined
                        }
                        onClick={() => onViewProfile?.(family.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-white/50 rounded-2xl border border-orange-100"
              >
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  🔍
                </motion.div>
                <h3 className="text-gray-700 mb-2">
                  No families match your criteria
                </h3>
                <p className="text-gray-500 mb-6">Try broadening your search</p>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

        <TrustSection />
      </main>

    </div>
  );
}
