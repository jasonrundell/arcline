import Fastify from "fastify";
import { WebSocketServer } from "ws";
import { handleMainMenu } from "./lib/hotlines/menu";
import { handleExtractionHotline } from "./lib/hotlines/extraction";
import { handleLootHotline } from "./lib/hotlines/loot";
import { handleChickenHotline } from "./lib/hotlines/chicken";
import { handleGossipHotline } from "./lib/hotlines/gossip";
import { handleAlarmHotline } from "./lib/hotlines/alarm";
import { ConversationRelayRequest, ConversationRelayResponse } from "./types/twilio";

const fastify = Fastify({ logger: true });
const PORT = process.env.PORT || 8080;
const DOMAIN = process.env.DOMAIN || "localhost:8080";

// Store active call sessions
const sessions = new Map<string, Record<string, unknown>>();

// TwiML endpoint - returns instructions to connect to WebSocket
fastify.get("/twiml", async (request, reply) => {
  // Auto-detect domain from request headers (works with ngrok)
  // Priority: DOMAIN env var (if not localhost) > Host header > fallback to localhost
  let domain = DOMAIN;
  
  // If DOMAIN is still localhost, try to get it from the request
  if (domain.includes("localhost") && request.headers.host) {
    domain = request.headers.host;
  }
  
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay>
      <WebSocket url="wss://${domain}/ws" />
    </ConversationRelay>
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

          // Send greeting message
          ws.send(
            JSON.stringify({
              type: "text",
              token: greetingResponse.actions[0]?.say || "Welcome to ARCline.",
              last: false,
            })
          );

          // If we need to listen for input, send listen command
          if (greetingResponse.actions[0]?.listen) {
            ws.send(
              JSON.stringify({
                type: "listen",
              })
            );
          }
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

          let response: ConversationRelayResponse;

          // If no hotline selected yet, or still in menu/greeting phase, show main menu
          if (!hotlineType || step === "menu" || step === "greeting") {
            // Handle DTMF input for menu selection
            if (dtmfMatch) {
              const selection = dtmfMatch[0];
              const hotlineMap: Record<string, string> = {
                "1": "extraction",
                "2": "loot",
                "3": "chicken",
                "4": "gossip",
                "5": "alarm",
              };

              memory.hotlineType = hotlineMap[selection];
              memory.step = undefined; // Clear step so hotline handler starts fresh
              sessions.set(callSid, memory);

              const confirmations: Record<string, string> = {
                "1": "You selected Extraction Request. Please provide your location for extraction.",
                "2": "You selected Loot Locator. What are you looking for?",
                "3": "You selected Scrappy's Chicken Line. Welcome!",
                "4": "You selected Faction News. Say 'latest' for rumors or 'submit' to share gossip.",
                "5": "You selected Event Alarm. What time would you like to be alerted?",
              };

              ws.send(
                JSON.stringify({
                  type: "text",
                  token: confirmations[selection],
                  last: true,
                })
              );

              // Listen for next input
              ws.send(
                JSON.stringify({
                  type: "listen",
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
              case "gossip":
                response = await handleGossipHotline(
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
          if (response.actions[0]?.say) {
            ws.send(
              JSON.stringify({
                type: "text",
                token: response.actions[0].say,
                last: !response.actions[0].listen,
              })
            );
          }

          // If we need to listen for more input
          if (response.actions[0]?.listen) {
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
              "4": "gossip",
              "5": "alarm",
            };

            memory.hotlineType = hotlineMap[dtmfDigit];
            memory.step = undefined;
            sessions.set(callSid, memory);

            const confirmations: Record<string, string> = {
              "1": "You selected Extraction Request. Please provide your location for extraction.",
              "2": "You selected Loot Locator. What are you looking for?",
              "3": "You selected Scrappy's Chicken Line. Welcome!",
              "4": "You selected Faction News. Say 'latest' for rumors or 'submit' to share gossip.",
              "5": "You selected Event Alarm. What time would you like to be alerted?",
            };

            ws.send(
              JSON.stringify({
                type: "text",
                token: confirmations[dtmfDigit],
                last: true,
              })
            );

            ws.send(
              JSON.stringify({
                type: "listen",
              })
            );
          } else {
            ws.send(
              JSON.stringify({
                type: "text",
                token: "Invalid selection. Please press 1, 2, 3, 4, or 5.",
                last: true,
              })
            );
            ws.send(
              JSON.stringify({
                type: "listen",
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
          token: "I'm experiencing technical difficulties. Please try again later.",
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
    console.log(`WebSocket endpoint: wss://${DOMAIN}/ws`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

