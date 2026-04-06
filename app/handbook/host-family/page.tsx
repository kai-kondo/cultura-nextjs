
"use client";

import { HandbookLayout } from "@/components/handbook/HandbookLayout";
import { HandbookSection } from "@/components/handbook/HandbookSection";

const navItems = [
  { title: "Getting Started", href: "/handbook/host-family#getting-started" },
  { title: "Preparation", href: "/handbook/host-family#preparation" },
  { title: "Communication", href: "/handbook/host-family#communication" },
  { title: "Daily Life", href: "/handbook/host-family#daily-life" },
  { title: "Boundaries", href: "/handbook/host-family#boundaries" },
];

export default function HostFamilyHandbookPage() {
  return (
    <HandbookLayout
      title="Host Family Handbook"
      description="Practical guidance for preparing your home, welcoming your au pair, and building a respectful and supportive experience together."
      audienceLabel="For Host Families"
      currentPath="/handbook/host-family"
      navItems={navItems}
    >
      <HandbookSection
        id="getting-started"
        title="Getting Started"
        description="Build a strong foundation before your au pair arrives."
      >
        <p>
          A successful au pair experience usually begins with clear expectations,
          thoughtful preparation, and open communication. Taking time to prepare
          in advance helps your home feel more welcoming and organized.
        </p>
        <ul>
          <li>Clarify schedules, responsibilities, and priorities</li>
          <li>Prepare your home so your au pair feels expected and welcomed</li>
          <li>Think about how you will introduce routines and family values</li>
        </ul>
      </HandbookSection>

      <HandbookSection
        id="preparation"
        title="Preparation"
        description="Help your au pair settle in with confidence."
      >
        <p>
          Small details can make a big difference during the first few days.
          A prepared environment helps reduce uncertainty and makes it easier for
          your au pair to adjust.
        </p>
        <ul>
          <li>Prepare a private and comfortable space</li>
          <li>Share practical information like transport, meals, and house routines</li>
          <li>Explain important contacts, emergency basics, and daily expectations</li>
        </ul>
      </HandbookSection>

      <HandbookSection
        id="communication"
        title="Communication"
        description="Clear, respectful communication builds trust over time."
      >
        <p>
          Regular communication helps prevent misunderstandings and creates a more
          supportive relationship. It is often better to discuss small issues early
          rather than wait until they become stressful.
        </p>
        <ul>
          <li>Set regular check-ins for honest conversations</li>
          <li>Be direct, kind, and specific when giving feedback</li>
          <li>Encourage your au pair to ask questions and share concerns</li>
        </ul>
      </HandbookSection>

      <HandbookSection
        id="daily-life"
        title="Daily Life"
        description="Consistency and clarity help everyone adjust smoothly."
      >
        <p>
          Day-to-day life becomes easier when routines are explained clearly and
          reinforced with patience. A predictable structure helps children, parents,
          and au pairs feel more comfortable.
        </p>
        <ul>
          <li>Explain the rhythm of your household clearly</li>
          <li>Share what flexibility is expected and when routines are fixed</li>
          <li>Recognize effort and progress during the adjustment period</li>
        </ul>
      </HandbookSection>

      <HandbookSection
        id="boundaries"
        title="Boundaries & Respect"
        description="Healthy boundaries create a stronger living environment."
      >
        <p>
          Because an au pair lives in your home, it is especially important to be
          thoughtful about privacy, personal time, and mutual respect. Clear boundaries
          support both trust and comfort.
        </p>
        <ul>
          <li>Discuss working hours and personal time clearly</li>
          <li>Respect privacy and personal space</li>
          <li>Create a home culture where expectations are fair and respectful</li>
        </ul>
      </HandbookSection>
    </HandbookLayout>
  );
}