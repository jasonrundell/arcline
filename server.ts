// Load environment variables from .env.local or .env file
import dotenv from "dotenv";
import { resolve } from "path";

// Load .env first, then .env.local (so .env.local overrides .env)
dotenv.config({ path: resolve(process.cwd(), ".env") });
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import Fastify from "fastify";
import { WebSocketServer } from "ws";
import formbody from "@fastify/formbody";
import { handleMainMenu } from "./lib/hotlines/menu";
import { handleExtractionHotline } from "./lib/hotlines/extraction";
import { handleLootHotline } from "./lib/hotlines/loot";
import { handleChickenHotline } from "./lib/hotlines/chicken";
import { handleIntelHotline } from "./lib/hotlines/intel";
import { handleAlarmHotline } from "./lib/hotlines/alarm";
import {
  ConversationRelayRequest,
  ConversationRelayResponse,
} from "./types/twilio";

const fastify = Fastify({ logger: true });
const PORT = process.env.PORT || 8080;
const DOMAIN = process.env.DOMAIN || "localhost:8080";

// Register form body parser for Twilio webhooks
fastify.register(formbody);

// Store active call sessions
const sessions = new Map<string, Record<string, unknown>>();

// Voice configuration for all hotlines
// Uses Shani's voice (1hlpeD1ydbI2ow0Tt3EW) for all hotlines
const VOICE_CONFIG = {
  ttsProvider: "ElevenLabs",
  voice: "1hlpeD1ydbI2ow0Tt3EW", // Shani's voice
  language: "en-GB",
};

