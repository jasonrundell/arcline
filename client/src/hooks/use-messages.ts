import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ScrappyMessage } from "@/types/database";
import { AppError, ERROR_CODES, handleError } from "@/lib/errors";

/**
 * Custom hook to fetch verified Scrappy messages from Supabase.
 *
 * Fetches all verified messages from the `scrappy_messages` table, sorted by
 * creation date in descending order (newest first).
 *
 * @returns {Object} React Query result object containing:
 *   - data: Array of ScrappyMessage objects, sorted by created_at descending
 *   - isLoading: Boolean indicating if the query is in progress
 *   - error: Error object if the query failed
 *   - refetch: Function to manually refetch messages
 *
 * @example
 * ```tsx
 * const { data: messages, isLoading } = useMessages();
 * if (isLoading) return <Loading />;
 * return <MessagesList messages={messages} />;
 * ```
 */
export const useMessages = () => {
  return useQuery({
    queryKey: ["scrappy_messages"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("scrappy_messages")
          .select("*")
          .eq("verified", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching messages:", error);
          throw new AppError(
            `Failed to fetch messages: ${error.message}`,
            ERROR_CODES.DATABASE_ERROR
          );
        }

        if (!data) {
          throw new AppError(
            "No messages data returned",
            ERROR_CODES.MISSING_DATA
          );
        }

        return data as ScrappyMessage[];
      } catch (error) {
        throw handleError(error);
      }
    },
  });
};
