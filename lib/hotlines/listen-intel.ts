import {
  ConversationRelayRequest,
  ConversationRelayResponse,
} from "../../types/twilio";
import { supabase } from "../supabase";
import { isRepeatRequest } from "../utils/repeat";
import {
  createExitResponse,
  createContinueOrExitResponse,
  isEndCallRequest,
  createEndCallResponse,
} from "../utils/exit";
import { handleExtractionHotline } from "./extraction";
import { handleLootHotline } from "./loot";
import { handleChickenHotline } from "./chicken";
import { handleSubmitIntelHotline } from "./submit-intel";
import { detectHotlineType } from "../utils/hotline-detection";

export async function handleListenIntelHotline(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  const step = (memory.step as string) || "greeting";
  const updatedMemory: Record<string, unknown> = {
    ...memory,
    hotlineType: "listen-intel",
  };

  // Check for end call request
  if (isEndCallRequest(request.CurrentInput)) {
    return createEndCallResponse(updatedMemory);
  }

  // Check for repeat request
  if (isRepeatRequest(request.CurrentInput) && memory.lastResponse) {
    return {
      actions: [
        {
          say: memory.lastResponse as string,
          listen: false,
          remember: updatedMemory,
        },
      ],
    };
  }

  switch (step) {
    case "greeting":
      // Immediately transition to reading step
      updatedMemory.step = "reading";
      // Recursively call to handle reading case with empty input
      const readingRequest = {
        ...request,
        CurrentInput: "", // Clear input for reading step
      };
      return await handleListenIntelHotline(readingRequest, updatedMemory);

    case "reading":
      console.log("Fetching intel from database...");
      console.log(
        "Supabase URL:",
        process.env.SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL ||
          "not set"
      );
      try {
        // Fetch a larger set of verified intel entries, then randomly select 3
        const { data: allVerifiedIntel, error } = await supabase
          .from("intel")
          .select("*")
          .eq("verified", true)
          .order("created_at", { ascending: false })
          .limit(50); // Fetch up to 50 entries to have a good pool for randomization

        if (error) {
          console.error("Supabase query error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          throw error;
        }

        // Randomly select 3 entries from the fetched results
        const data =
          allVerifiedIntel && allVerifiedIntel.length > 0
            ? allVerifiedIntel
                .sort(() => Math.random() - 0.5) // Shuffle array
                .slice(0, 3) // Take first 3
            : [];

        console.log("Intel data retrieved:", data?.length || 0, "items");

        if (data && data.length > 0) {
          const intelText = data
            .map((g, i) => `Intel ${i + 1}: ${g.content}`)
            .join(". ");

          updatedMemory.step = "complete";
          const successResponse = `Here's what's circulating in Speranza: ${intelText}.`;
          updatedMemory.lastResponse = successResponse;
          console.log("Returning intel response with", data.length, "items");
          return createContinueOrExitResponse(
            updatedMemory,
            successResponse,
            "Want to hear more intel?"
          );
        } else {
          updatedMemory.step = "complete";
          const noDataResponse =
            "Nothing new in the rumor mill right now. The underground's quiet.";
          updatedMemory.lastResponse = noDataResponse;
          console.log("No intel found in database");
          return createContinueOrExitResponse(
            updatedMemory,
            noDataResponse,
            "Want to hear more intel?"
          );
        }
      } catch (error) {
        console.error("Error fetching intel:", error);
        updatedMemory.step = "complete";
        const errorResponse =
          "Intel network's down due to a recent ARC attack. Give us some time to get it back up and running.";
        updatedMemory.lastResponse = errorResponse;
        return createContinueOrExitResponse(
          updatedMemory,
          errorResponse,
          "try again later"
        );
      }

    case "complete":
      // After completing an intel action, allow user to do more or return to menu
      const completeInput = (request.CurrentInput || "").toLowerCase().trim();

      // Check if user wants to switch to another hotline
      const targetHotline = detectHotlineType(completeInput);
      if (
        targetHotline &&
        targetHotline !== "submit-intel" &&
        targetHotline !== "listen-intel"
      ) {
        // Route to the detected hotline
        updatedMemory.hotlineType = targetHotline;
        delete updatedMemory.step;
        const hotlineRequest: ConversationRelayRequest = {
          ...request,
          CurrentInput: "",
          Memory: JSON.stringify(updatedMemory),
        };

        switch (targetHotline) {
          case "extraction":
            return await handleExtractionHotline(hotlineRequest, updatedMemory);
          case "loot":
            return await handleLootHotline(hotlineRequest, updatedMemory);
          case "chicken":
            return await handleChickenHotline(hotlineRequest, updatedMemory);
        }
      } else if (
        completeInput.includes("latest") ||
        completeInput.includes("intel") ||
        completeInput.includes("news") ||
        completeInput.includes("read") ||
        completeInput.includes("listen")
      ) {
        // Get latest intel again
        updatedMemory.step = "reading";
        const readingRequest = {
          ...request,
          CurrentInput: "",
        };
        return await handleListenIntelHotline(readingRequest, updatedMemory);
      } else if (
        completeInput.includes("submit") ||
        completeInput.includes("share") ||
        completeInput.includes("report")
      ) {
        // Switch to submit intel
        updatedMemory.hotlineType = "submit-intel";
        updatedMemory.step = "submitting";
        delete updatedMemory.lastResponse;
        const submitRequest: ConversationRelayRequest = {
          ...request,
          CurrentInput: "",
          Memory: JSON.stringify(updatedMemory),
        };
        return await handleSubmitIntelHotline(submitRequest, updatedMemory);
      } else {
        // Default: offer to help with something else
        updatedMemory.step = "complete";
        return createContinueOrExitResponse(
          updatedMemory,
          "Copy that.",
          "Want to hear more intel?"
        );
      }

    default:
      // Return to main menu with natural Shani response
      return createExitResponse(updatedMemory);
  }
}
