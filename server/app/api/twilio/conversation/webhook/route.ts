import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ConversationRelayRequest } from "@/types/twilio";
import { routeToHotline } from "@/lib/utils/router";

const webhookSchema = z.object({
  ConversationSid: z.string().min(1),
  CurrentInput: z.string(),
  CurrentInputType: z.string(),
  Memory: z.string(),
  CurrentTask: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data = {
      ConversationSid: formData.get("ConversationSid") as string,
      CurrentInput: formData.get("CurrentInput") as string,
      CurrentInputType: formData.get("CurrentInputType") as string,
      Memory: formData.get("Memory") as string,
      CurrentTask: formData.get("CurrentTask") as string | null,
    };

    const validated = webhookSchema.parse(data);
    const conversationSid = validated.ConversationSid;
    const currentInput = validated.CurrentInput;
    const currentInputType = validated.CurrentInputType;
    const memory = validated.Memory;
    const currentTask = validated.CurrentTask ?? null;

    // Parse memory JSON
    let memoryObj: Record<string, unknown> = {};
    try {
      memoryObj = memory ? JSON.parse(memory) : {};
    } catch {
      // Memory might be empty or invalid, use empty object
    }

    const relayRequest: ConversationRelayRequest = {
      ConversationSid: conversationSid,
      CurrentInput: currentInput,
      CurrentInputType: currentInputType,
      Memory: memory,
      CurrentTask: currentTask || undefined,
    };

    // Use centralized router for all routing decisions
    const response = await routeToHotline(relayRequest, memoryObj);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Twilio webhook error:", error);
    return NextResponse.json(
      {
        actions: [
          {
            say: "I'm experiencing technical difficulties. Please try again later.",
            listen: false,
          },
        ],
      },
      { status: 500 }
    );
  }
}
