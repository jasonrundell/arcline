"use client";

import { useState, useEffect } from "react";

export default function Header() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const clearCache = async () => {
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      // Reload the page to get fresh content
      window.location.reload();
    }
  };

  return (
    <header className="w-full border-b border-arc-gray/30 bg-arc-black/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-arc-cyan glow-cyan" : "bg-arc-gray"}`} 
               aria-label={isOnline ? "Online" : "Offline"} />
          <span className="text-sm text-arc-gray uppercase tracking-wider">
            {isOnline ? "System Online" : "Offline Mode"}
          </span>
        </div>
        <button
          onClick={clearCache}
          className="btn-secondary text-sm px-4 py-2"
          aria-label="Clear cache and check for updates"
        >
          Clear Cache
        </button>
      </div>
    </header>
  );
}

