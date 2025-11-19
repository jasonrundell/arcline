import { ConversationRelayRequest, ConversationRelayResponse } from "../../types/twilio";
import { supabase } from "../supabase";

export async function handleLootHotline(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  const input = request.CurrentInput.toLowerCase().trim();
  const step = (memory.step as string) || "greeting";

  const updatedMemory: Record<string, unknown> = { ...memory, hotlineType: "loot" };

  switch (step) {
    case "greeting":
      updatedMemory.step = "search";
      return {
        actions: [
          {
            say: "Welcome to the Loot Locator Hotline. I can help you find valuable items in the ARC universe. What are you looking for?",
            listen: true,
            remember: updatedMemory,
          },
        ],
      };

    case "search":
      const searchTerm = request.CurrentInput;
      
      try {
        // Search for loot items matching the search term
        const { data, error } = await supabase
          .from("loot_items")
          .select("*")
          .ilike("name", `%${searchTerm}%`)
          .limit(5);

        if (error) throw error;

        if (data && data.length > 0) {
          const results = data
            .map((item) => `${item.name} at ${item.location}`)
            .join(". ");
          
          updatedMemory.step = "complete";
          return {
            actions: [
              {
                say: `I found ${data.length} item${data.length > 1 ? "s" : ""}: ${results}. Good hunting!`,
                listen: false,
                remember: updatedMemory,
              },
            ],
          };
        } else {
          updatedMemory.step = "retry";
          return {
            actions: [
              {
                say: "I couldn't find any items matching that search. Would you like to try a different search term?",
                listen: true,
                remember: updatedMemory,
              },
            ],
          };
        }
      } catch (error) {
        console.error("Error searching loot:", error);
        updatedMemory.step = "error";
        return {
          actions: [
            {
              say: "I'm experiencing technical difficulties with the loot database. Please try again later.",
              listen: false,
              remember: updatedMemory,
            },
          ],
        };
      }

    case "retry":
      updatedMemory.step = "search";
      return handleLootHotline(request, updatedMemory);

    default:
      updatedMemory.step = "greeting";
      return {
        actions: [
          {
            say: "Thank you for using the Loot Locator Hotline. Goodbye.",
            listen: false,
            remember: updatedMemory,
          },
        ],
      };
  }
}

