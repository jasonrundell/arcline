import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ScrappyMessage } from "@/types/database";

export const useMessages = () => {
  return useQuery({
    queryKey: ["scrappy_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scrappy_messages")
        .select("*")
        .eq("verified", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching messages:", error);
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }

      if (!data) {
        throw new Error("No messages data returned");
      }

      return data as ScrappyMessage[];
    },
  });
};
