import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ScrappyMessage } from "@/types/database";
import { AppError, ERROR_CODES, handleError } from "@/lib/errors";

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
