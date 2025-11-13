"use client";

import HotlineCard from "./HotlineCard";

const hotlines = [
  {
    id: "extraction",
    title: "Extraction Request Hotline",
    description: "Automated in-universe extraction communication system",
    icon: "🚁",
    color: "arc-orange",
    href: "/hotline/extraction",
  },
  {
    id: "loot",
    title: "Loot Locator Hotline",
    description: "World item search bot for locating valuable resources",
    icon: "📦",
    color: "arc-cyan",
    href: "/hotline/loot",
  },
  {
    id: "chicken",
    title: "Scrappy's Chicken Line",
    description: "Fun sound clips and randomizers",
    icon: "🐔",
    color: "arc-sand",
    href: "/hotline/chicken",
  },
  {
    id: "gossip",
    title: "Faction News Line",
    description: "Community rumors and news updates",
    icon: "📢",
    color: "arc-cyan",
    href: "/hotline/gossip",
  },
  {
    id: "alarm",
    title: "Event Alarm",
    description: "Automated reminders for raid starts",
    icon: "⏰",
    color: "arc-orange",
    href: "/hotline/alarm",
  },
];

export default function HotlineGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {hotlines.map((hotline) => (
        <HotlineCard key={hotline.id} {...hotline} />
      ))}
    </div>
  );
}

