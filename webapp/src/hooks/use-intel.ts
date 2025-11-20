import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Intel } from "@/types/database";
import { AppError, ERROR_CODES, handleError } from "@/lib/errors";

export const useIntel = () => {
  return useQuery({
    queryKey: ["intel", "Raider Report"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("intel")
          .select("*")
          .eq("faction", "Raider Report")
          .eq("verified", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching intel:", error);
          throw new AppError(
            `Failed to fetch intel: ${error.message}`,
            ERROR_CODES.DATABASE_ERROR
          );
        }

        if (!data) {
          throw new AppError(
            "No intel data returned",
            ERROR_CODES.MISSING_DATA
          );
        }

        return data as Intel[];
      } catch (error) {
        throw handleError(error);
      }
    },
  });
};
