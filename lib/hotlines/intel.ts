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
  isMenuNavigationRequest,
} from "../utils/exit";
import { handleExtractionHotline } from "./extraction";
import { handleLootHotline } from "./loot";
import { handleChickenHotline } from "./chicken";
import { detectHotlineType } from "../utils/hotline-detection";

export async function handleIntelHotline(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  const step = (memory.step as string) || "greeting";
  const updatedMemory: Record<string, unknown> = {
    ...memory,
    hotlineType: "intel",
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
      updatedMemory.step = "menu";
      const greetingResponse =
        "Okay. Do you want the latest intel or to submit intel?";
      updatedMemory.lastResponse = greetingResponse;
      return {
        actions: [
          {
            say: greetingResponse,
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

      // Check for "submit" FIRST to avoid "submit intel" matching the "latest" condition
      if (
        input === "submit" ||
        input.includes("submit") ||
        input.includes("share") ||
        input.includes("report")
      ) {
        console.log(
          "User requested to submit intel, transitioning to submitting step"
        );
        updatedMemory.step = "submitting";
        const submittingPrompt =
          "Copy that. What intel have you got? Report what you've seen or heard. Speak clearly.";
        updatedMemory.lastResponse = submittingPrompt;
        return {
          actions: [
            {
              say: submittingPrompt,
              listen: true,
              remember: updatedMemory,
            },
          ],
        };
      } else if (
        // Check for "latest" after submit to avoid conflicts
        input === "latest" ||
        input.includes("latest") ||
        input.includes("what's new") ||
        input.includes("whats new") ||
        input === "news" ||
        input.includes("rumor") ||
        input.includes("rumors") ||
        // Only match "intel" if it's not part of "submit intel"
        (input.includes("intel") && !input.includes("submit"))
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
      } else {
        console.log(
          "Unrecognized input in intel menu, asking for clarification"
        );
        const clarificationResponse =
          "Didn't catch that, Raider. Speak clearly. Say 'latest' for current intel, or 'submit' to report what you've heard. What's your call?";
        updatedMemory.lastResponse = clarificationResponse;
        return {
          actions: [
            {
              say: clarificationResponse,
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
            "get more intel or submit intel"
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
            "get more intel or submit intel"
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

    case "submitting":
      // Only submit if we're in the submitting step (user explicitly requested to submit)
      const intelContent = request.CurrentInput;

      // Check if user is trying to cancel or go back
      const submitInput = (intelContent || "").toLowerCase().trim();
      if (isMenuNavigationRequest(submitInput)) {
        // User wants to cancel submission
        updatedMemory.step = "menu";
        const cancelResponse =
          "Copy that. Cancelled. Do you want the latest intel or to submit intel?";
        updatedMemory.lastResponse = cancelResponse;
        return {
          actions: [
            {
              say: cancelResponse,
              listen: true,
              remember: updatedMemory,
            },
          ],
        };
      }

      // Validate that we have actual content to submit (not empty or just keywords)
      if (!intelContent || intelContent.trim().length === 0) {
        const emptyResponse =
          "Didn't catch that. What intel have you got? Report what you've seen or heard. Speak clearly.";
        updatedMemory.lastResponse = emptyResponse;
        return {
          actions: [
            {
              say: emptyResponse,
              listen: true,
              remember: updatedMemory,
            },
          ],
        };
      }

      // User has explicitly requested to submit and provided content - proceed with submission
      const phoneNumber = (memory.phoneNumber as string) || "unknown";

      try {
        await supabase.from("intel").insert({
          content: intelContent,
          faction: "Raider Report",
          verified: false,
        });

        updatedMemory.step = "complete";
        const submitSuccessResponse =
          "Intel logged. Your report's been added to the network. We'll verify it with other Raiders. Stay safe out there.";
        updatedMemory.lastResponse = submitSuccessResponse;
        return createContinueOrExitResponse(
          updatedMemory,
          submitSuccessResponse,
          "submit more intel or get latest intel"
        );
      } catch (error) {
        console.error("Error submitting intel:", error);
        updatedMemory.step = "complete";
        const submitErrorResponse =
          "Failed to log your intel. Network's having issues. Try submitting again after your next extraction.";
        updatedMemory.lastResponse = submitErrorResponse;
        return createContinueOrExitResponse(
          updatedMemory,
          submitErrorResponse,
          "try submitting again"
        );
      }

    case "complete":
      // After completing an intel action, allow user to do more or return to menu
      const completeInput = (request.CurrentInput || "").toLowerCase().trim();

      // Check if user wants to switch to another hotline
      const targetHotline = detectHotlineType(completeInput);
      if (targetHotline && targetHotline !== "intel") {
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
      } else if (isMenuNavigationRequest(completeInput)) {
        // Return to main menu
        return createExitResponse(updatedMemory);
      } else if (
        completeInput.includes("latest") ||
        completeInput.includes("intel") ||
        completeInput.includes("news") ||
        completeInput.includes("read")
      ) {
        // Get latest intel again
        updatedMemory.step = "reading";
        const readingRequest = {
          ...request,
          CurrentInput: "",
        };
        return await handleIntelHotline(readingRequest, updatedMemory);
      } else if (
        completeInput.includes("submit") ||
        completeInput.includes("share") ||
        completeInput.includes("report")
      ) {
        // Submit intel again
        updatedMemory.step = "submitting";
        const submittingPrompt =
          "Copy that. What intel have you got? Report what you've seen or heard. Speak clearly.";
        updatedMemory.lastResponse = submittingPrompt;
        return {
          actions: [
            {
              say: submittingPrompt,
              listen: true,
              remember: updatedMemory,
            },
          ],
        };
      } else {
        // Default: offer to help with something else
        updatedMemory.step = "complete";
        return createContinueOrExitResponse(
          updatedMemory,
          "Copy that.",
          "get more intel or submit intel"
        );
      }

    default:
      // Return to main menu with natural Shani response
      return createExitResponse(updatedMemory);
  }
}
