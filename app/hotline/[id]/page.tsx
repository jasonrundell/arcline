import { notFound } from "next/navigation";
import HotlineDetail from "@/components/HotlineDetail";

// Single phone number for all hotlines
const MAIN_PHONE_NUMBER = process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER || "+18722825463";

const hotlineInfo: Record<string, { title: string; description: string; phoneNumber: string; menuOption: number }> = {
  extraction: {
    title: "Extraction Request Hotline",
    description: "Call to request an extraction from your current location. Press 1 when calling.",
    phoneNumber: MAIN_PHONE_NUMBER,
    menuOption: 1,
  },
  loot: {
    title: "Loot Locator Hotline",
    description: "Search for valuable items in the ARC universe. Press 2 when calling.",
    phoneNumber: MAIN_PHONE_NUMBER,
    menuOption: 2,
  },
  chicken: {
    title: "Scrappy's Chicken Line",
    description: "Fun sound clips and randomizers with Scrappy. Press 3 when calling.",
    phoneNumber: MAIN_PHONE_NUMBER,
    menuOption: 3,
  },
  gossip: {
    title: "Faction News Line",
    description: "Hear the latest rumors or submit your own gossip. Press 4 when calling.",
    phoneNumber: MAIN_PHONE_NUMBER,
    menuOption: 4,
  },
  alarm: {
    title: "Event Alarm",
    description: "Set automated reminders for raid starts. Press 5 when calling.",
    phoneNumber: MAIN_PHONE_NUMBER,
    menuOption: 5,
  },
};

export default function HotlinePage({ params }: { params: { id: string } }) {
  const hotline = hotlineInfo[params.id];

  if (!hotline) {
    notFound();
  }

  return <HotlineDetail id={params.id} {...hotline} menuOption={hotline.menuOption} />;
}

