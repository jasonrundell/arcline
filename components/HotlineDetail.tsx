"use client";

import Link from "next/link";

interface HotlineDetailProps {
  id: string;
  title: string;
  description: string;
  phoneNumber: string;
  menuOption?: number;
}

export default function HotlineDetail({
  id,
  title,
  description,
  phoneNumber,
  menuOption,
}: HotlineDetailProps) {
  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href="/"
          className="text-arc-cyan hover:text-arc-sand mb-8 inline-block"
          aria-label="Back to home"
        >
          ← Back to Hotlines
        </Link>

        <div className="panel terminal-border p-8 rounded-lg">
          <h1 className="text-4xl font-bold mb-4 text-arc-cyan">{title}</h1>
          <p className="text-lg text-arc-gray mb-8">{description}</p>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-arc-gray mb-2">Phone Number:</p>
              <p className="text-2xl font-mono text-arc-sand">{phoneNumber}</p>
              {menuOption && (
                <p className="text-sm text-arc-gray mt-2">
                  When calling, press <span className="text-arc-orange font-bold">{menuOption}</span> to select this option.
                </p>
              )}
            </div>
            <button
              onClick={handleCall}
              className="btn-primary w-full"
              aria-label={`Call ${title}`}
            >
              Call Now
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-arc-gray/30">
            <h2 className="text-xl font-bold mb-4 text-arc-orange">How it works:</h2>
            <ul className="space-y-2 text-arc-gray">
              {id === "extraction" && (
                <>
                  <li>• Call the hotline and provide your location</li>
                  <li>• Your extraction request will be logged</li>
                  <li>• An extraction team will be dispatched</li>
                </>
              )}
              {id === "loot" && (
                <>
                  <li>• Call and describe what you're looking for</li>
                  <li>• The system will search the loot database</li>
                  <li>• Receive location information for items</li>
                </>
              )}
              {id === "chicken" && (
                <>
                  <li>• Call to hear fun sound clips from Scrappy</li>
                  <li>• Each call features random messages</li>
                  <li>• Perfect for a quick morale boost!</li>
                </>
              )}
              {id === "gossip" && (
                <>
                  <li>• Say "latest" to hear recent rumors</li>
                  <li>• Say "submit" to share your own gossip</li>
                  <li>• Stay informed about faction activities</li>
                </>
              )}
              {id === "alarm" && (
                <>
                  <li>• Provide the time for your alarm</li>
                  <li>• Set a custom message</li>
                  <li>• Receive your wake-up call automatically</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

