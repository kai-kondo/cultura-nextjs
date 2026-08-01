"use client";

import { Dispatch, SetStateAction } from "react";
import { motion } from "motion/react";
import { Search, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type ActiveTab = "aupair" | "babysitter" | "family";

type SearchFiltersProps = {
  activeTab: ActiveTab;
  resultCount: number;
  isSearchOpen: boolean;
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>;
  selectedType: string;
  setSelectedType: Dispatch<SetStateAction<string>>;
  selectedNationality: string;
  setSelectedNationality: Dispatch<SetStateAction<string>>;
  selectedDesiredCountry: string;
  setSelectedDesiredCountry: Dispatch<SetStateAction<string>>;
  selectedPrimaryLanguage: string;
  setSelectedPrimaryLanguage: Dispatch<SetStateAction<string>>;
  selectedSecondaryLanguage: string;
  setSelectedSecondaryLanguage: Dispatch<SetStateAction<string>>;
  selectedSkill: string;
  setSelectedSkill: Dispatch<SetStateAction<string>>;
  selectedEthnicity: string;
  setSelectedEthnicity: Dispatch<SetStateAction<string>>;
  selectedDuration: string;
  setSelectedDuration: Dispatch<SetStateAction<string>>;
  selectedAvailability: string;
  setSelectedAvailability: Dispatch<SetStateAction<string>>;
  selectedDays: string[];
  setSelectedDays: Dispatch<SetStateAction<string[]>>;
  activeTags: string[];
  setActiveTags: Dispatch<SetStateAction<string[]>>;
};

const nationalities = ["Japan", "Australia", "Canada", "United States", "United Kingdom", "France", "Germany", "Spain", "Italy", "Brazil", "Mexico", "Philippines", "Indonesia", "Thailand", "Vietnam", "Other"];
const desiredCountries = ["Japan", "Australia", "Canada", "United States", "United Kingdom", "France", "Germany", "Spain", "Italy", "New Zealand", "Other"];
const languages = ["English", "Japanese", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Korean", "Tagalog", "Indonesian", "Thai", "Vietnamese", "Other"];
const skills = ["Childcare", "Babysitting", "Cooking", "Cleaning", "Driving", "Teaching", "Tutoring", "Pet care", "First aid", "Swimming", "Music", "Sports", "Arts & crafts"];
const ethnicities = ["Asian", "Black / African", "Caucasian / White", "Hispanic / Latino", "Middle Eastern", "Pacific Islander", "Mixed", "Other", "Prefer not to say"];
const durations = ["1-3 months", "3-6 months", "6-12 months", "1 year+", "Flexible"];
const availabilityOptions = ["Available now", "Within 1 month", "Within 3 months", "Flexible"];
const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const quickTags = [
  "Available now",
  "English",
  "Japanese",
  "Childcare",
  "Babysitting",
  "Driving",
  "3-6 months",
  "Flexible",
];

export function SearchFilters({
  activeTab,
  resultCount,
  isSearchOpen,
  setIsSearchOpen,
  selectedType,
  setSelectedType,
  selectedNationality,
  setSelectedNationality,
  selectedDesiredCountry,
  setSelectedDesiredCountry,
  selectedPrimaryLanguage,
  setSelectedPrimaryLanguage,
  selectedSecondaryLanguage,
  setSelectedSecondaryLanguage,
  selectedSkill,
  setSelectedSkill,
  selectedEthnicity,
  setSelectedEthnicity,
  selectedDuration,
  setSelectedDuration,
  selectedAvailability,
  setSelectedAvailability,
  selectedDays,
  setSelectedDays,
  activeTags,
  setActiveTags,
}: SearchFiltersProps) {
  const activeFilterCount = [
    selectedType,
    selectedNationality,
    selectedDesiredCountry,
    selectedPrimaryLanguage,
    selectedSecondaryLanguage,
    selectedSkill,
    selectedEthnicity,
    selectedDuration,
    selectedAvailability,
    ...selectedDays,
    ...activeTags,
  ].filter((value) => value && value !== "all").length;

  function handleClearAll() {
    setSelectedType("");
    setSelectedNationality("");
    setSelectedDesiredCountry("");
    setSelectedPrimaryLanguage("");
    setSelectedSecondaryLanguage("");
    setSelectedSkill("");
    setSelectedEthnicity("");
    setSelectedDuration("");
    setSelectedAvailability("");
    setSelectedDays([]);
    setActiveTags([]);
  }

  function handleTagClick(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  }

  function handleDayClick(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]
    );
  }

  function normalizeSelectValue(setter: Dispatch<SetStateAction<string>>) {
    return (value: string) => setter(value === "all" ? "" : value);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-8 flex justify-center"
    >
      <Collapsible open={isSearchOpen} onOpenChange={setIsSearchOpen} className="w-full max-w-2xl">
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center rounded-full border border-gray-200 bg-white py-2 pl-6 pr-2 text-left shadow-[0_1px_2px_rgba(0,0,0,0.08),0_1px_10px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(0,0,0,0.08)]">
            <div className="min-w-0 flex-1 border-r border-gray-200 pr-4">
              <p className="text-xs font-semibold text-gray-900">Nationality</p>
              <p className="truncate text-sm text-gray-500">{selectedNationality || "Any nationality"}</p>
            </div>
            <div className="min-w-0 flex-1 border-r border-gray-200 px-4">
              <p className="text-xs font-semibold text-gray-900">Availability</p>
              <p className="truncate text-sm text-gray-500">{selectedAvailability || "Any time"}</p>
            </div>
            <div className="min-w-0 flex-1 px-4">
              <p className="text-xs font-semibold text-gray-900">{activeTab === "family" ? "Looking for" : "Skill"}</p>
              <p className="truncate text-sm text-gray-500">{selectedSkill || "Add a skill"}</p>
            </div>
            <div className="ml-2 flex items-center gap-2">
              {activeFilterCount > 0 ? (
                <Badge className="rounded-full bg-orange-100 text-orange-700 hover:bg-orange-100">
                  {activeFilterCount}
                </Badge>
              ) : null}
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-sm">
                <Search className="h-4 w-4" />
              </span>
            </div>
          </button>
        </CollapsibleTrigger>
        <p className="mt-2 text-center text-xs text-gray-400">
          {resultCount} {resultCount === 1 ? "profile" : "profiles"} found
        </p>

        <CollapsibleContent className="mt-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-2">
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  activeTags.includes(tag)
                    ? "border-orange-400 bg-orange-100 text-orange-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Select value={selectedType || "all"} onValueChange={normalizeSelectValue(setSelectedType)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Profile type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value={activeTab}>{activeTab === "family" ? "Family" : activeTab === "babysitter" ? "Babysitter" : "Au Pair"}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedNationality || "all"} onValueChange={normalizeSelectValue(setSelectedNationality)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Nationality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any nationality</SelectItem>
                {nationalities.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedDesiredCountry || "all"} onValueChange={normalizeSelectValue(setSelectedDesiredCountry)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Desired country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any desired country</SelectItem>
                {desiredCountries.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedPrimaryLanguage || "all"} onValueChange={normalizeSelectValue(setSelectedPrimaryLanguage)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Primary language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any primary language</SelectItem>
                {languages.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedSecondaryLanguage || "all"} onValueChange={normalizeSelectValue(setSelectedSecondaryLanguage)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Secondary language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any secondary language</SelectItem>
                {languages.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedSkill || "all"} onValueChange={normalizeSelectValue(setSelectedSkill)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any skill</SelectItem>
                {skills.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedEthnicity || "all"} onValueChange={normalizeSelectValue(setSelectedEthnicity)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Ethnicity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any ethnicity</SelectItem>
                {ethnicities.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedDuration || "all"} onValueChange={normalizeSelectValue(setSelectedDuration)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any duration</SelectItem>
                {durations.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedAvailability || "all"} onValueChange={normalizeSelectValue(setSelectedAvailability)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any availability</SelectItem>
                {availabilityOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-gray-700">Preferred days</p>
            <div className="flex flex-wrap gap-2">
              {dayOptions.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    selectedDays.includes(day)
                      ? "border-orange-400 bg-orange-100 text-orange-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 ? (
            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClearAll}
                className="rounded-full text-gray-500 hover:text-gray-800"
              >
                <X className="mr-2 h-4 w-4" />
                Clear all
              </Button>
            </div>
          ) : null}
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
