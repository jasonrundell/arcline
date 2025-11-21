import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Get the webhook URL for ConversationRelay
  // Use the request host header, or fall back to environment variables
  const host =
    req.headers.host || process.env.VERCEL_URL || "arcline-relay.vercel.app";
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const webhookUrl = `wss://arcline-relay.vercel.app`;
  const webhookPath = `${webhookUrl}/ws`;

  // Voice configuration: Set ttsProvider, voice, and language attributes on ConversationRelay
  // Uses Shani's voice (1hlpeD1ydbI2ow0Tt3EW) for all hotlines (matching server.ts)
  // Examples:
  // - Google: ttsProvider="Google" voice="en-GB-Journey-F" language="en-GB"
  // - Amazon: ttsProvider="Amazon" voice="Joanna-Neural" language="en-US"
  // - ElevenLabs: ttsProvider="ElevenLabs" voice="1hlpeD1ydbI2ow0Tt3EW" language="en-GB"
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="${webhookUrl}"
      ttsProvider="ElevenLabs"
      voice="1hlpeD1ydbI2ow0Tt3EW"
      language="en-GB"
    />
  </Connect>
</Response>`;

  res.setHeader("Content-Type", "application/xml");
  res.status(200).send(twiml);
}
