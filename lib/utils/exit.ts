import { ConversationRelayResponse } from "../../types/twilio";

/**
 * Creates a natural exit message that allows users to return to main menu or continue
 * @param memory - Current memory object to update
 * @param customMessage - Optional custom message, otherwise uses default
 * @returns ConversationRelayResponse with natural exit message
 */
export function createExitResponse(
  memory: Record<string, unknown>,
  customMessage?: string
): ConversationRelayResponse {
  const updatedMemory: Record<string, unknown> = {
    ...memory,
  };

  // Remove hotline type to return to main menu
  delete updatedMemory.hotlineType;
  updatedMemory.step = "menu";

  const exitMessage =
    customMessage ||
    "Copy that. What else do you need, Raider? I can help with extraction, resources, Scrappy, or Speranza intel.";

  updatedMemory.lastResponse = exitMessage;

  return {
    actions: [
      {
        say: exitMessage,
        listen: true,
        remember: updatedMemory,
      },
    ],
  };
}

/**
 * Creates a response that offers to help with more options or return to menu
 * @param memory - Current memory object to update
 * @param contextMessage - Message about what was just completed
 * @param continueOption - Option to continue with current hotline (e.g., "search for more loot")
 * @returns ConversationRelayResponse
 */
export function createContinueOrExitResponse(
  memory: Record<string, unknown>,
  contextMessage: string,
  continueOption: string
): ConversationRelayResponse {
  const updatedMemory: Record<string, unknown> = {
    ...memory,
  };

  const response = `${contextMessage} Anything else you need help with? I can ${continueOption}, or you can ask about extraction, Scrappy, or Speranza intel.`;
  updatedMemory.lastResponse = response;

  return {
    actions: [
      {
        say: response,
        listen: true,
        remember: updatedMemory,
      },
    ],
  };
}

/**
 * Checks if the user input indicates they want to end the call
 * @param input - User input to check
 * @returns true if user wants to end the call
 */
export function isEndCallRequest(input: string): boolean {
  const normalized = input.toLowerCase().trim();
  return (
    normalized === "goodbye" ||
    normalized === "bye" ||
    normalized === "see ya" ||
    normalized === "see you" ||
    normalized === "later" ||
    normalized === "laters" ||
    normalized.includes("goodbye") ||
    normalized.includes(" see ya") ||
    normalized.includes(" see you") ||
    (normalized.includes("later") && !normalized.includes("get"))
  );
}

/**
 * Creates a response that ends the call
 * @param memory - Current memory object to update
 * @param customMessage - Optional custom goodbye message
 * @returns ConversationRelayResponse that ends the call
 */
export function createEndCallResponse(
  memory: Record<string, unknown>,
  customMessage?: string
): ConversationRelayResponse {
  const updatedMemory: Record<string, unknown> = {
    ...memory,
  };

  const goodbyeMessage =
    customMessage || "Copy that, Raider. Stay safe out there. Goodbye.";

  updatedMemory.lastResponse = goodbyeMessage;

  return {
    actions: [
      {
        say: goodbyeMessage,
        listen: false, // End the call by not listening for more input
        remember: updatedMemory,
      },
    ],
  };
}

