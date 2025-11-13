import { NextRequest, NextResponse } from "next/server";
import { ConversationRelayRequest, ConversationRelayResponse } from "@/types/twilio";
import { handleExtractionHotline } from "@/lib/hotlines/extraction";
import { handleLootHotline } from "@/lib/hotlines/loot";
import { handleChickenHotline } from "@/lib/hotlines/chicken";
import { handleGossipHotline } from "@/lib/hotlines/gossip";
import { handleAlarmHotline } from "@/lib/hotlines/alarm";

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

    // Determine hotline type from memory or task
    const hotlineType = (memoryObj.hotlineType as string) || 
                       (currentTask?.toLowerCase().includes("extraction") ? "extraction" :
                        currentTask?.toLowerCase().includes("loot") ? "loot" :
                        currentTask?.toLowerCase().includes("chicken") ? "chicken" :
                        currentTask?.toLowerCase().includes("gossip") ? "gossip" :
                        currentTask?.toLowerCase().includes("alarm") ? "alarm" :
                        "extraction"); // default

    const relayRequest: ConversationRelayRequest = {
      ConversationSid: conversationSid,
      CurrentInput: currentInput,
      CurrentInputType: currentInputType,
      Memory: memory,
      CurrentTask: currentTask || undefined,
    };

    let response: ConversationRelayResponse;

    // Route to appropriate hotline handler
    switch (hotlineType) {
      case "extraction":
        response = await handleExtractionHotline(relayRequest, memoryObj);
        break;
      case "loot":
        response = await handleLootHotline(relayRequest, memoryObj);
        break;
      case "chicken":
        response = await handleChickenHotline(relayRequest, memoryObj);
        break;
      case "gossip":
        response = await handleGossipHotline(relayRequest, memoryObj);
        break;
      case "alarm":
        response = await handleAlarmHotline(relayRequest, memoryObj);
        break;
      default:
        response = {
          actions: [
            {
              say: "I'm sorry, I didn't understand which hotline you're trying to reach. Please try again.",
              listen: true,
            },
          ],
        };
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