// TwiML endpoint - returns instructions for ConversationRelay webhook
fastify.get("/twiml", async (request, reply) => {
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

          // Initialize session memory
          const initialMemory: Record<string, unknown> = {
            step: "greeting",
          };
          sessions.set(callSid, initialMemory);

          // Send greeting with menu
          const greetingResponse = await handleMainMenu(
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
          ws.send(
            JSON.stringify({
              type: "text",
              token: greetingResponse.actions[0]?.say || "Welcome to ARCline.",
              last: !greetingResponse.actions[0]?.listen,
            })
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

          // Check for DTMF digits (1-5)
          const dtmfMatch = currentInput.match(/[1-5]/);
          const hotlineType = memory.hotlineType as string | undefined;
          const step = memory.step as string | undefined;

          console.log(
            "Prompt routing - hotlineType:",
            hotlineType,
            "step:",
            step,
            "input:",
            currentInput
          );

          let response: ConversationRelayResponse;

          // If no hotline selected yet, show main menu
          // Note: step === "menu" can occur within a hotline handler (e.g., gossip menu), so we check hotlineType first
          if (!hotlineType) {
            // Handle DTMF input for menu selection
            if (dtmfMatch) {
              const selection = dtmfMatch[0];
              const hotlineMap: Record<string, string> = {
                "1": "extraction",
                "2": "loot",
                "3": "chicken",
                "4": "intel",
                "5": "alarm",
              };

              memory.hotlineType = hotlineMap[selection];
              memory.step = undefined; // Clear step so hotline handler starts fresh
              sessions.set(callSid, memory);

              // Immediately route to the selected hotline handler to initialize it properly
              const hotlineRequest = {
                ConversationSid: conversationSid || "",
                CurrentInput: "", // Empty input triggers greeting in handler
                CurrentInputType: "voice" as const,
                Memory: JSON.stringify(memory),
              };

              let hotlineResponse: ConversationRelayResponse;
              switch (hotlineMap[selection]) {
                case "extraction":
                  hotlineResponse = await handleExtractionHotline(
                    hotlineRequest,
                    memory
                  );
                  break;
                case "loot":
                  hotlineResponse = await handleLootHotline(
                    hotlineRequest,
                    memory
                  );
                  break;
                case "chicken":
                  hotlineResponse = await handleChickenHotline(
                    hotlineRequest,
                    memory
                  );
                  break;
                case "intel":
                  hotlineResponse = await handleIntelHotline(
                    hotlineRequest,
                    memory
                  );
                  break;
                case "alarm":
                  hotlineResponse = await handleAlarmHotline(
                    hotlineRequest,
                    memory
                  );
                  break;
                default:
                  // Fallback
                  hotlineResponse = await handleMainMenu(
                    hotlineRequest,
                    memory
                  );
              }

              // Update session memory with the handler's response
              if (hotlineResponse.actions[0]?.remember) {
                sessions.set(callSid, hotlineResponse.actions[0].remember);
              }

              // Send the handler's greeting message
              const shouldListen = hotlineResponse.actions[0]?.listen ?? false;
              ws.send(
                JSON.stringify({
                  type: "text",
                  token:
                    hotlineResponse.actions[0]?.say ||
                    "Processing your request.",
                  last: !shouldListen,
                })
              );
              return;
            } else {
              // Handle menu navigation
              response = await handleMainMenu(
                {
                  ConversationSid: conversationSid || "",
                  CurrentInput: currentInput,
                  CurrentInputType: "voice",
                  Memory: JSON.stringify(memory),
                },
                memory
              );
            }
          } else {
            // Route to appropriate hotline handler based on selection
            switch (hotlineType) {
              case "extraction":
                response = await handleExtractionHotline(
                  {
                    ConversationSid: conversationSid || "",
                    CurrentInput: currentInput,
                    CurrentInputType: "voice",
                    Memory: JSON.stringify(memory),
                  },
                  memory
                );
                break;
              case "loot":
                response = await handleLootHotline(
                  {
                    ConversationSid: conversationSid || "",
                    CurrentInput: currentInput,
                    CurrentInputType: "voice",
                    Memory: JSON.stringify(memory),
                  },
                  memory
                );
                break;
              case "chicken":
                response = await handleChickenHotline(
                  {
                    ConversationSid: conversationSid || "",
                    CurrentInput: currentInput,
                    CurrentInputType: "voice",
                    Memory: JSON.stringify(memory),
                  },
                  memory
                );
                break;
              case "intel":
                response = await handleIntelHotline(
                  {
                    ConversationSid: conversationSid || "",
                    CurrentInput: currentInput,
                    CurrentInputType: "voice",
                    Memory: JSON.stringify(memory),
                  },
                  memory
                );
                break;
              case "alarm":
                response = await handleAlarmHotline(
                  {
                    ConversationSid: conversationSid || "",
                    CurrentInput: currentInput,
                    CurrentInputType: "voice",
                    Memory: JSON.stringify(memory),
                  },
                  memory
                );
                break;
              default:
                // Fallback to menu if unknown hotline type
                response = await handleMainMenu(
                  {
                    ConversationSid: conversationSid || "",
                    CurrentInput: currentInput,
                    CurrentInputType: "voice",
                    Memory: JSON.stringify(memory),
                  },
                  memory
                );
            }
          }

          // Update memory from response
          if (response.actions[0]?.remember) {
            sessions.set(callSid, response.actions[0].remember);
          }

          // Send response text
          // When last: false, ConversationRelay automatically listens after speech
          // When last: true, ConversationRelay stops listening
          if (response.actions[0]?.say) {
            const shouldListen = response.actions[0].listen ?? false;
            ws.send(
              JSON.stringify({
                type: "text",
                token: response.actions[0].say,
                last: !shouldListen,
              })
            );
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
              "4": "intel",
              "5": "alarm",
            };

            memory.hotlineType = hotlineMap[dtmfDigit];
            memory.step = undefined;
            sessions.set(callSid, memory);

            const confirmations: Record<string, string> = {
              "1": "You selected Extraction Request. Please provide your location for extraction.",
              "2": "You selected Loot Locator. What are you looking for?",
              "3": "You selected Scrappy's Chicken Line. Welcome!",
              "4": "You selected Faction News. Say 'latest' for intel or 'submit' to share intel.",
              "5": "You selected Event Alarm. What time would you like to be alerted?",
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
      ws.send(
        JSON.stringify({
          type: "text",
          token:
            "I'm experiencing technical difficulties. Please try again later.",
          last: true,
        })
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

    // Check if user has selected a hotline from the menu
    const hotlineType = memoryObj.hotlineType as string | undefined;
    const step = memoryObj.step as string | undefined;

    // Handle DTMF input for menu selection
    const input = currentInput.toLowerCase().trim();
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
        case "intel":
          response = await handleIntelHotline(relayRequest, memoryObj);
          break;
        case "alarm":
          response = await handleAlarmHotline(relayRequest, memoryObj);
          break;
        default:
          // Fallback to menu if unknown hotline type
          response = await handleMainMenu(relayRequest, memoryObj);
      }
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
