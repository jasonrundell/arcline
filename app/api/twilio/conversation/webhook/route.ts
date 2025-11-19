import { NextRequest, NextResponse } from "next/server";
import {
  ConversationRelayRequest,
  ConversationRelayResponse,
} from "@/types/twilio";
import { routeToHotline, handleDTMFSelection } from "@/lib/utils/router";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const conversationSid = formData.get("ConversationSid") as string;
    const currentInput = formData.get("CurrentInput") as string;
    const currentInputType = formData.get("CurrentInputType") as string;
    const memory = formData.get("Memory") as string;
    const currentTask = formData.get("CurrentTask") as string | null;

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

    // Check for DTMF input first
    const step = memoryObj.step as string | undefined;
    const dtmfResponse = handleDTMFSelection(currentInput, step, memoryObj);

    let response: ConversationRelayResponse;
    if (dtmfResponse) {
      // DTMF was processed - route to selected hotline with empty input
      const hotlineRequest: ConversationRelayRequest = {
        ...relayRequest,
        CurrentInput: "",
      };
      response = await routeToHotline(
        hotlineRequest,
        dtmfResponse.actions[0]?.remember || memoryObj
      );
    } else {
      // Use centralized router for all routing decisions
      response = await routeToHotline(relayRequest, memoryObj);
    }

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
