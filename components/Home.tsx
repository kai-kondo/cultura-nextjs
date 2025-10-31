import { useState, useMemo, useEffect } from "react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Skeleton } from "./ui/skeleton";
import { AuPairCard } from "./AuPairCard";
import { FamilyCard } from "./FamilyCard";
import { FilterModal } from "./FilterModal";
import { DesktopNav } from "./DesktopNav";
import { CulturaLogo } from "./CulturaLogo";
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HomeProps {
  userType: "family" | "aupair";
  onViewProfile?: (id: string) => void;
  onOpenSettings?: () => void;
  onOpenMyProfile?: () => void;
  onOpenCommunity?: () => void;
}

interface QuickTag {
  id: string;
  label: string;
  emoji: string;
  desiredCountry?: string;
  skill?: string;
  primaryLanguage?: string;
  type?: string;
}

const quickTags: QuickTag[] = [
  { id: "usa", label: "Want USA", emoji: "🇺🇸", desiredCountry: "us" },
  { id: "japan", label: "Want Japan", emoji: "🇯🇵", desiredCountry: "jp" },
  { id: "art", label: "Art Skills", emoji: "🎨", skill: "art" },
  {
    id: "english-native",
    label: "English Native",
    emoji: "🗣️",
    primaryLanguage: "english",
  },
  { id: "aupair-type", label: "Au Pair", emoji: "👨‍👩‍👧‍👦", type: "aupair" },
  { id: "outdoor", label: "Sports/Outdoor", emoji: "⚽", skill: "sports" },
];

