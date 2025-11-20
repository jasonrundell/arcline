import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Intel } from "@/types/database";

export const useIntel = () => {
  return useQuery({
    queryKey: ["intel", "Raider Report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intel")
        .select("*")
        .eq("faction", "Raider Report")
        .eq("verified", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching intel:", error);
        throw new Error(`Failed to fetch intel: ${error.message}`);
      }

      if (!data) {
        throw new Error("No intel data returned");
      }

      return data as Intel[];
    },
  });
};
