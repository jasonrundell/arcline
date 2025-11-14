import { ConversationRelayRequest, ConversationRelayResponse } from "../types/twilio";

export async function handleMainMenu(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  const input = request.CurrentInput.toLowerCase().trim();
  const step = (memory.step as string) || "greeting";
  const updatedMemory: Record<string, unknown> = { ...memory };

  switch (step) {
    case "greeting":
      // First time caller - present menu
      updatedMemory.step = "menu";
      return {
        actions: [
          {
            say: "Welcome to ARCline, the ARC Raiders Multi-Hotline system. Please select an option by pressing a number. Press 1 for Extraction Request. Press 2 for Loot Locator. Press 3 for Scrappy's Chicken Line. Press 4 for Faction News. Press 5 for Event Alarm.",
            listen: true,
            remember: updatedMemory,
          },
        ],
      };

    case "menu":
      // User has selected an option
      const selection = input.match(/[1-5]/)?.[0];
      
      if (!selection) {
        // Invalid selection, repeat menu
        return {
          actions: [
            {
              say: "I didn't catch that. Please press 1 for Extraction, 2 for Loot, 3 for Scrappy, 4 for News, or 5 for Event Alarm.",
              listen: true,
              remember: updatedMemory,
            },
          ],
        };
      }

      // Map selection to hotline type
      const hotlineMap: Record<string, string> = {
        "1": "extraction",
        "2": "loot",
        "3": "chicken",
        "4": "gossip",
        "5": "alarm",
      };

      const hotlineType = hotlineMap[selection];
      updatedMemory.hotlineType = hotlineType;
      // Clear step so hotline handler starts fresh
      delete updatedMemory.step;
      
      // Confirm selection - next input will route to hotline handler
      const confirmations: Record<string, string> = {
        "1": "You selected Extraction Request. Please provide your location for extraction.",
        "2": "You selected Loot Locator. What are you looking for?",
        "3": "You selected Scrappy's Chicken Line. Welcome!",
        "4": "You selected Faction News. Say 'latest' for rumors or 'submit' to share gossip.",
        "5": "You selected Event Alarm. What time would you like to be alerted?",
      };

      return {
        actions: [
          {
            say: confirmations[selection],
            listen: true,
            remember: updatedMemory,
          },
        ],
      };

    default:
      updatedMemory.step = "greeting";
      return {
        actions: [
          {
            say: "Welcome to ARCline. Please select an option.",
            listen: true,
            remember: updatedMemory,
          },
        ],
      };
  }
}

