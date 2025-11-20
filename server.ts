// Load environment variables from .env.local or .env file
import dotenv from "dotenv";
import { resolve } from "path";

// Load .env first, then .env.local (so .env.local overrides .env)
dotenv.config({ path: resolve(process.cwd(), ".env") });
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import Fastify from "fastify";
import { WebSocketServer } from "ws";
import formbody from "@fastify/formbody";
import twilio from "twilio";
import { routeToHotline, handleDTMFSelection } from "./lib/utils/router";
import {
  ConversationRelayRequest,
  ConversationRelayResponse,
} from "./types/twilio";
import { isEndCallRequest, createEndCallResponse } from "./lib/utils/exit";

const fastify = Fastify({ logger: true });
const PORT = process.env.PORT || 8080;
const DOMAIN = process.env.DOMAIN || "localhost:8080";

// Register form body parser for Twilio webhooks
fastify.register(formbody);

// Store active call sessions
const sessions = new Map<string, Record<string, unknown>>();

// Store phone numbers by call SID (from TwiML request)
const phoneNumbersByCallSid = new Map<string, string>();

// Initialize Twilio client for SMS and call info
function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    return null;
  }
  return twilio(accountSid, authToken);
}

/**
 * Sends a text message via WebSocket and ends the call if listen is false
 * @param ws - WebSocket connection
 * @param text - Text to send
 * @param shouldListen - Whether to continue listening (if false, call will end)
 */
function sendTextAndEndIfNeeded(
  ws: any,
  text: string,
  shouldListen: boolean
): void {
  ws.send(
    JSON.stringify({
      type: "text",
      token: text,
      last: !shouldListen,
    })
  );

  // If we shouldn't listen, send an end message after a short delay
  // to allow the text to be spoken before ending the call
  if (!shouldListen) {
    setTimeout(() => {
      ws.send(
        JSON.stringify({
          type: "end",
        })
      );
    }, 2000); // Wait 2 seconds for the message to be spoken
  }
}

// Voice configuration for all hotlines
// Uses Shani's voice (1hlpeD1ydbI2ow0Tt3EW) for all hotlines
const VOICE_CONFIG = {
  ttsProvider: "ElevenLabs",
  voice: "1hlpeD1ydbI2ow0Tt3EW", // Shani's voice
  language: "en-GB",
};

