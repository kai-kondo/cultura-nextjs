import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
import { useState } from "react";

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterType?: "aupair" | "family";
}

export function FilterModal({
  open,
  onOpenChange,
  filterType = "aupair",
}: FilterModalProps) {
  const [duration, setDuration] = useState([6]);

  const modalTitle =
    filterType === "aupair" ? "Filter Au Pairs" : "Filter Families";
  const modalDescription =
    filterType === "aupair"
      ? "Customize your search to find the perfect au pair for your family."
      : "Customize your search to find the perfect host family.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Care Type (for Au Pair filter only) */}
            {filterType === "aupair" && (
              <>
                <div>
                  <Label className="mb-3 block">Care Type</Label>
                  <div className="space-y-2">
                    {[
                      {
                        id: "aupair",
                        name: "Au Pair",
                        emoji: "👨‍👩‍👧‍👦",
                        description: "Full-time cultural exchange",
                      },
                      {
                        id: "demipair",
                        name: "Demi Pair",
                        emoji: "🎓",
                        description: "Part-time with study",
                      },
                      {
                        id: "babysitter",
                        name: "Babysitter",
                        emoji: "👶",
                        description: "Occasional childcare",
                      },
                    ].map((type) => (
                      <div key={type.id} className="flex items-start space-x-2">
                        <Checkbox id={type.id} />
                        <div className="flex-1">
                          <label
                            htmlFor={type.id}
                            className="text-sm cursor-pointer block"
                          >
                            {type.emoji} {type.name}
                          </label>
                          <p className="text-xs text-gray-500">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Ethnicity (for Au Pair filter only) */}
            {filterType === "aupair" && (
              <>
                <div>
                  <Label className="mb-3 block">Ethnicity</Label>
                  <div className="space-y-2">
                    {[
                      { id: "asian", name: "Asian", emoji: "🌏" },
                      { id: "caucasian", name: "Caucasian", emoji: "🌍" },
                      { id: "african", name: "African", emoji: "🌍" },
                      { id: "latino", name: "Latino/Hispanic", emoji: "🌎" },
                      { id: "mixed", name: "Mixed", emoji: "🌐" },
                    ].map((ethnicity) => (
                      <div
                        key={ethnicity.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox id={ethnicity.id} />
                        <label
                          htmlFor={ethnicity.id}
                          className="text-sm cursor-pointer"
                        >
                          {ethnicity.emoji} {ethnicity.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Desired Country (for Au Pair filter only) */}
            {filterType === "aupair" && (
              <>
                <div>
                  <Label className="mb-3 block">Where do you wanna do?</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {[
                      { flag: "🇺🇸", name: "USA" },
                      { flag: "🇯🇵", name: "Japan" },
                      { flag: "🇦🇺", name: "Australia" },
                      { flag: "🇬🇧", name: "UK" },
                      { flag: "🇫🇷", name: "France" },
                      { flag: "🇪🇸", name: "Spain" },
                      { flag: "🇨🇦", name: "Canada" },
                      { flag: "🇰🇷", name: "Korea" },
                      { flag: "🇨🇳", name: "China" },
                    ].map((country) => (
                      <div
                        key={country.name}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox id={`desired-${country.name}`} />
                        <label
                          htmlFor={`desired-${country.name}`}
                          className="text-sm cursor-pointer"
                        >
                          {country.flag} {country.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Primary Language */}
            <div>
              <Label className="mb-3 block">1️⃣ Primary Language (Native)</Label>
              <div className="space-y-2">
                {[
                  "English",
                  "Japanese",
                  "Spanish",
                  "French",
                  "German",
                  "Portuguese",
                  "Italian",
                  "Korean",
                  "Chinese",
                ].map((lang) => (
                  <div key={lang} className="flex items-center space-x-2">
                    <Checkbox id={`primary-${lang}`} />
                    <label
                      htmlFor={`primary-${lang}`}
                      className="text-sm cursor-pointer"
                    >
                      {lang}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Secondary Language */}
            <div>
              <Label className="mb-3 block">2️⃣ Secondary Language</Label>
              <div className="space-y-2">
                {[
                  "English",
                  "Japanese",
                  "Spanish",
                  "French",
                  "German",
                  "Portuguese",
                  "Italian",
                  "Korean",
                  "Chinese",
                ].map((lang) => (
                  <div key={lang} className="flex items-center space-x-2">
                    <Checkbox id={`secondary-${lang}`} />
                    <label
                      htmlFor={`secondary-${lang}`}
                      className="text-sm cursor-pointer"
                    >
                      {lang}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Skills (for Au Pair) or Requirements (for Family) */}
            <div>
              <Label className="mb-3 block">
                {filterType === "aupair" ? "Skills" : "Requirements"}
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { emoji: "🏊", name: "Swimming" },
                  { emoji: "🍳", name: "Cooking" },
                  { emoji: "🎨", name: "Art" },
                  { emoji: "⚽", name: "Sports" },
                  { emoji: "🎸", name: "Music" },
                  { emoji: "💻", name: "Technology" },
                ].map((skill) => (
                  <div key={skill.name} className="flex items-center space-x-2">
                    <Checkbox id={skill.name} />
                    <label
                      htmlFor={skill.name}
                      className="text-sm cursor-pointer"
                    >
                      {skill.emoji} {skill.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Children Age (for Family filter only) */}
            {filterType === "family" && (
              <>
                <Separator />
                <div>
                  <Label className="mb-3 block">Children's Age</Label>
                  <div className="space-y-2">
                    {["0-2 years", "3-5 years", "6-10 years", "11+ years"].map(
                      (age) => (
                        <div key={age} className="flex items-center space-x-2">
                          <Checkbox id={age} />
                          <label
                            htmlFor={age}
                            className="text-sm cursor-pointer"
                          >
                            {age}
                          </label>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Nationality */}
            <div>
              <Label className="mb-3 block">🏴 Nationality</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {[
                  { flag: "🇯🇵", name: "Japan" },
                  { flag: "🇺🇸", name: "USA" },
                  { flag: "🇧🇷", name: "Brazil" },
                  { flag: "🇫🇷", name: "France" },
                  { flag: "🇮🇹", name: "Italy" },
                  { flag: "🇪🇸", name: "Spain" },
                  { flag: "🇬🇧", name: "UK" },
                  { flag: "🇲🇽", name: "Mexico" },
                  { flag: "🇦🇺", name: "Australia" },
                  { flag: "🇩🇪", name: "Germany" },
                ].map((country) => (
                  <div
                    key={country.name}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox id={`nationality-${country.name}`} />
                    <label
                      htmlFor={`nationality-${country.name}`}
                      className="text-sm cursor-pointer"
                    >
                      {country.flag} {country.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Duration */}
            <div>
              <Label className="mb-3 block">
                Minimum Duration: {duration[0]} months
              </Label>
              <Slider
                value={duration}
                onValueChange={setDuration}
                min={1}
                max={24}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1 month</span>
                <span>24 months</span>
              </div>
            </div>

            <Separator />

            {/* Availability Type */}
            <div>
              <Label className="mb-3 block">⏰ Availability Type</Label>
              <div className="space-y-2">
                {[
                  {
                    id: "fulltime",
                    name: "Full-time",
                    description: "5-7 days per week",
                  },
                  {
                    id: "parttime",
                    name: "Part-time",
                    description: "2-4 days per week",
                  },
                  {
                    id: "weekend",
                    name: "Weekends only",
                    description: "Saturday & Sunday",
                  },
                ].map((avail) => (
                  <div key={avail.id} className="flex items-start space-x-2">
                    <Checkbox id={`avail-${avail.id}`} />
                    <div className="flex-1">
                      <label
                        htmlFor={`avail-${avail.id}`}
                        className="text-sm cursor-pointer block"
                      >
                        {avail.name}
                      </label>
                      <p className="text-xs text-gray-500">
                        {avail.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Preferred Days */}
            <div>
              <Label className="mb-3 block">📆 Preferred Days</Label>
              <div className="space-y-2">
                {[
                  { id: "monday", name: "Monday", emoji: "📅" },
                  { id: "tuesday", name: "Tuesday", emoji: "📅" },
                  { id: "wednesday", name: "Wednesday", emoji: "📅" },
                  { id: "thursday", name: "Thursday", emoji: "📅" },
                  { id: "friday", name: "Friday", emoji: "📅" },
                  { id: "saturday", name: "Saturday", emoji: "🎉" },
                  { id: "sunday", name: "Sunday", emoji: "🎉" },
                ].map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox id={`day-${day.id}`} />
                    <label
                      htmlFor={`day-${day.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {day.emoji} {day.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Available From */}
            <div>
              <Label className="mb-3 block">Available From</Label>
              <div className="space-y-2">
                {[
                  "Immediately",
                  "Within 1 month",
                  "1-3 months",
                  "3-6 months",
                  "6+ months",
                ].map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox id={time} />
                    <label htmlFor={time} className="text-sm cursor-pointer">
                      {time}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Reset
          </Button>
          <Button onClick={() => onOpenChange(false)}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
