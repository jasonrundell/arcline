import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleMainMenu } from '../../../lib/hotlines/menu';
import { handleExtractionHotline } from '../../../lib/hotlines/extraction';
import { handleLootHotline } from '../../../lib/hotlines/loot';
import { handleChickenHotline } from '../../../lib/hotlines/chicken';
import { handleGossipHotline } from '../../../lib/hotlines/gossip';
import { handleAlarmHotline } from '../../../lib/hotlines/alarm';
import { ConversationRelayRequest, ConversationRelayResponse } from '../../../types/twilio';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Twilio sends form-urlencoded data
    // Vercel automatically parses form data into req.body
    const body = req.body || {};
    const conversationSid = body.ConversationSid as string;
    const currentInput = (body.CurrentInput || '') as string;
    const currentInputType = (body.CurrentInputType || 'voice') as string;
    const memory = (body.Memory || '{}') as string;
    const currentTask = (body.CurrentTask || null) as string | null;

    // Parse memory JSON
    let memoryObj: Record<string, unknown> = {};
    try {
      memoryObj = memory ? JSON.parse(memory) : {};
    } catch {
      // Memory might be empty or invalid, use empty object
    }

    const relayRequest: ConversationRelayRequest = {
      ConversationSid: conversationSid,
      CurrentInput: currentInput || '',
      CurrentInputType: currentInputType || 'voice',
      Memory: memory || '{}',
      CurrentTask: currentTask || undefined,
    };

    let response: ConversationRelayResponse;

    // Check if user has selected a hotline from the menu
    const hotlineType = memoryObj.hotlineType as string | undefined;
    const step = memoryObj.step as string | undefined;

    // Handle DTMF input for menu selection
    const input = (currentInput || '').toLowerCase().trim();
    const dtmfMatch = input.match(/[1-5]/);
    
    // If no hotline selected yet, or still in menu/greeting phase, show main menu
    if (!hotlineType || step === "menu" || step === "greeting") {
      // Handle DTMF input for menu selection
      if (dtmfMatch && step === "menu") {
        const selection = dtmfMatch[0];
        const hotlineMap: Record<string, string> = {
          "1": "extraction",
          "2": "loot",
          "3": "chicken",
          "4": "gossip",
          "5": "alarm",
        };

        memoryObj.hotlineType = hotlineMap[selection];
        memoryObj.step = undefined; // Clear step so hotline handler starts fresh

        const confirmations: Record<string, string> = {
          "1": "You selected Extraction Request. Please provide your location for extraction.",
          "2": "You selected Loot Locator. What are you looking for?",
          "3": "You selected Scrappy's Chicken Line. Welcome!",
          "4": "You selected Faction News. Say 'latest' for rumors or 'submit' to share gossip.",
          "5": "You selected Event Alarm. What time would you like to be alerted?",
        };

        response = {
          actions: [
            {
              say: confirmations[selection],
              listen: true,
              remember: memoryObj,
            },
          ],
        };
      } else {
        response = await handleMainMenu(relayRequest, memoryObj);
      }
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

    res.status(200).json(response);
  } catch (error) {
    console.error("Twilio webhook error:", error);
    res.status(500).json({
      actions: [
        {
          say: "I'm experiencing technical difficulties. Please try again later.",
          listen: false,
        },
      ],
    });
  }
}

