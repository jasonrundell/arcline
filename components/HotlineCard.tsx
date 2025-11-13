"use client";

import Link from "next/link";

interface HotlineCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  href: string;
}

export default function HotlineCard({
  title,
  description,
  icon,
  color,
  href,
}: HotlineCardProps) {
  return (
    <Link
      href={href}
      className="panel terminal-border p-6 rounded-lg hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-arc-cyan"
      aria-label={`Access ${title}`}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h2 className={`text-2xl font-bold mb-2 text-${color}`}>{title}</h2>
      <p className="text-arc-gray text-sm">{description}</p>
      <div className="mt-4 text-arc-cyan text-sm uppercase tracking-wider">
        Access Hotline →
      </div>
    </Link>
  );
}

