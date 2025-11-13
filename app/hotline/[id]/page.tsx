import { notFound } from "next/navigation";
import HotlineDetail from "@/components/HotlineDetail";

const hotlineInfo: Record<string, { title: string; description: string; phoneNumber?: string }> = {
  extraction: {
    title: "Extraction Request Hotline",
    description: "Call to request an extraction from your current location.",
    phoneNumber: process.env.NEXT_PUBLIC_TWILIO_EXTRACTION_NUMBER || "+1234567890",
  },
  loot: {
    title: "Loot Locator Hotline",
    description: "Search for valuable items in the ARC universe.",
    phoneNumber: process.env.NEXT_PUBLIC_TWILIO_LOOT_NUMBER || "+1234567890",
  },
  chicken: {
    title: "Scrappy's Chicken Line",
    description: "Fun sound clips and randomizers with Scrappy.",
    phoneNumber: process.env.NEXT_PUBLIC_TWILIO_CHICKEN_NUMBER || "+1234567890",
  },
  gossip: {
    title: "Faction Gossip Line",
    description: "Hear the latest rumors or submit your own gossip.",
    phoneNumber: process.env.NEXT_PUBLIC_TWILIO_GOSSIP_NUMBER || "+1234567890",
  },
  alarm: {
    title: "Wake-Up Call / Raid Alarm",
    description: "Set automated reminders for raid starts.",
    phoneNumber: process.env.NEXT_PUBLIC_TWILIO_ALARM_NUMBER || "+1234567890",
  },
};

export default function HotlinePage({ params }: { params: { id: string } }) {
  const hotline = hotlineInfo[params.id];

  if (!hotline) {
    notFound();
  }

  return <HotlineDetail id={params.id} {...hotline} />;
}

