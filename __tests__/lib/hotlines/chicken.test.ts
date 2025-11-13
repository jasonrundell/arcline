import { handleChickenHotline } from "@/lib/hotlines/chicken";
import { ConversationRelayRequest } from "@/types/twilio";

describe("Chicken Hotline", () => {
  const createRequest = (
    input: string,
    memory: Record<string, unknown> = {}
  ): ConversationRelayRequest => ({
    ConversationSid: "test-sid",
    CurrentInput: input,
    CurrentInputType: "text",
    Memory: JSON.stringify(memory),
  });

  it("should greet user on first call", async () => {
    const request = createRequest("hello");
    const response = await handleChickenHotline(request, {});

    expect(response.actions).toHaveLength(1);
    expect(response.actions[0].say).toContain("Scrappy");
    expect(response.actions[0].listen).toBe(true);
  });

  it("should handle goodbye message", async () => {
    const request = createRequest("bye", { step: "continue" });
    const response = await handleChickenHotline(request, { step: "continue" });

    expect(response.actions[0].say).toContain("Thanks");
    expect(response.actions[0].listen).toBe(false);
  });

  it("should continue playing sounds on regular input", async () => {
    const request = createRequest("more", { step: "continue" });
    const response = await handleChickenHotline(request, { step: "continue" });

    expect(response.actions[0].listen).toBe(true);
  });
});

