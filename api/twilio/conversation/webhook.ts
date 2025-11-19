import type { VercelRequest, VercelResponse } from '@vercel/node';
import { routeToHotline, handleDTMFSelection } from '../../../lib/utils/router';
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
      response = await routeToHotline(hotlineRequest, dtmfResponse.actions[0]?.remember || memoryObj);
    } else {
      // Use centralized router for all routing decisions
      response = await routeToHotline(relayRequest, memoryObj);
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

