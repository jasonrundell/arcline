/**
 * Seed script to populate the gossip table with lore-based rumors
 * Run with: npx tsx scripts/seed-gossip.ts
 */

// Load environment variables from .env.local or .env file
import dotenv from "dotenv";
import { resolve } from "path";

// Load .env first, then .env.local (so .env.local overrides .env)
dotenv.config({ path: resolve(process.cwd(), ".env") });
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const gossipEntries = [
  // Shani-related gossip
  {
    content:
      "Shani's been working triple shifts in the security room. Some say she's spotted something big moving in the Rust Belt. Others think she's just being paranoid again.",
    faction: "Speranza Security",
    verified: false,
  },
  {
    content:
      "Heard from a Raider who made it back from the Dam that Shani's contingency plans have contingency plans. She's got escape routes mapped for every possible ARC attack pattern.",
    faction: "Speranza Security",
    verified: false,
  },
  {
    content:
      "Celeste and Shani had a closed-door meeting that lasted three hours. Word is they're planning something big—maybe an evacuation protocol? Shani's the only one who knows Speranza's weak points.",
    faction: "Speranza Leadership",
    verified: false,
  },
  {
    content:
      "Shani's been stockpiling Raider Hatch Keys. Someone saw her inventory and there's way more than usual. She's either expecting trouble or planning something.",
    faction: "Speranza Security",
    verified: false,
  },

  // Apollo-related gossip
  {
    content:
      "Apollo's been quieter than usual. Usually he's fixing something or running that kids' football team, but he's been holed up in his workshop for days. Wonder what he's building?",
    faction: "Speranza Community",
    verified: false,
  },
  {
    content:
      "Overheard Apollo talking about his old settlement. He mentioned 'Victory Ridge' before catching himself. That's where Tian Wen lost her mother. Coincidence?",
    faction: "Speranza Community",
    verified: false,
  },
  {
    content:
      "Apollo's new grenade design? He calls it 'field-tested' but I saw the burns on his hands. That man's either brave or crazy. Probably both.",
    faction: "Speranza Traders",
    verified: false,
  },
  {
    content:
      "Someone asked Apollo about his past and he deflected with a joke about pants. That's his tell—he's hiding something about where he came from.",
    faction: "Speranza Community",
    verified: false,
  },

  // Celeste-related gossip
  {
    content:
      "Celeste's been reviewing old evacuation plans. She's been in the archives every night this week. Something's got her worried about Speranza's future.",
    faction: "Speranza Leadership",
    verified: false,
  },
  {
    content:
      "Rumor has it Celeste lost her father during the First Wave. That's why she's so determined to keep Speranza safe. She won't lose another home.",
    faction: "Speranza History",
    verified: false,
  },
  {
    content:
      "Celeste's been trading more aggressively for Exodus Modules. Those are for off-world travel. Is she planning something, or just being prepared?",
    faction: "Speranza Traders",
    verified: false,
  },
  {
    content:
      "Heard Celeste talking to Shani about 'the next wave.' They think ARC is planning something bigger than usual. That's why security's been so tight.",
    faction: "Speranza Leadership",
    verified: false,
  },

  // Lance-related gossip
  {
    content:
      "Lance was boxing in the ring again last night. He's getting better at pulling his punches, but someone said they saw him react to a name he shouldn't know. Like he remembered something.",
    faction: "Speranza Clinic",
    verified: false,
  },
  {
    content:
      "Lance mentioned seeing other androids at Stella Montis. He said they looked 'very much like me.' That's got people wondering—where did Lance really come from?",
    faction: "Speranza Clinic",
    verified: false,
  },
  {
    content:
      "Lance's amnesia might not be as complete as he says. He fixed a piece of tech the other day using knowledge he claims not to remember. Muscle memory, or something else?",
    faction: "Speranza Clinic",
    verified: false,
  },
  {
    content:
      "Lance joined midnight karaoke again. He's trying so hard to fit in, but there's something sad about it. Like he's searching for something he can't name.",
    faction: "Speranza Community",
    verified: false,
  },

  // Tian Wen-related gossip
  {
    content:
      "Tian Wen hasn't opened her workshop door in weeks. Some say she's working on a weapon prototype. Others think she's hiding something about her mother's squad.",
    faction: "Speranza Traders",
    verified: false,
  },
  {
    content:
      "Tian Wen lost her mother at Victory Ridge during the First Wave. That's why she's so reclusive. The pain's still fresh, even after all these years.",
    faction: "Speranza History",
    verified: false,
  },
  {
    content:
      "Someone saw Tian Wen with an old action figure. She was fixing it, being gentle. That gruff exterior? It's armor. She cares more than she lets on.",
    faction: "Speranza Community",
    verified: false,
  },
  {
    content:
      "Tian Wen's been asking Raiders to find old outpost stashes. She's looking for something specific—maybe related to her mother's unit? The Battle of Victory Ridge left a lot of unanswered questions.",
    faction: "Speranza Traders",
    verified: false,
  },

  // Scrappy-related gossip
  {
    content:
      "Scrappy's been collecting more materials than usual. That rooster's been around longer than most of us. Some say he's seen things—survived ARC attacks that wiped out whole settlements.",
    faction: "Speranza Workshop",
    verified: false,
  },
  {
    content:
      "Scrappy appeared the day I moved into Speranza. No one knows where he came from. He just... was there. Like he'd always been waiting.",
    faction: "Speranza Workshop",
    verified: false,
  },
  {
    content:
      "Upgraded Scrappy to Master Hoarder tier and he's bringing back rare materials I've never seen. That rooster's got better instincts than most Raiders.",
    faction: "Speranza Workshop",
    verified: false,
  },

  // General Speranza gossip
  {
    content:
      "The Exodus happened years ago, but some of the wealthy who stayed behind are planning their own escape. Heard they're hoarding resources for a private evacuation.",
    faction: "Speranza Underground",
    verified: false,
  },
  {
    content:
      "ARC machines are getting smarter. A Raider reported seeing a Matriarch coordinate with Hornets. They're learning. Adapting. That's bad news for all of us.",
    faction: "Rust Belt Intelligence",
    verified: false,
  },
  {
    content:
      "The Rust Belt's changing. New toxic zones, strange ecologies. ARC's influence is reshaping the surface. Some say it's terraforming. Others say it's something worse.",
    faction: "Rust Belt Intelligence",
    verified: false,
  },
  {
    content:
      "Acerra Spaceport's still operational. The wealthy who escaped during the Exodus are up there, safe in orbit. Meanwhile, we're down here fighting for scraps.",
    faction: "Speranza Underground",
    verified: false,
  },
  {
    content:
      "The First Wave nearly wiped us out, but we learned ARC's weaknesses. The Dam battle proved we can fight back. Now we just need to survive long enough to do it again.",
    faction: "Speranza History",
    verified: false,
  },
  {
    content:
      "Raiders are finding more ARC parts topside. The machines are multiplying faster than before. Shani's been tracking the patterns—she thinks they're preparing for something.",
    faction: "Speranza Security",
    verified: false,
  },
  {
    content:
      "Someone's been sabotaging extraction routes. Hatch keys going missing, routes being blocked. Shani's investigating, but she suspects it's an inside job.",
    faction: "Speranza Security",
    verified: false,
  },
  {
    content:
      "The Underground's getting crowded. More refugees every week, but resources are getting scarcer. Celeste is doing her best, but something's got to give.",
    faction: "Speranza Community",
    verified: false,
  },
];

async function seedGossip() {
  console.log("Starting gossip seed...");
  console.log(`Preparing to insert ${gossipEntries.length} gossip entries`);

  // Clear existing gossip (optional - comment out if you want to keep existing entries)
  // const { error: deleteError } = await supabase.from("gossip").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  // if (deleteError) {
  //   console.error("Error clearing existing gossip:", deleteError);
  // } else {
  //   console.log("Cleared existing gossip entries");
  // }

  // Insert gossip entries
  const { data, error } = await supabase
    .from("gossip")
    .insert(gossipEntries)
    .select();

  if (error) {
    console.error("Error seeding gossip:", error);
    process.exit(1);
  }

  console.log(`Successfully seeded ${data?.length || 0} gossip entries!`);
  console.log("\nSample entries:");
  data?.slice(0, 3).forEach((entry, i) => {
    console.log(
      `${i + 1}. [${entry.faction || "Unknown"}] ${entry.content.substring(
        0,
        80
      )}...`
    );
  });
}

seedGossip()
  .then(() => {
    console.log("\nSeed completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
