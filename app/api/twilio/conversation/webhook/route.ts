import { NextRequest, NextResponse } from "next/server";
import { ConversationRelayRequest, ConversationRelayResponse } from "@/types/twilio";
import { handleMainMenu } from "@/lib/hotlines/menu";
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

    const relayRequest: ConversationRelayRequest = {
      ConversationSid: conversationSid,
      CurrentInput: currentInput,
      CurrentInputType: currentInputType,
      Memory: memory,
      CurrentTask: currentTask || undefined,
    };

    let response: ConversationRelayResponse;

    // Check if user has selected a hotline from the menu
    const hotlineType = memoryObj.hotlineType as string | undefined;
    const step = memoryObj.step as string | undefined;

    // If no hotline selected yet, or still in menu/greeting phase, show main menu
    if (!hotlineType || step === "menu" || step === "greeting") {
      response = await handleMainMenu(relayRequest, memoryObj);
    } else {
      // Route to appropriate hotline handler based on selection
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
          // Fallback to menu if unknown hotline type
          response = await handleMainMenu(relayRequest, memoryObj);
      }
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

