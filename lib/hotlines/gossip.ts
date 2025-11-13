import { ConversationRelayRequest, ConversationRelayResponse } from "@/types/twilio";
import { supabase } from "@/lib/supabase";

export async function handleGossipHotline(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  const step = (memory.step as string) || "greeting";
  const updatedMemory: Record<string, unknown> = { ...memory, hotlineType: "gossip" };

  switch (step) {
    case "greeting":
      updatedMemory.step = "menu";
      return {
        actions: [
          {
            say: "Welcome to the Faction Gossip Line. Say 'latest' to hear the latest rumors, or 'submit' to share your own gossip.",
            listen: true,
            remember: updatedMemory,
          },
        ],
      };

    case "menu":
      const input = request.CurrentInput.toLowerCase().trim();
      
      if (input.includes("latest") || input.includes("news") || input.includes("rumor")) {
        updatedMemory.step = "reading";
        return handleGossipHotline(request, updatedMemory);
      } else if (input.includes("submit") || input.includes("share")) {
        updatedMemory.step = "submitting";
        return {
          actions: [
            {
              say: "Please share your gossip or rumor now.",
              listen: true,
              remember: updatedMemory,
            },
          ],
        };
      } else {
        return {
          actions: [
            {
              say: "I didn't understand. Say 'latest' for rumors or 'submit' to share gossip.",
              listen: true,
              remember: updatedMemory,
            },
          ],
        };
      }

    case "reading":
      try {
        const { data, error } = await supabase
          .from("gossip")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;

        if (data && data.length > 0) {
          const gossipText = data
            .map((g, i) => `Rumor ${i + 1}: ${g.content}`)
            .join(". ");
          
          updatedMemory.step = "complete";
          return {
            actions: [
              {
                say: `Here's the latest gossip: ${gossipText}. That's all for now!`,
                listen: false,
                remember: updatedMemory,
              },
            ],
          };
        } else {
          updatedMemory.step = "complete";
          return {
            actions: [
              {
                say: "No gossip available at the moment. Check back later!",
                listen: false,
                remember: updatedMemory,
              },
            ],
          };
        }
      } catch (error) {
        console.error("Error fetching gossip:", error);
        updatedMemory.step = "complete";
        return {
          actions: [
            {
              say: "I'm having trouble accessing the gossip database. Please try again later.",
              listen: false,
              remember: updatedMemory,
            },
          ],
        };
      }

    case "submitting":
      const gossipContent = request.CurrentInput;
      const phoneNumber = memory.phoneNumber as string || "unknown";
      
      try {
        await supabase.from("gossip").insert({
          content: gossipContent,
          verified: false,
        });
        
        updatedMemory.step = "complete";
        return {
          actions: [
            {
              say: "Thank you for your submission! Your gossip has been logged and will be reviewed.",
              listen: false,
              remember: updatedMemory,
            },
          ],
        };
      } catch (error) {
        console.error("Error submitting gossip:", error);
        updatedMemory.step = "complete";
        return {
          actions: [
            {
              say: "I'm sorry, there was an error submitting your gossip. Please try again later.",
              listen: false,
              remember: updatedMemory,
            },
          ],
        };
      }

    default:
      updatedMemory.step = "greeting";
      return {
        actions: [
          {
            say: "Thank you for using the Faction Gossip Line. Goodbye.",
            listen: false,
            remember: updatedMemory,
          },
        ],
      };
  }
}

