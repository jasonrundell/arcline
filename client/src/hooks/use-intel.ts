import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Intel } from "@/types/database";
import { AppError, ERROR_CODES, handleError } from "@/lib/errors";

/**
 * Custom hook to fetch verified Intel reports from Supabase.
 *
 * Fetches all verified Intel reports with faction "Raider Report" from the
 * `intel` table, sorted by creation date in descending order (newest first).
 *
 * @returns {Object} React Query result object containing:
 *   - data: Array of Intel objects with faction "Raider Report", sorted by created_at descending
 *   - isLoading: Boolean indicating if the query is in progress
 *   - error: Error object if the query failed
 *   - refetch: Function to manually refetch intel reports
 *
 * @example
 * ```tsx
 * const { data: intel, isLoading } = useIntel();
 * if (isLoading) return <Loading />;
 * return <IntelList reports={intel} />;
 * ```
 */
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
