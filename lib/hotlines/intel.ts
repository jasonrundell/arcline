import {
  ConversationRelayRequest,
  ConversationRelayResponse,
} from "../../types/twilio";
import { supabase } from "../supabase";

export async function handleIntelHotline(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  const step = (memory.step as string) || "greeting";
  const updatedMemory: Record<string, unknown> = {
    ...memory,
    hotlineType: "intel",
  };

  switch (step) {
    case "greeting":
      updatedMemory.step = "menu";
      return {
        actions: [
          {
            say: "Okay. Do you want the latest intel or to submit intel?",
            listen: true,
            remember: updatedMemory,
          },
        ],
      };

    case "menu":
      // Normalize input: lowercase, trim, remove punctuation for better matching
      const rawInput = request.CurrentInput || "";
      const input = rawInput
        .toLowerCase()
        .trim()
        .replace(/[.,!?]/g, "");
      console.log(
        "Intel menu - raw input:",
        rawInput,
        "normalized:",
        input,
        "step:",
        step,
        "memory:",
        JSON.stringify(memory)
      );

      // Check for "latest" first (exact match or contains)
      if (
        input === "latest" ||
        input.includes("latest") ||
        input.includes("what's new") ||
        input.includes("whats new") ||
        input === "news" ||
        input.includes("rumor") ||
        input.includes("rumors") ||
        input.includes("intel")
      ) {
        console.log(
          "User requested latest intel, transitioning to reading step"
        );
        // Transition to reading step and fetch intel immediately
        updatedMemory.step = "reading";
        // Recursively call to handle reading case with empty input
        const readingRequest = {
          ...request,
          CurrentInput: "", // Clear input for reading step
        };
        return await handleIntelHotline(readingRequest, updatedMemory);
      } else if (
        input === "submit" ||
        input.includes("submit") ||
        input.includes("share") ||
        input.includes("report")
      ) {
        console.log(
          "User requested to submit intel, transitioning to submitting step"
        );
        updatedMemory.step = "submitting";
        return {
          actions: [
            {
              say: "Copy that. What intel have you got? Report what you've seen or heard. Speak clearly.",
              listen: true,
              remember: updatedMemory,
            },
          ],
        };
      } else {
        console.log(
          "Unrecognized input in intel menu, asking for clarification"
        );
        return {
          actions: [
            {
              say: "Didn't catch that, Raider. Speak clearly. Say 'latest' for current intel, or 'submit' to report what you've heard. What's your call?",
              listen: true,
              remember: updatedMemory,
            },
          ],
        };
      }

    case "reading":
      console.log("Fetching intel from database...");
      console.log(
        "Supabase URL:",
        process.env.SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL ||
          "not set"
      );
      try {
        const { data, error } = await supabase
          .from("gossip")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) {
          console.error("Supabase query error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          throw error;
        }

        console.log("Intel data retrieved:", data?.length || 0, "items");

        if (data && data.length > 0) {
          const intelText = data
            .map((g, i) => `Intel ${i + 1}: ${g.content}`)
            .join(". ");

          updatedMemory.step = "complete";
          console.log("Returning intel response with", data.length, "items");
          return {
            actions: [
              {
                say: `Here's what's circulating in Speranza: ${intelText}. Stay sharp, Raider. That's all the intel I've got.`,
                listen: false,
                remember: updatedMemory,
              },
            ],
          };
        } else {
          updatedMemory.step = "complete";
          console.log("No intel found in database");
          return {
            actions: [
              {
                say: "Nothing new in the rumor mill right now. The underground's quiet. Check back after your next run topside.",
                listen: false,
                remember: updatedMemory,
              },
            ],
          };
        }
      } catch (error) {
        console.error("Error fetching intel:", error);
        updatedMemory.step = "complete";
        return {
          actions: [
            {
              say: "Intel network's down. Can't access the rumor database right now. Try again after you've made it back topside.",
              listen: false,
              remember: updatedMemory,
            },
          ],
        };
      }

    case "submitting":
      const intelContent = request.CurrentInput;
      const phoneNumber = (memory.phoneNumber as string) || "unknown";

      try {
        await supabase.from("gossip").insert({
          content: intelContent,
          faction: "Raider Report",
          verified: false,
        });

        updatedMemory.step = "complete";
        return {
          actions: [
            {
              say: "Intel logged. Your report's been added to the network. We'll verify it with other Raiders. Stay safe out there.",
              listen: false,
              remember: updatedMemory,
            },
          ],
        };
      } catch (error) {
        console.error("Error submitting intel:", error);
        updatedMemory.step = "complete";
        return {
          actions: [
            {
              say: "Failed to log your intel. Network's having issues. Try submitting again after your next extraction.",
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
            say: "Faction intel channel closing. Stay alert, Raider. Watch your back topside.",
            listen: false,
            remember: updatedMemory,
          },
        ],
      };
  }
}