export function Home({
  userType,
  onViewProfile,
  onOpenSettings,
  onOpenMyProfile,
  onOpenCommunity,
}: HomeProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"aupair" | "family">(
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
  const [isSearching, setIsSearching] = useState(false);

  const auPairs = [
    {
      id: "emma",
      name: "Emma Tanaka",
      nationality: "Japan",
      nationalityCode: "jp",
      flag: "🇯🇵",
      ethnicity: "asian",
      type: "aupair",
      desiredCountries: ["us", "au", "uk"],
      imageUrl:
        "https://images.unsplash.com/photo-1704054006064-2c5b922e7a1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYxNjcyOTM1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      primaryLanguage: { code: "japanese", name: "Japanese", level: "Native" },
      secondaryLanguages: [
        { code: "english", name: "English", level: "Intermediate" },
        { code: "korean", name: "Korean", level: "Basic" },
      ],
      skills: [
        { emoji: "🏊", name: "Swimming", code: "swimming" },
        { emoji: "🍳", name: "Cooking", code: "cooking" },
        { emoji: "🎨", name: "Art", code: "art" },
      ],
      duration: "6 months",
      durationMonths: 6,
      availability: "fulltime",
      workDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      availableFrom: "Dec 2025",
    },
    {
      id: "lucas",
      name: "Lucas Silva",
      nationality: "Brazil",
      nationalityCode: "br",
      flag: "🇧🇷",
      ethnicity: "latino",
      type: "demipair",
      desiredCountries: ["us", "ca", "uk"],
      imageUrl:
        "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MTc3MDYwMnww&ixlib=rb-4.1.0&q=80&w=1080",
      primaryLanguage: {
        code: "portuguese",
        name: "Portuguese",
        level: "Native",
      },
      secondaryLanguages: [
        { code: "english", name: "English", level: "Fluent" },
        { code: "spanish", name: "Spanish", level: "Intermediate" },
      ],
      skills: [
        { emoji: "⚽", name: "Football", code: "sports" },
        { emoji: "🎸", name: "Music", code: "music" },
      ],
      duration: "12 months",
      durationMonths: 12,
      availability: "parttime",
      workDays: ["monday", "wednesday", "friday"],
      availableFrom: "Feb 2026",
    },
    {
      id: "sophie",
      name: "Sophie Martin",
      nationality: "France",
      nationalityCode: "fr",
      flag: "🇫🇷",
      ethnicity: "caucasian",
      type: "aupair",
      desiredCountries: ["jp", "kr", "cn"],
      imageUrl:
        "https://images.unsplash.com/photo-1664312572933-0563f14484a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNtaWxpbmclMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjE3MTI0MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      primaryLanguage: { code: "french", name: "French", level: "Native" },
      secondaryLanguages: [
        { code: "english", name: "English", level: "Fluent" },
        { code: "japanese", name: "Japanese", level: "Basic" },
      ],
      skills: [
        { emoji: "🎨", name: "Art", code: "art" },
        { emoji: "📚", name: "Reading", code: "reading" },
        { emoji: "🎭", name: "Theater", code: "theater" },
      ],
      duration: "9 months",
      durationMonths: 9,
      availability: "fulltime",
      workDays: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ],
      availableFrom: "Jan 2026",
    },
    {
      id: "marco",
      name: "Marco Rossi",
      nationality: "Italy",
      nationalityCode: "it",
      flag: "🇮🇹",
      ethnicity: "caucasian",
      type: "babysitter",
      desiredCountries: ["us", "uk", "au"],
      imageUrl:
        "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMGZyaWVuZGx5fGVufDF8fHx8MTc2MTY4MDQxMXww&ixlib=rb-4.1.0&q=80&w=1080",
      primaryLanguage: { code: "italian", name: "Italian", level: "Native" },
      secondaryLanguages: [
        { code: "english", name: "English", level: "Fluent" },
        { code: "spanish", name: "Spanish", level: "Intermediate" },
      ],
      skills: [
        { emoji: "🍳", name: "Cooking", code: "cooking" },
        { emoji: "⚽", name: "Soccer", code: "sports" },
        { emoji: "🎵", name: "Music", code: "music" },
      ],
      duration: "8 months",
      durationMonths: 8,
      availability: "weekend",
      workDays: ["saturday", "sunday"],
      availableFrom: "Mar 2026",
    },
    {
      id: "amara",
      name: "Amara Johnson",
      nationality: "USA",
      nationalityCode: "us",
      flag: "🇺🇸",
      ethnicity: "african",
      type: "aupair",
      desiredCountries: ["jp", "fr", "es"],
      imageUrl:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwc21pbGV8ZW58MXx8fHwxNzYxNzc0OTIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      primaryLanguage: { code: "english", name: "English", level: "Native" },
      secondaryLanguages: [
        { code: "spanish", name: "Spanish", level: "Intermediate" },
        { code: "french", name: "French", level: "Basic" },
      ],
      skills: [
        { emoji: "🎨", name: "Art", code: "art" },
        { emoji: "🏊", name: "Swimming", code: "swimming" },
        { emoji: "📖", name: "Teaching", code: "teaching" },
      ],
      duration: "12 months",
      durationMonths: 12,
      availability: "fulltime",
      workDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      availableFrom: "Jan 2026",
    },
    {
      id: "maria",
      name: "Maria Garcia",
      nationality: "Mexico",
      nationalityCode: "mx",
      flag: "🇲🇽",
      ethnicity: "latino",
      type: "demipair",
      desiredCountries: ["us", "ca", "es"],
      imageUrl:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MTc3NDkxOHww&ixlib=rb-4.1.0&q=80&w=1080",
      primaryLanguage: { code: "spanish", name: "Spanish", level: "Native" },
      secondaryLanguages: [
        { code: "english", name: "English", level: "Fluent" },
      ],
      skills: [
        { emoji: "🍳", name: "Cooking", code: "cooking" },
        { emoji: "💃", name: "Dancing", code: "dancing" },
        { emoji: "🎨", name: "Art", code: "art" },
      ],
      duration: "6 months",
      durationMonths: 6,
      availability: "parttime",
      workDays: ["tuesday", "thursday", "saturday"],
      availableFrom: "Feb 2026",
    },
  ];

  const families = [
    {
      id: "miller",
      name: "The Miller Family",
      location: "San Francisco, CA",
      nationalityCode: "us",
      flag: "🇺🇸",
      imageUrl:
        "https://images.unsplash.com/photo-1624448445915-97154f5e688c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGZhbWlseSUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MTc3NDg5OXww&ixlib=rb-4.1.0&q=80&w=1080",
      primaryLanguage: { code: "english", name: "English" },
      secondaryLanguages: [],
      children: [
        { age: 5, emoji: "👧" },
        { age: 3, emoji: "👦" },
      ],
      lookingFor: [
        { name: "Swimming", code: "swimming" },
        { name: "Cooking", code: "cooking" },
        { name: "English Teaching", code: "teaching" },
      ],
      lookingForType: "aupair" as const,
      duration: "12 months",
      durationMonths: 12,
      availability: "fulltime",
      needDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      startDate: "Jan 2026",
    },
    {
      id: "tanaka",
      name: "The Tanaka Family",
      location: "Tokyo, Japan",
      nationalityCode: "jp",
      flag: "🇯🇵",
      imageUrl:
        "https://images.unsplash.com/photo-1609220136736-443140cffec6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBob21lJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYxNzc0OTE4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      primaryLanguage: { code: "japanese", name: "Japanese" },
      secondaryLanguages: [{ code: "english", name: "English" }],
      children: [
        { age: 7, emoji: "👧" },
        { age: 4, emoji: "👧" },
      ],
      lookingFor: [
        { name: "English Teaching", code: "teaching" },
        { name: "Music", code: "music" },
        { name: "Art", code: "art" },
      ],
      lookingForType: "demipair" as const,
      duration: "6 months",
      durationMonths: 6,
      availability: "parttime",
      needDays: ["monday", "wednesday", "friday"],
      startDate: "Feb 2026",
    },
    {
      id: "garcia",
      name: "The Garcia Family",
      location: "Barcelona, Spain",
      nationalityCode: "es",
      flag: "🇪🇸",
      imageUrl:
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJlbnRzJTIwY2hpbGRyZW4lMjB0b2dldGhlcnxlbnwxfHx8fDE3NjE3NzQ5MjF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      primaryLanguage: { code: "spanish", name: "Spanish" },
      secondaryLanguages: [{ code: "english", name: "English" }],
      children: [{ age: 6, emoji: "👦" }],
      lookingFor: [
        { name: "Sports", code: "sports" },
        { name: "Swimming", code: "swimming" },
        { name: "Outdoor Activities", code: "outdoor" },
      ],
      lookingForType: "babysitter" as const,
      duration: "10 months",
      durationMonths: 10,
      availability: "fulltime",
      needDays: ["tuesday", "thursday", "saturday", "sunday"],
      startDate: "Mar 2026",
    },
  ];

  // Filter au pairs
  const filteredAuPairs = useMemo(() => {
    return auPairs.filter((auPair) => {
      // Type filter
      if (selectedType && auPair.type !== selectedType) return false;

      // Nationality filter
      if (selectedNationality && auPair.nationalityCode !== selectedNationality)
        return false;

      // Ethnicity filter
      if (selectedEthnicity && auPair.ethnicity !== selectedEthnicity)
        return false;

      // Desired country filter
      if (
        selectedDesiredCountry &&
        !auPair.desiredCountries.includes(selectedDesiredCountry)
      )
        return false;

      // Primary language filter
      if (
        selectedPrimaryLanguage &&
        auPair.primaryLanguage.code !== selectedPrimaryLanguage
      )
        return false;

      // Secondary language filter
      if (
        selectedSecondaryLanguage &&
        !auPair.secondaryLanguages.some(
          (lang) => lang.code === selectedSecondaryLanguage
        )
      )
        return false;

      // Skill filter
      if (
        selectedSkill &&
        !auPair.skills.some((skill) => skill.code === selectedSkill)
      )
        return false;

      // Duration filter
      if (selectedDuration) {
        const [min, max] = selectedDuration.split("-").map(Number);
        if (max) {
          if (auPair.durationMonths < min || auPair.durationMonths > max)
            return false;
        } else {
          // "12+" case
          if (auPair.durationMonths < min) return false;
        }
      }

      // Availability filter
      if (selectedAvailability && auPair.availability !== selectedAvailability)
        return false;

      // Days filter
      if (selectedDays.length > 0) {
        const hasAllDays = selectedDays.every((day) =>
          auPair.workDays.includes(day)
        );
        if (!hasAllDays) return false;
      }

      return true;
    });
  }, [
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

  // Filter families
  const filteredFamilies = useMemo(() => {
    return families.filter((family) => {
      // Nationality filter
      if (selectedNationality && family.nationalityCode !== selectedNationality)
        return false;

      // Primary language filter
      if (
        selectedPrimaryLanguage &&
        family.primaryLanguage.code !== selectedPrimaryLanguage
      )
        return false;

      // Secondary language filter
      if (
        selectedSecondaryLanguage &&
        !family.secondaryLanguages.some(
          (lang) => lang.code === selectedSecondaryLanguage
        )
      )
        return false;

      // Skill filter
      if (
        selectedSkill &&
        !family.lookingFor.some((skill) => skill.code === selectedSkill)
      )
        return false;

      // Duration filter
      if (selectedDuration) {
        const [min, max] = selectedDuration.split("-").map(Number);
        if (max) {
          if (family.durationMonths < min || family.durationMonths > max)
            return false;
        } else {
          // "12+" case
          if (family.durationMonths < min) return false;
        }
      }

      // Availability filter
      if (selectedAvailability && family.availability !== selectedAvailability)
        return false;

      // Days filter
      if (selectedDays.length > 0) {
        const hasAllDays = selectedDays.every((day) =>
          family.needDays.includes(day)
        );
        if (!hasAllDays) return false;
      }

      return true;
    });
  }, [
    selectedNationality,
    selectedPrimaryLanguage,
    selectedSecondaryLanguage,
    selectedSkill,
    selectedDuration,
    selectedAvailability,
    selectedDays,
  ]);

  // Active filters for display
  const activeFilters = useMemo(() => {
    const filters: { type: string; value: string; label: string }[] = [];

    if (selectedType) {
      const typeLabels: Record<string, string> = {
        aupair: "👨‍👩‍👧‍👦 Au Pair",
        demipair: "🎓 Demi Pair",
        babysitter: "👶 Babysitter",
      };
      filters.push({
        type: "careType",
        value: selectedType,
        label: typeLabels[selectedType] || selectedType,
      });
    }

    if (selectedEthnicity) {
      const ethnicityLabels: Record<string, string> = {
        asian: "🌏 Asian",
        caucasian: "🌍 Caucasian",
        african: "🌍 African",
        latino: "🌎 Latino/Hispanic",
        mixed: "🌐 Mixed",
      };
      filters.push({
        type: "ethnicity",
        value: selectedEthnicity,
        label: ethnicityLabels[selectedEthnicity] || selectedEthnicity,
      });
    }

    if (selectedNationality) {
      const countryLabels: Record<string, string> = {
        jp: "🇯🇵 Japan",
        au: "🇦🇺 Australia",
        fr: "🇫🇷 France",
        us: "🇺🇸 USA",
        es: "🇪🇸 Spain",
        it: "🇮🇹 Italy",
        br: "🇧🇷 Brazil",
        uk: "🇬🇧 UK",
        mx: "🇲🇽 Mexico",
      };
      filters.push({
        type: "nationality",
        value: selectedNationality,
        label: countryLabels[selectedNationality] || selectedNationality,
      });
    }

    if (selectedDesiredCountry) {
      const countryLabels: Record<string, string> = {
        jp: "🎯 Want Japan",
        au: "🎯 Want Australia",
        fr: "🎯 Want France",
        us: "🎯 Want USA",
        es: "🎯 Want Spain",
        it: "🎯 Want Italy",
        br: "🎯 Want Brazil",
        uk: "🎯 Want UK",
        ca: "🎯 Want Canada",
        kr: "🎯 Want Korea",
        cn: "🎯 Want China",
      };
      filters.push({
        type: "desiredCountry",
        value: selectedDesiredCountry,
        label: countryLabels[selectedDesiredCountry] || selectedDesiredCountry,
      });
    }

    if (selectedPrimaryLanguage) {
      filters.push({
        type: "primaryLanguage",
        value: selectedPrimaryLanguage,
        label: `1️⃣ ${
          selectedPrimaryLanguage.charAt(0).toUpperCase() +
          selectedPrimaryLanguage.slice(1)
        }`,
      });
    }

    if (selectedSecondaryLanguage) {
      filters.push({
        type: "secondaryLanguage",
        value: selectedSecondaryLanguage,
        label: `2️⃣ ${
          selectedSecondaryLanguage.charAt(0).toUpperCase() +
          selectedSecondaryLanguage.slice(1)
        }`,
      });
    }

    if (selectedSkill) {
      const skillLabels: Record<string, string> = {
        swimming: "🏊 Swimming",
        art: "🎨 Art",
        cooking: "🍳 Cooking",
        music: "🎵 Music",
        sports: "⚽ Sports",
        teaching: "📖 Teaching",
        dancing: "💃 Dancing",
      };
      filters.push({
        type: "skill",
        value: selectedSkill,
        label: skillLabels[selectedSkill] || selectedSkill,
      });
    }

    if (selectedDuration) {
      const durationLabels: Record<string, string> = {
        "1-3": "📅 1-3 months",
        "3-6": "📅 3-6 months",
        "6-12": "📅 6-12 months",
        "12": "📅 12+ months",
      };
      filters.push({
        type: "duration",
        value: selectedDuration,
        label: durationLabels[selectedDuration] || selectedDuration,
      });
    }

    if (selectedAvailability) {
      const availabilityLabels: Record<string, string> = {
        fulltime: "⏰ Full-time",
        parttime: "⏰ Part-time",
        weekend: "⏰ Weekends",
      };
      filters.push({
        type: "availability",
        value: selectedAvailability,
        label: availabilityLabels[selectedAvailability] || selectedAvailability,
      });
    }

    if (selectedDays.length > 0) {
      const dayLabels: Record<string, string> = {
        monday: "Mon",
        tuesday: "Tue",
        wednesday: "Wed",
        thursday: "Thu",
        friday: "Fri",
        saturday: "Sat",
        sunday: "Sun",
      };
      const daysLabel = selectedDays.map((d) => dayLabels[d]).join(", ");
      filters.push({
        type: "days",
        value: selectedDays.join(","),
        label: `📆 ${daysLabel}`,
      });
    }

    return filters;
  }, [
    selectedType,
    selectedEthnicity,
    selectedNationality,
    selectedDesiredCountry,
    selectedPrimaryLanguage,
    selectedSecondaryLanguage,
    selectedSkill,
    selectedDuration,
    selectedAvailability,
    selectedDays,
  ]);

  // Handle tag click
  const handleTagClick = (tag: QuickTag) => {
    const isActive = activeTags.includes(tag.id);

    if (isActive) {
      // Remove tag
      setActiveTags((prev) => prev.filter((t) => t !== tag.id));
      // Clear related filters
      if (tag.desiredCountry) setSelectedDesiredCountry("");
      if (tag.primaryLanguage) setSelectedPrimaryLanguage("");
      if (tag.skill) setSelectedSkill("");
      if (tag.type) setSelectedType("");
    } else {
      // Add tag
      setActiveTags((prev) => [...prev, tag.id]);
      // Set related filters
      if (tag.desiredCountry) setSelectedDesiredCountry(tag.desiredCountry);
      if (tag.primaryLanguage) setSelectedPrimaryLanguage(tag.primaryLanguage);
      if (tag.skill) setSelectedSkill(tag.skill);
      if (tag.type) setSelectedType(tag.type);
    }
  };

  // Clear all filters
  const handleClearAll = () => {
    setSelectedType("");
    setSelectedNationality("");
    setSelectedEthnicity("");
    setSelectedDesiredCountry("");
    setSelectedPrimaryLanguage("");
    setSelectedSecondaryLanguage("");
    setSelectedSkill("");
    setSelectedDuration("");
    setSelectedAvailability("");
    setSelectedDays([]);
    setActiveTags([]);
  };

  // Simulate search with loading state
  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
    }, 800);
  };

  // Auto-search when filters change
  useEffect(() => {
    if (
      selectedType ||
      selectedNationality ||
      selectedEthnicity ||
      selectedDesiredCountry ||
      selectedPrimaryLanguage ||
      selectedSecondaryLanguage ||
      selectedSkill ||
      selectedDuration ||
      selectedAvailability ||
      selectedDays.length > 0
    ) {
      handleSearch();
    }
  }, [
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

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const hasActiveFilters = activeFilters.length > 0;
  const resultCount =
    activeTab === "aupair" ? filteredAuPairs.length : filteredFamilies.length;

  const title =
    activeTab === "aupair" ? "Available Au Pairs" : "Available Families";

  const subtitle =
    activeTab === "aupair"
      ? "Find the perfect match for your family"
      : "Find the perfect family for your cultural exchange";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-orange-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <CulturaLogo size={40} />
              <span className="text-gray-800">Cultura</span>
            </div>

            <div className="flex-1" />

            {/* Desktop Navigation */}
            <DesktopNav
              onOpenSettings={onOpenSettings}
              onOpenProfile={onOpenMyProfile}
              onOpenCommunity={onOpenCommunity}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Search Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Collapsible open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
              {/* Collapsible Header */}
              <CollapsibleTrigger asChild>
                <button
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-inset group"
                  aria-label="Toggle search filters"
                  aria-expanded={isSearchOpen}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 group-hover:from-orange-200 group-hover:to-rose-200 transition-colors">
                      <Search className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-gray-800">Advanced Search</h3>
                      <p className="text-sm text-gray-500">
                        {hasActiveFilters
                          ? `${activeFilters.length} filter${
                              activeFilters.length !== 1 ? "s" : ""
                            } active`
                          : "Find your perfect match"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {resultCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      >
                        <Badge
                          className="bg-gradient-to-r from-orange-500 to-rose-500 text-white"
                          aria-live="polite"
                        >
                          {resultCount} result{resultCount !== 1 ? "s" : ""}
                        </Badge>
                      </motion.div>
                    )}
                    <motion.div
                      animate={{ rotate: isSearchOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    </motion.div>
                  </div>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-6 pb-6 space-y-6">
                  {/* Quick Search Tags */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Quick filters:
                      </span>
                      {hasActiveFilters && (
                        <button
                          onClick={handleClearAll}
                          className="text-sm text-orange-600 hover:text-orange-700 underline focus:outline-none focus:ring-2 focus:ring-orange-400 rounded px-2 py-1 ml-auto"
                          aria-label="Clear all filters"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {quickTags.map((tag) => {
                          const isActive = activeTags.includes(tag.id);
                          return (
                            <motion.div
                              key={tag.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Badge
                                variant={isActive ? "default" : "outline"}
                                className={`cursor-pointer transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                                  isActive
                                    ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 shadow-md"
                                    : "hover:bg-orange-50 hover:border-orange-300"
                                }`}
                                onClick={() => handleTagClick(tag)}
                                role="button"
                                tabIndex={0}
                                aria-pressed={isActive}
                                aria-label={`Filter by ${tag.label}`}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleTagClick(tag);
                                  }
                                }}
                              >
                                {tag.emoji} {tag.label}
                                {isActive && <X className="w-3 h-3 ml-1" />}
                              </Badge>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Filter Selects - Enhanced Layout */}
                  <div className="space-y-4" onKeyPress={handleKeyPress}>
                    {/* First Row - Type, Ethnicity, Nationality */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {activeTab === "aupair" && (
                        <Select
                          value={selectedType}
                          onValueChange={setSelectedType}
                        >
                          <SelectTrigger
                            className="bg-white border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                            aria-label="Select care type"
                          >
                            <SelectValue placeholder="👨‍👩‍👧‍👦 Care Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aupair">👨‍👩‍👧‍👦 Au Pair</SelectItem>
                            <SelectItem value="demipair">
                              🎓 Demi Pair
                            </SelectItem>
                            <SelectItem value="babysitter">
                              👶 Babysitter
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {activeTab === "aupair" && (
                        <Select
                          value={selectedEthnicity}
                          onValueChange={setSelectedEthnicity}
                        >
                          <SelectTrigger
                            className="bg-white border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                            aria-label="Select ethnicity"
                          >
                            <SelectValue placeholder="🌍 Ethnicity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asian">🌏 Asian</SelectItem>
                            <SelectItem value="caucasian">
                              🌍 Caucasian
                            </SelectItem>
                            <SelectItem value="african">🌍 African</SelectItem>
                            <SelectItem value="latino">
                              🌎 Latino/Hispanic
                            </SelectItem>
                            <SelectItem value="mixed">🌐 Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      <Select
                        value={selectedNationality}
                        onValueChange={setSelectedNationality}
                      >
                        <SelectTrigger
                          className="bg-white border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                          aria-label="Select nationality"
                        >
                          <SelectValue placeholder="🏴 Nationality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jp">🇯🇵 Japan</SelectItem>
                          <SelectItem value="us">🇺🇸 USA</SelectItem>
                          <SelectItem value="br">🇧🇷 Brazil</SelectItem>
                          <SelectItem value="fr">🇫🇷 France</SelectItem>
                          <SelectItem value="it">🇮🇹 Italy</SelectItem>
                          <SelectItem value="es">🇪🇸 Spain</SelectItem>
                          <SelectItem value="uk">🇬🇧 UK</SelectItem>
                          <SelectItem value="mx">🇲🇽 Mexico</SelectItem>
                          <SelectItem value="au">🇦🇺 Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Second Row - Desired Country, Primary & Secondary Language */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {activeTab === "aupair" && (
                        <Select
                          value={selectedDesiredCountry}
                          onValueChange={setSelectedDesiredCountry}
                        >
                          <SelectTrigger
                            className="bg-white border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                            aria-label="Select desired country"
                          >
                            <SelectValue placeholder="🎯 Where to work?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="us">🇺🇸 USA</SelectItem>
                            <SelectItem value="jp">🇯🇵 Japan</SelectItem>
                            <SelectItem value="au">🇦🇺 Australia</SelectItem>
                            <SelectItem value="uk">🇬🇧 UK</SelectItem>
                            <SelectItem value="fr">🇫🇷 France</SelectItem>
                            <SelectItem value="es">🇪🇸 Spain</SelectItem>
                            <SelectItem value="ca">🇨🇦 Canada</SelectItem>
                            <SelectItem value="kr">🇰🇷 Korea</SelectItem>
                            <SelectItem value="cn">🇨🇳 China</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      <Select
                        value={selectedPrimaryLanguage}
                        onValueChange={setSelectedPrimaryLanguage}
                      >
                        <SelectTrigger
                          className="bg-white border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                          aria-label="Select primary language"
                        >
                          <SelectValue placeholder="1️⃣ Primary Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="japanese">Japanese</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="italian">Italian</SelectItem>
                          <SelectItem value="portuguese">Portuguese</SelectItem>
                          <SelectItem value="korean">Korean</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedSecondaryLanguage}
                        onValueChange={setSelectedSecondaryLanguage}
                      >
                        <SelectTrigger
                          className="bg-white border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                          aria-label="Select secondary language"
                        >
                          <SelectValue placeholder="2️⃣ Secondary Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="japanese">Japanese</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="italian">Italian</SelectItem>
                          <SelectItem value="portuguese">Portuguese</SelectItem>
                          <SelectItem value="korean">Korean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Third Row - Duration, Availability, Skills */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Select
                        value={selectedDuration}
                        onValueChange={setSelectedDuration}
                      >
                        <SelectTrigger
                          className="bg-white border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                          aria-label="Select duration"
                        >
                          <SelectValue placeholder="📅 Duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-3">1-3 months</SelectItem>
                          <SelectItem value="3-6">3-6 months</SelectItem>
                          <SelectItem value="6-12">6-12 months</SelectItem>
                          <SelectItem value="12">12+ months</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedAvailability}
                        onValueChange={setSelectedAvailability}
                      >
                        <SelectTrigger
                          className="bg-white border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                          aria-label="Select availability"
                        >
                          <SelectValue placeholder="⏰ Availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fulltime">
                            ⏰ Full-time (5-7 days)
                          </SelectItem>
                          <SelectItem value="parttime">
                            ⏰ Part-time (2-4 days)
                          </SelectItem>
                          <SelectItem value="weekend">
                            ⏰ Weekends only
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedSkill}
                        onValueChange={setSelectedSkill}
                      >
                        <SelectTrigger
                          className="bg-white border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                          aria-label="Select skill"
                        >
                          <SelectValue placeholder="🎯 Skills" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="swimming">🏊 Swimming</SelectItem>
                          <SelectItem value="art">🎨 Art</SelectItem>
                          <SelectItem value="cooking">🍳 Cooking</SelectItem>
                          <SelectItem value="music">🎵 Music</SelectItem>
                          <SelectItem value="sports">⚽ Sports</SelectItem>
                          <SelectItem value="teaching">📖 Teaching</SelectItem>
                          <SelectItem value="dancing">💃 Dancing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fourth Row - Days Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          📆 Preferred Days:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: "monday", label: "Mon", emoji: "📅" },
                          { id: "tuesday", label: "Tue", emoji: "📅" },
                          { id: "wednesday", label: "Wed", emoji: "📅" },
                          { id: "thursday", label: "Thu", emoji: "📅" },
                          { id: "friday", label: "Fri", emoji: "📅" },
                          { id: "saturday", label: "Sat", emoji: "🎉" },
                          { id: "sunday", label: "Sun", emoji: "🎉" },
                        ].map((day) => {
                          const isSelected = selectedDays.includes(day.id);
                          return (
                            <motion.div
                              key={day.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Badge
                                variant={isSelected ? "default" : "outline"}
                                className={`cursor-pointer transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                                  isSelected
                                    ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600"
                                    : "hover:bg-orange-50 hover:border-orange-300"
                                }`}
                                onClick={() => {
                                  setSelectedDays((prev) =>
                                    isSelected
                                      ? prev.filter((d) => d !== day.id)
                                      : [...prev, day.id]
                                  );
                                }}
                                role="button"
                                tabIndex={0}
                                aria-pressed={isSelected}
                                aria-label={`Select ${day.label}`}
                              >
                                {day.emoji} {day.label}
                              </Badge>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Fifth Row - Search Button */}
                    <div className="flex justify-end">
                      <Button
                        className="bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 focus:ring-2 focus:ring-orange-400 w-full sm:w-auto px-8"
                        onClick={handleSearch}
                        aria-label="Search"
                        aria-describedby="search-results-count"
                        size="lg"
                      >
                        <Search className="w-5 h-5 mr-2" />
                        Search Now
                      </Button>
                    </div>
                  </div>

                  {/* Active Filters Pills */}
                  <AnimatePresence>
                    {activeFilters.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-2 pt-4 border-t border-orange-100"
                      >
                        <span className="text-sm text-gray-600 self-center">
                          Active filters:
                        </span>
                        <AnimatePresence>
                          {activeFilters.map((filter) => (
                            <motion.div
                              key={`${filter.type}-${filter.value}`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <Badge
                                variant="secondary"
                                className="bg-orange-100 text-orange-700 pl-3 pr-1 py-1 gap-1 hover:bg-orange-200 transition-colors"
                              >
                                {filter.label}
                                <button
                                  onClick={() => {
                                    if (filter.type === "careType")
                                      setSelectedType("");
                                    if (filter.type === "ethnicity")
                                      setSelectedEthnicity("");
                                    if (filter.type === "nationality")
                                      setSelectedNationality("");
                                    if (filter.type === "desiredCountry")
                                      setSelectedDesiredCountry("");
                                    if (filter.type === "primaryLanguage")
                                      setSelectedPrimaryLanguage("");
                                    if (filter.type === "secondaryLanguage")
                                      setSelectedSecondaryLanguage("");
                                    if (filter.type === "skill")
                                      setSelectedSkill("");
                                    if (filter.type === "duration")
                                      setSelectedDuration("");
                                    if (filter.type === "availability")
                                      setSelectedAvailability("");
                                    if (filter.type === "days")
                                      setSelectedDays([]);
                                  }}
                                  className="ml-1 hover:bg-orange-300 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors"
                                  aria-label={`Remove ${filter.label} filter`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </motion.div>

        {/* Tab Switcher */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "aupair" | "family")}
          className="w-full mb-6"
        >
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/70 border border-orange-100">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Skeleton className="h-64 w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </motion.div>
                ))}
              </div>
            ) : filteredAuPairs.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence mode="popLayout">
                  {filteredAuPairs.map((auPair, index) => (
                    <motion.div
                      key={auPair.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      <AuPairCard
                        name={auPair.name}
                        country={auPair.nationality}
                        flag={auPair.flag}
                        imageUrl={auPair.imageUrl}
                        type={
                          ["aupair", "demipair", "babysitter"].includes(auPair.type)
                            ? (auPair.type as "aupair" | "demipair" | "babysitter")
                            : undefined
                        }
                        languages={[
                          auPair.primaryLanguage.name +
                            " (" +
                            auPair.primaryLanguage.level +
                            ")",
                          ...auPair.secondaryLanguages.map(
                            (l) => l.name + " (" + l.level + ")"
                          ),
                        ]}
                        skills={auPair.skills.map((s) => ({
                          emoji: s.emoji,
                          name: s.name,
                        }))}
                        duration={auPair.duration}
                        availableFrom={auPair.availableFrom}
                        onViewProfile={() => onViewProfile?.(auPair.id)}
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
                  ` ��� ${resultCount} result${
                    resultCount !== 1 ? "s" : ""
                  } found`}
              </p>
            </motion.div>

            {isSearching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Skeleton className="h-64 w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </motion.div>
                ))}
              </div>
            ) : filteredFamilies.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
                    >
                      <FamilyCard
                        name={family.name}
                        location={family.location}
                        flag={family.flag}
                        imageUrl={family.imageUrl}
                        languages={[
                          family.primaryLanguage.name,
                          ...family.secondaryLanguages.map((l) => l.name),
                        ]}
                        children={family.children}
                        lookingFor={family.lookingFor.map((s) => s.name)}
                        duration={family.duration}
                        startDate={family.startDate}
                        lookingForType={family.lookingForType}
                        onViewProfile={() => onViewProfile?.(family.id)}
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
      </main>

      {/* Filter Modal */}
      <FilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filterType={activeTab}
      />
    </div>
  );
}