// TwiML endpoint - returns instructions for ConversationRelay webhook
fastify.get("/twiml", async (request, reply) => {
  // Get caller's phone number from query params
  const callSid = (request.query as { CallSid?: string })?.CallSid;
  const fromNumber = (request.query as { From?: string })?.From;

  // Store phone number if we have both callSid and fromNumber
  if (callSid && fromNumber) {
    phoneNumbersByCallSid.set(callSid, fromNumber);
    console.log("Stored phone number for call:", { callSid, fromNumber });
  }

  // Auto-detect domain from request headers (works with ngrok)
  // Priority: DOMAIN env var (if not localhost) > Host header > fallback to localhost
  let domain = DOMAIN;

  // If DOMAIN is still localhost, try to get it from the request
  if (domain.includes("localhost") && request.headers.host) {
    domain = request.headers.host;
  }

  // Use wss:// for WebSocket connection (ngrok provides HTTPS/WSS)
  // According to official docs: url attribute on <ConversationRelay> is for WebSocket connections
  const protocol = domain.includes("localhost") ? "ws" : "wss";
  const websocketUrl = `${protocol}://${domain}/ws`;

  // Use WebSocket mode as documented in official Twilio ConversationRelay docs
  // Voice configuration: Set ttsProvider, voice, and language attributes
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay 
      url="${websocketUrl}" 
      ttsProvider="${VOICE_CONFIG.ttsProvider}"
      voice="${VOICE_CONFIG.voice}"
      language="${VOICE_CONFIG.language}"
    />
  </Connect>
</Response>`;

  reply.type("application/xml").send(twiml);
});

// WebSocket server for ConversationRelay
const wss = new WebSocketServer({ noServer: true });

fastify.server.on("upgrade", (request, socket, head) => {
  if (request.url === "/ws") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on("connection", (ws, request) => {
  let callSid: string | undefined;
  let conversationSid: string | undefined;

  ws.on("message", async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case "setup":
          console.log("Setting up ConversationRelay connection");
          callSid = message.callSid;
          conversationSid = message.conversationSid;

          if (!callSid) {
            console.error("No call SID in setup message");
            return;
          }

          // Store call SID on WebSocket for later use
          (ws as any).callSid = callSid;
          (ws as any).conversationSid = conversationSid;

          // Try to get phone number from stored map or fetch from Twilio
          let phoneNumber = phoneNumbersByCallSid.get(callSid);
          if (!phoneNumber) {
            // Try to fetch from Twilio API
            const twilioClient = getTwilioClient();
            if (twilioClient) {
              try {
                const call = await twilioClient.calls(callSid).fetch();
                phoneNumber = call.from;
                if (phoneNumber) {
                  phoneNumbersByCallSid.set(callSid, phoneNumber);
                }
              } catch (error) {
                console.error("Error fetching call info from Twilio:", error);
              }
            }
          }

          // Initialize session memory with phone number if available
          const initialMemory: Record<string, unknown> = {
            step: "greeting",
          };
          if (phoneNumber) {
            initialMemory.phoneNumber = phoneNumber;
            console.log("Stored phone number in session:", phoneNumber);
          }
          sessions.set(callSid, initialMemory);

          // Send greeting with menu
          const greetingResponse = await routeToHotline(
            {
              ConversationSid: conversationSid || "",
              CurrentInput: "",
              CurrentInputType: "setup",
              Memory: JSON.stringify(initialMemory),
            },
            initialMemory
          );

          // Update session memory with the updated memory from greeting response
          if (greetingResponse.actions[0]?.remember) {
            sessions.set(callSid, greetingResponse.actions[0].remember);
          }

          // Send greeting message
          // When last: false, ConversationRelay automatically listens, so no separate listen command needed
          sendTextAndEndIfNeeded(
            ws,
            greetingResponse.actions[0]?.say || "Welcome to ARCline.",
            greetingResponse.actions[0]?.listen ?? true
          );
          break;

        case "prompt":
          console.log("Received prompt:", message.voicePrompt);

          if (!callSid) {
            console.error("No call SID available");
            return;
          }

          const memory = sessions.get(callSid) || {};
          const currentInput = message.voicePrompt || "";

          // Check for end call request first, before any routing
          if (isEndCallRequest(currentInput)) {
            const endCallResponse = createEndCallResponse(memory);
            sendTextAndEndIfNeeded(
              ws,
              endCallResponse.actions[0]?.say ||
                "Copy that, Raider. Stay safe out there. Goodbye.",
              false
            );
            return;
          }

          const hotlineType = memory.hotlineType as string | undefined;
          const step = memory.step as string | undefined;

          console.log("Prompt routing - current state:", {
            hotlineType: hotlineType || "(none)",
            step: step || "(none)",
            input: currentInput,
          });

          // Check for DTMF input first
          const dtmfResponse = handleDTMFSelection(currentInput, step, memory);
          if (dtmfResponse) {
            // DTMF was processed - update session and send confirmation
            if (dtmfResponse.actions[0]?.remember) {
              sessions.set(callSid, dtmfResponse.actions[0].remember);
            } else {
              sessions.set(callSid, memory);
            }

            // Send DTMF confirmation
            const shouldListen = dtmfResponse.actions[0]?.listen ?? true;
            sendTextAndEndIfNeeded(
              ws,
              dtmfResponse.actions[0]?.say || "Processing your request.",
              shouldListen
            );
            return;
          }

          // Use centralized router for all routing decisions
          const request = {
            ConversationSid: conversationSid || "",
            CurrentInput: currentInput,
            CurrentInputType: "voice" as const,
            Memory: JSON.stringify(memory),
          };

          const response = await routeToHotline(request, memory);
          console.log("Server - received response from router:", {
            hasActions: !!response.actions,
            actionCount: response.actions?.length,
            firstActionSay: response.actions?.[0]?.say,
            firstActionListen: response.actions?.[0]?.listen,
          });

          // Update memory from response
          if (response.actions[0]?.remember) {
            const updatedMemory = response.actions[0].remember as Record<
              string,
              unknown
            >;
            sessions.set(callSid, updatedMemory);

            // Log the selected hotline after processing
            const selectedHotline = updatedMemory.hotlineType as
              | string
              | undefined;
            if (selectedHotline && !hotlineType) {
              console.log("Menu selection detected:", {
                selectedHotline,
                input: currentInput,
              });
            }
          }

          // Send response text
          // When last: false, ConversationRelay automatically listens after speech
          // When last: true, ConversationRelay stops listening
          if (response.actions[0]?.say) {
            const updatedMemory = response.actions[0]?.remember as
              | Record<string, unknown>
              | undefined;

            // Check if this is a loot lookup that needs to continue automatically
            // If so, don't end the call even if listen is false
            const isLootLookup =
              updatedMemory?.hotlineType === "loot" &&
              updatedMemory?.step === "looking_up" &&
              callSid;

            const shouldListen = isLootLookup
              ? true
              : response.actions[0].listen ?? false;
            sendTextAndEndIfNeeded(ws, response.actions[0].say, shouldListen);

            // If step is "looking_up" for loot hotline, automatically continue to lookup
            if (isLootLookup) {
              // Wait a moment for "One sec" to be spoken, then trigger lookup
              const currentCallSid = callSid; // Capture for closure
              setTimeout(async () => {
                const lookupMemory =
                  sessions.get(currentCallSid) || updatedMemory || {};
                const lookupResponse = await routeToHotline(
                  {
                    ConversationSid: conversationSid || "",
                    CurrentInput: "",
                    CurrentInputType: "voice",
                    Memory: JSON.stringify(lookupMemory),
                  },
                  lookupMemory
                );

                // Update session memory
                if (lookupResponse.actions[0]?.remember && currentCallSid) {
                  sessions.set(
                    currentCallSid,
                    lookupResponse.actions[0].remember
                  );
                }

                // Send the lookup result
                if (lookupResponse.actions[0]?.say) {
                  const shouldListenAfter =
                    lookupResponse.actions[0].listen ?? false;
                  sendTextAndEndIfNeeded(
                    ws,
                    lookupResponse.actions[0].say,
                    shouldListenAfter
                  );
                }
              }, 1000); // Wait 1 second for "One sec" to be spoken
            }
          } else if (response.actions[0]?.listen) {
            // Edge case: no text to say but want to start listening
            ws.send(
              JSON.stringify({
                type: "listen",
              })
            );
          }
          break;

        case "interrupt":
          console.log("Handling interruption");
          // Could implement interruption handling here
          break;

        case "error":
          // Twilio sends error messages for transcription issues, audio quality, etc.
          // These are typically non-fatal informational messages
          console.log("Twilio error message:", {
            error: message.error || message.message || "Unknown error",
            details: message.details || message,
          });
          // Continue listening - don't disrupt the conversation flow
          break;

        case "dtmf":
          console.log("Received DTMF:", message.dtmf);

          if (!callSid) {
            console.error("No call SID available");
            return;
          }

          const dtmfDigit = message.dtmf;
          if (dtmfDigit >= "1" && dtmfDigit <= "5") {
            const memory = sessions.get(callSid) || {};
            const hotlineMap: Record<string, string> = {
              "1": "extraction",
              "2": "loot",
              "3": "chicken",
              "4": "submit-intel",
              "5": "listen-intel",
            };

            memory.hotlineType = hotlineMap[dtmfDigit];
            memory.step = undefined;
            sessions.set(callSid, memory);

            const confirmations: Record<string, string> = {
              "1": "You selected Extraction Request. Please provide your location for extraction.",
              "2": "You selected Loot Locator. What are you looking for?",
              "3": "You selected Scrappy's Chicken Line. Welcome!",
              "4": "You selected Submit Intel. What intel have you got?",
              "5": "You selected Listen to Intel. Fetching the latest intel now.",
            };

            // Send confirmation and continue listening (last: false automatically listens)
            ws.send(
              JSON.stringify({
                type: "text",
                token: confirmations[dtmfDigit],
                last: false,
              })
            );
          } else {
            // Send error message and continue listening (last: false automatically listens)
            ws.send(
              JSON.stringify({
                type: "text",
                token: "Invalid selection. Please press 1, 2, 3, 4, or 5.",
                last: false,
              })
            );
          }
          break;

        default:
          console.warn("Unknown message type:", message.type);
          break;
      }
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
      sendTextAndEndIfNeeded(
        ws,
        "I'm experiencing technical difficulties. Please try again later.",
        false
      );
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    if (callSid) {
      sessions.delete(callSid);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// ConversationRelay webhook endpoint
fastify.post("/api/twilio/conversation/webhook", async (request, reply) => {
  try {
    // Twilio sends form-urlencoded data
    const body = request.body as Record<string, string> | undefined;
    const conversationSid = body?.ConversationSid || "";
    const currentInput = body?.CurrentInput || "";
    const currentInputType = body?.CurrentInputType || "voice";
    const memory = body?.Memory || "{}";
    const currentTask = body?.CurrentTask || null;

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

    // Check for DTMF input first
    const step = memoryObj.step as string | undefined;
    const dtmfResponse = handleDTMFSelection(currentInput, step, memoryObj);

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

    reply.type("application/json").send(response);
  } catch (error) {
    console.error("Twilio webhook error:", error);
    reply.status(500).send({
      actions: [
        {
          say: "I'm experiencing technical difficulties. Please try again later.",
          listen: false,
        },
      ],
    });
  }
});

// Health check endpoint
fastify.get("/health", async (request, reply) => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: Number(PORT), host: "0.0.0.0" });
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`TwiML endpoint: http://localhost:${PORT}/twiml`);
    console.log(
      `Webhook endpoint: http://localhost:${PORT}/api/twilio/conversation/webhook`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
