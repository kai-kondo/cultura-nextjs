"use client";

import { HandbookLayout } from "@/components/handbook/HandbookLayout";
import { HandbookSection } from "@/components/handbook/HandbookSection";

const navItems = [
  { title: "Getting Started", href: "/handbook/au-pair" },
  { title: "Communication", href: "/handbook/au-pair#communication" },
  { title: "Daily Life", href: "/handbook/au-pair#daily-life" },
  { title: "Culture", href: "/handbook/au-pair#culture" },
  { title: "Boundaries", href: "/handbook/au-pair#boundaries" },
];

export default function AuPairHandbookPage() {
  return (
    <HandbookLayout
      title="Au Pair Handbook"
      description="Everything you need to get started, build a great relationship with your host family, and enjoy your experience abroad."
      audienceLabel="For Au Pairs"
      currentPath="/handbook/au-pair"
      navItems={navItems}
    >
      <HandbookSection
        id="getting-started"
        title="Getting Started"
        description="Start your journey with confidence."
      >
        <p>
          Moving to a new country and living with a host family is exciting, but
          it can also feel overwhelming. Take time to understand expectations,
          ask questions early, and be open to learning.
        </p>
        <ul>
          <li>Introduce yourself clearly and warmly</li>
          <li>Understand your schedule and responsibilities</li>
          <li>Ask about house rules and expectations</li>
        </ul>
      </HandbookSection>

      <HandbookSection
        id="communication"
        title="Communication"
        description="Good communication builds trust."
      >
        <p>
          Honest and respectful communication is the foundation of a good
          relationship with your host family.
        </p>
        <ul>
          <li>Speak up early if something feels unclear</li>
          <li>Be respectful and calm during discussions</li>
          <li>Regular check-ins help prevent misunderstandings</li>
        </ul>
      </HandbookSection>

      <HandbookSection
        id="daily-life"
        title="Daily Life"
        description="Adjusting to a new routine."
      >
        <p>
          Each family has different routines. Flexibility and observation will
          help you adapt smoothly.
        </p>
        <ul>
          <li>Learn the household rhythm</li>
          <li>Be proactive in helping</li>
          <li>Respect shared spaces</li>
        </ul>
      </HandbookSection>

      <HandbookSection
        id="culture"
        title="Cultural Differences"
        description="Embrace and respect differences."
      >
        <p>
          Cultural differences are natural. Stay curious and open-minded rather
          than judgmental.
        </p>
        <ul>
          <li>Observe before reacting</li>
          <li>Ask questions respectfully</li>
          <li>Share your culture too</li>
        </ul>
      </HandbookSection>

      <HandbookSection
        id="boundaries"
        title="Boundaries & Respect"
        description="Healthy relationships need clear boundaries."
      >
        <p>
          Respecting personal space, time, and expectations is essential for a
          positive experience.
        </p>
        <ul>
          <li>Understand work vs personal time</li>
          <li>Respect privacy</li>
          <li>Communicate limits clearly</li>
        </ul>
      </HandbookSection>
    </HandbookLayout>
  );
}
