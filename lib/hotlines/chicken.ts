import { ConversationRelayRequest, ConversationRelayResponse } from "../../types/twilio";

const chickenSounds = [
  "Cluck cluck! Scrappy's here!",
  "Bawk bawk! That's a good one!",
  "Chicken power activated!",
  "Scrappy says: Stay safe out there!",
  "Bok bok! You're doing great!",
  "Cluck! That's the spirit!",
];

export async function handleChickenHotline(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  const step = (memory.step as string) || "greeting";
  const updatedMemory: Record<string, unknown> = { ...memory, hotlineType: "chicken" };

  switch (step) {
    case "greeting":
      const randomSound = chickenSounds[Math.floor(Math.random() * chickenSounds.length)];
      updatedMemory.step = "playing";
      return {
        actions: [
          {
            say: `Welcome to Scrappy's Chicken Line! ${randomSound}`,
            listen: true,
            remember: updatedMemory,
          },
        ],
      };

    case "playing":
      const nextSound = chickenSounds[Math.floor(Math.random() * chickenSounds.length)];
      updatedMemory.step = "continue";
      return {
        actions: [
          {
            say: nextSound,
            listen: true,
            remember: updatedMemory,
          },
        ],
      };

    case "continue":
      const input = request.CurrentInput.toLowerCase().trim();
      if (input.includes("bye") || input.includes("exit") || input.includes("goodbye")) {
        updatedMemory.step = "complete";
        return {
          actions: [
            {
              say: "Thanks for calling Scrappy's Chicken Line! Cluck cluck!",
              listen: false,
              remember: updatedMemory,
            },
          ],
        };
      }
      updatedMemory.step = "playing";
      return handleChickenHotline(request, updatedMemory);

    default:
      updatedMemory.step = "greeting";
      return {
        actions: [
          {
            say: "Thank you for calling Scrappy's Chicken Line! Goodbye!",
            listen: false,
            remember: updatedMemory,
          },
        ],
      };
  }
}

