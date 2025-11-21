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
import { handleListenIntelHotline } from "./listen-intel";
import { detectHotlineType } from "../utils/hotline-detection";

export async function handleSubmitIntelHotline(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  const step = (memory.step as string) || "greeting";
  const updatedMemory: Record<string, unknown> = {
    ...memory,
    hotlineType: "submit-intel",
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
      updatedMemory.step = "submitting";
      const greetingResponse =
        "Copy that. What intel have you got? Report what you've seen or heard. Speak clearly.";
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

    case "submitting":
      // User is submitting intel
      const intelContent = request.CurrentInput;

      // Check if user is trying to cancel or go back
      const submitInput = (intelContent || "").toLowerCase().trim();
      if (isEndCallRequest(submitInput)) {
        // User wants to end the call
        return createEndCallResponse(updatedMemory);
      } else if (isMenuNavigationRequest(submitInput)) {
        // User wants to cancel submission - return to main menu
        return createExitResponse(updatedMemory);
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

      // User has provided content - proceed with submission
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
      // After completing submission, allow user to do more or return to menu
      const completeInput = (request.CurrentInput || "").toLowerCase().trim();

      // Check for end call request first
      if (isEndCallRequest(completeInput)) {
        return createEndCallResponse(updatedMemory);
      } else if (isMenuNavigationRequest(completeInput)) {
        // Return to main menu
        return createExitResponse(updatedMemory);
      }

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
      } else if (
        completeInput.includes("latest") ||
        completeInput.includes("intel") ||
        completeInput.includes("news") ||
        completeInput.includes("read") ||
        completeInput.includes("listen")
      ) {
        // Switch to listen intel
        updatedMemory.hotlineType = "listen-intel";
        updatedMemory.step = "reading";
        delete updatedMemory.lastResponse;
        const listenRequest: ConversationRelayRequest = {
          ...request,
          CurrentInput: "",
          Memory: JSON.stringify(updatedMemory),
        };
        return await handleListenIntelHotline(listenRequest, updatedMemory);
      } else {
        // Default: offer to help with something else
        updatedMemory.step = "complete";
        return createContinueOrExitResponse(
          updatedMemory,
          "Copy that.",
          "submit more intel or get latest intel"
        );
      }

    default:
      // Return to main menu with natural Shani response
      return createExitResponse(updatedMemory);
  }
}
