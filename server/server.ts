// Load environment variables from .env.local or .env file
import dotenv from "dotenv";
import { resolve } from "path";

// Load .env first, then .env.local (so .env.local overrides .env)
dotenv.config({ path: resolve(process.cwd(), ".env") });
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import Fastify from "fastify";
import { WebSocketServer } from "ws";
import formbody from "@fastify/formbody";
import rateLimit from "@fastify/rate-limit";
import twilio from "twilio";
import { routeToHotline } from "./lib/utils/router";
import {
  ConversationRelayRequest,
  ConversationRelayResponse,
} from "./types/twilio";
import { isEndCallRequest, createEndCallResponse } from "./lib/utils/exit";
import { createSessionAwareLogger } from "./lib/utils/session-logger";
import { saveSessionLogsToDatabase } from "./lib/utils/save-logs";
import { TIMEOUTS, WEBSOCKET } from "./constants";

const fastify = Fastify({ logger: true });
const PORT = process.env.PORT || 8080;
const DOMAIN = process.env.DOMAIN || "localhost:8080";

// Register form body parser for Twilio webhooks
fastify.register(formbody);

// Register rate limiting globally
fastify.register(rateLimit, {
  max: 100, // Maximum number of requests per time window
  timeWindow: "1 minute", // Time window for rate limiting
});

// Store active call sessions
const sessions = new Map<string, Record<string, unknown>>();

// Track active WebSocket connections
let activeConnections = 0;

// Store phone numbers by call SID (from TwiML request)
const phoneNumbersByCallSid = new Map<string, string>();

/**
 * Initializes and returns a Twilio client instance.
 *
 * Creates a Twilio client using credentials from environment variables.
 * Returns null if credentials are missing, allowing graceful degradation.
 *
 * @returns {twilio.Twilio | null} Twilio client instance, or null if credentials are missing
 */
function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    return null;
  }
  return twilio(accountSid, authToken);
}

/**
 * Sends a text message via WebSocket and optionally ends the call.
 *
 * Sends a JSON message to the WebSocket connection with the text content.
 * If shouldListen is false, schedules an end message after a delay to allow
 * the text to be spoken before terminating the call.
 *
 * @param {any} ws - WebSocket connection to send the message to
 * @param {string} text - Text content to send (will be spoken by TTS)
 * @param {boolean} shouldListen - Whether to continue listening after sending (if false, call will end)
 * @returns {void}
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
    }, TIMEOUTS.CALL_END_DELAY); // Wait for the message to be spoken
  }
}

// Voice configuration for all hotlines
// Uses Shani's voice (1hlpeD1ydbI2ow0Tt3EW) for all hotlines
const VOICE_CONFIG = {
  ttsProvider: "ElevenLabs",
  voice: "1hlpeD1ydbI2ow0Tt3EW", // Shani's voice
  language: "en-GB",
};

/**
 * TwiML Endpoint
 *
 * GET /twiml
 *
 * Returns TwiML instructions for Twilio to connect the call to the ConversationRelay
 * WebSocket server. Auto-detects the domain from request headers (works with ngrok)
 * and enforces WSS protocol in production.
 *
 * @route GET /twiml
 * @param {Object} request.query - Query parameters containing CallSid and From (caller's phone number)
 * @returns {string} TwiML XML response with ConversationRelay configuration
 */
fastify.get("/twiml", async (request, reply) => {
  // Get caller's phone number from query params
  const callSid = (request.query as { CallSid?: string })?.CallSid;
  const fromNumber = (request.query as { From?: string })?.From;

  // Store phone number if we have both callSid and fromNumber
  if (callSid && fromNumber) {
    phoneNumbersByCallSid.set(callSid, fromNumber);
    // Note: This happens before WebSocket connection, so we can't use session logger here
    console.log("Stored phone number for call:", { callSid, fromNumber });
  }

  // Auto-detect domain from request headers (works with ngrok)
  // Priority: DOMAIN env var (if not localhost) > Host header > fallback to localhost
  let domain = DOMAIN;

  // If DOMAIN is still localhost, try to get it from the request
  if (domain.includes("localhost") && request.headers.host) {
    domain = request.headers.host;
  }

  // Remove protocol prefix if present (we'll add it back based on HTTPS availability)
  domain = domain.replace(/^https?:\/\//, "");

  // Use wss:// for WebSocket connection (ngrok provides HTTPS/WSS automatically)
  // According to official docs: url attribute on <ConversationRelay> is for WebSocket connections
  // For AWS, you need to configure HTTPS on the ALB to support wss://
  const isProduction = process.env.NODE_ENV === "production";
  const protocol = isProduction
    ? "wss"
    : domain.includes("localhost")
    ? "ws"
    : "wss";

  // Enforce WSS in production (same as ngrok setup)
  if (isProduction && protocol !== "wss") {
    throw new Error(
      "Production must use WSS protocol for WebSocket connections. " +
        "Configure HTTPS on your load balancer to support wss:// connections."
    );
  }

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

/**
 * HTTP Upgrade Handler for WebSocket Connections
 *
 * Handles HTTP upgrade requests to establish WebSocket connections.
 * Only allows connections to the /ws path; all other upgrade requests are rejected.
 *
 * @param {http.IncomingMessage} request - HTTP upgrade request
 * @param {net.Socket} socket - Network socket
 * @param {Buffer} head - First packet of the upgraded stream
 */
fastify.server.on("upgrade", (request, socket, head) => {
  if (request.url === "/ws") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

/**
 * WebSocket Connection Handler
 *
 * Architecture: Real-time Voice Conversation System
 *
 * This handler manages the full lifecycle of WebSocket connections for Twilio
 * ConversationRelay, implementing a real-time voice conversation system.
 *
 * System Architecture:
 * 1. Connection Establishment: Twilio connects via WebSocket after TwiML response
 * 2. Session Management: Each call has a unique session stored in memory
 * 3. Message Processing: Handles setup, prompt, and end message types
 * 4. State Machine: Routes to hotline handlers based on conversation state
 * 5. Cleanup: Removes sessions on disconnect and periodic cleanup of stale sessions
 *
 * Message Flow:
 * - setup: Initial connection, establishes call SID and conversation SID
 * - prompt: User voice input, routes to hotline handler, returns TTS response
 * - end: Call termination, saves logs to database
 *
 * Session State:
 * - Stored in `sessions` Map keyed by callSid
 * - Contains: hotlineType, step, phoneNumber, lastActivity timestamp
 * - Persisted across WebSocket messages for conversation continuity
 *
 * Connection Management:
 * - Tracks active connections with `activeConnections` counter
 * - Enforces MAX_CONNECTIONS limit to prevent resource exhaustion
 * - Periodic cleanup removes stale sessions (inactive > SESSION_TIMEOUT)
 *
 * @param {WebSocket} ws - WebSocket connection instance
 * @param {http.IncomingMessage} request - HTTP request that initiated the upgrade
 */
wss.on("connection", (ws, request) => {
  // Check connection limit
  if (activeConnections >= WEBSOCKET.MAX_CONNECTIONS) {
    console.warn(
      `Connection limit reached (${WEBSOCKET.MAX_CONNECTIONS}). Rejecting new connection.`
    );
    ws.close(1008, "Server at capacity");
    return;
  }
  activeConnections++;

  let callSid: string | undefined;
  let conversationSid: string | undefined;
  let sessionLogger: ReturnType<typeof createSessionAwareLogger> | null = null;

  ws.on("message", async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case "setup":
          callSid = message.callSid;
          conversationSid = message.conversationSid;

          if (!callSid) {
            console.error("No call SID in setup message");
            return;
          }

          // Create session-aware logger for this call
          sessionLogger = createSessionAwareLogger(callSid);
          sessionLogger.log("Setting up ConversationRelay connection");

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
                if (sessionLogger) {
                  sessionLogger.error(
                    "Error fetching call info from Twilio:",
                    error
                  );
                } else {
                  console.error("Error fetching call info from Twilio:", error);
                }
              }
            }
          }

          // Initialize session memory with phone number if available
          const initialMemory: Record<string, unknown> = {
            step: "greeting",
            lastActivity: Date.now(),
          };
          if (phoneNumber) {
            initialMemory.phoneNumber = phoneNumber;
            if (sessionLogger) {
              sessionLogger.log("Stored phone number in session:", phoneNumber);
            } else {
              console.log("Stored phone number in session:", phoneNumber);
            }
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
            const memory = greetingResponse.actions[0].remember as Record<
              string,
              unknown
            >;
            memory.lastActivity = Date.now();
            sessions.set(callSid, memory);
          }

          // Send greeting message
          // When last: false, ConversationRelay automatically listens, so no separate listen command needed
          sendTextAndEndIfNeeded(
            ws,
            greetingResponse.actions[0]?.say || "Welcome to ARC Line.",
            greetingResponse.actions[0]?.listen ?? true
          );
          break;

        case "prompt":
          if (sessionLogger) {
            sessionLogger.log("Received prompt:", message.voicePrompt);
          } else {
            console.log("Received prompt:", message.voicePrompt);
          }

          if (!callSid) {
            if (sessionLogger) {
              sessionLogger.error("No call SID available");
            } else {
              console.error("No call SID available");
            }
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

          if (sessionLogger) {
            sessionLogger.log("Prompt routing - current state:", {
              hotlineType: hotlineType || "(none)",
              step: step || "(none)",
              input: currentInput,
            });
          } else {
            console.log("Prompt routing - current state:", {
              hotlineType: hotlineType || "(none)",
              step: step || "(none)",
              input: currentInput,
            });
          }

          // Use centralized router for all routing decisions
          const request = {
            ConversationSid: conversationSid || "",
            CurrentInput: currentInput,
            CurrentInputType: "voice" as const,
            Memory: JSON.stringify(memory),
          };

          const response = await routeToHotline(request, memory);
          if (sessionLogger) {
            sessionLogger.log("Server - received response from router:", {
              hasActions: !!response.actions,
              actionCount: response.actions?.length,
              firstActionSay: response.actions?.[0]?.say,
              firstActionListen: response.actions?.[0]?.listen,
            });
          } else {
            console.log("Server - received response from router:", {
              hasActions: !!response.actions,
              actionCount: response.actions?.length,
              firstActionSay: response.actions?.[0]?.say,
              firstActionListen: response.actions?.[0]?.listen,
            });
          }

          // Update memory from response
          if (response.actions[0]?.remember) {
            const updatedMemory = response.actions[0].remember as Record<
              string,
              unknown
            >;
            updatedMemory.lastActivity = Date.now();
            sessions.set(callSid, updatedMemory);

            // Log the selected hotline after processing
            const selectedHotline = updatedMemory.hotlineType as
              | string
              | undefined;
            if (selectedHotline && !hotlineType) {
              if (sessionLogger) {
                sessionLogger.log("Menu selection detected:", {
                  selectedHotline,
                  input: currentInput,
                });
              } else {
                console.log("Menu selection detected:", {
                  selectedHotline,
                  input: currentInput,
                });
              }
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
                  const memory = lookupResponse.actions[0].remember as Record<
                    string,
                    unknown
                  >;
                  memory.lastActivity = Date.now();
                  sessions.set(currentCallSid, memory);
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
              }, TIMEOUTS.LOOT_LOOKUP_DELAY); // Wait for "One sec" to be spoken
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
          if (sessionLogger) {
            sessionLogger.log("Handling interruption");
          } else {
            console.log("Handling interruption");
          }
          // Could implement interruption handling here
          break;

        case "error":
          // Twilio sends error messages for transcription issues, audio quality, etc.
          // These are typically non-fatal informational messages
          if (sessionLogger) {
            sessionLogger.log("Twilio error message:", {
              error: message.error || message.message || "Unknown error",
              details: message.details || message,
            });
          } else {
            console.log("Twilio error message:", {
              error: message.error || message.message || "Unknown error",
              details: message.details || message,
            });
          }
          // Continue listening - don't disrupt the conversation flow
          break;

        default:
          if (sessionLogger) {
            sessionLogger.warn("Unknown message type:", message.type);
          } else {
            console.warn("Unknown message type:", message.type);
          }
          break;
      }
    } catch (error) {
      if (sessionLogger) {
        sessionLogger.error("Error processing WebSocket message:", error);
      } else {
        console.error("Error processing WebSocket message:", error);
      }
      sendTextAndEndIfNeeded(
        ws,
        "I'm experiencing technical difficulties. Please try again later.",
        false
      );
    }
  });

  ws.on("close", async () => {
    activeConnections--;

    if (sessionLogger) {
      sessionLogger.log("WebSocket connection closed");
    } else {
      console.log("WebSocket connection closed");
    }

    if (callSid) {
      // Save logs to database before clearing session
      try {
        await saveSessionLogsToDatabase(callSid);
      } catch (error) {
        console.error(`Failed to save logs for session ${callSid}:`, error);
      }
      sessions.delete(callSid);
    }
  });

  ws.on("error", (error) => {
    if (sessionLogger) {
      sessionLogger.error("WebSocket error:", error);
    } else {
      console.error("WebSocket error:", error);
    }
  });
});

// Session cleanup: Remove stale sessions periodically
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [callSid, session] of sessions.entries()) {
    const lastActivity = (session.lastActivity as number) || 0;
    if (now - lastActivity > TIMEOUTS.SESSION_TIMEOUT) {
      sessions.delete(callSid);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} stale session(s)`);
  }
}, TIMEOUTS.SESSION_CLEANUP_INTERVAL);

/**
 * Twilio ConversationRelay Webhook Endpoint
 *
 * POST /api/twilio/conversation/webhook
 *
 * Receives webhook requests from Twilio ConversationRelay and routes them to the
 * appropriate hotline handler. Validates Twilio signatures for security and enforces
 * HTTPS in production. Processes form-urlencoded data containing conversation state.
 *
 * @route POST /api/twilio/conversation/webhook
 * @param {FormData} request.body - Twilio webhook payload (form-urlencoded)
 *   - ConversationSid: Unique identifier for the conversation
 *   - CurrentInput: The user's current voice or text input
 *   - CurrentInputType: Type of input ("voice", "text", or "setup")
 *   - Memory: JSON string containing conversation state/memory
 * @param {string} request.headers["x-twilio-signature"] - Twilio request signature for validation
 * @returns {ConversationRelayResponse} Response with actions for Twilio (say, listen, etc.)
 *
 * @example
 * Request body:
 * ```
 * ConversationSid=CHxxx
 * CurrentInput=hello
 * CurrentInputType=voice
 * Memory={"step":"greeting"}
 * ```
 */
fastify.post(
  "/api/twilio/conversation/webhook",
  {
    config: {
      rateLimit: {
        max: 50, // Stricter limit for webhook endpoint
        timeWindow: "1 minute",
      },
    },
  },
  async (request, reply) => {
    try {
      // Verify Twilio signature to ensure request is from Twilio
      const twilioSignature = request.headers["x-twilio-signature"] as string;
      const authToken = process.env.TWILIO_AUTH_TOKEN;

      if (authToken && twilioSignature) {
        // Construct the full URL for signature validation
        const isProduction = process.env.NODE_ENV === "production";
        let protocol = request.headers["x-forwarded-proto"] as
          | string
          | undefined;
        if (!protocol) {
          protocol = isProduction
            ? "https"
            : DOMAIN.includes("localhost")
            ? "http"
            : "https";
        }

        // Enforce HTTPS in production
        if (isProduction && protocol !== "https") {
          console.warn(
            "Production request not using HTTPS - rejecting for security"
          );
          reply.status(403).send({
            error: "HTTPS required in production",
            actions: [
              {
                say: "Authentication failed.",
                listen: false,
              },
            ],
          });
          return;
        }

        const host = request.headers.host || DOMAIN;
        const url = `${protocol}://${host}${request.url}`;

        // Validate the request signature
        const isValid = twilio.validateRequest(
          authToken,
          twilioSignature,
          url,
          request.body as Record<string, string>
        );

        if (!isValid) {
          console.warn("Invalid Twilio signature - rejecting request");
          reply.status(403).send({
            error: "Invalid signature",
            actions: [
              {
                say: "Authentication failed.",
                listen: false,
              },
            ],
          });
          return;
        }
      } else if (authToken && !twilioSignature) {
        // In production, require signature; in development, allow without for testing
        const isProduction = process.env.NODE_ENV === "production";
        if (isProduction) {
          console.warn(
            "Missing Twilio signature in production - rejecting request"
          );
          reply.status(403).send({
            error: "Missing signature",
            actions: [
              {
                say: "Authentication failed.",
                listen: false,
              },
            ],
          });
          return;
        }
      }

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

      // Use centralized router for all routing decisions
      const response = await routeToHotline(relayRequest, memoryObj);

      reply.type("application/json").send(response);
    } catch (error) {
      // Note: Webhook endpoint doesn't have a session context, so use regular console
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
  }
);

// Health check endpoint
/**
 * Health Check Endpoint
 *
 * GET /health
 *
 * Simple health check endpoint that returns server status and current timestamp.
 * Useful for monitoring and load balancer health checks.
 *
 * @route GET /health
 * @returns {Object} Health status object with status and timestamp
 */
fastify.get("/health", async (request, reply) => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

/**
 * Starts the Fastify server and begins listening for requests.
 *
 * Binds the server to all network interfaces (0.0.0.0) on the configured port.
 * Logs server endpoints on successful startup. Exits the process on error.
 *
 * @returns {Promise<void>}
 */
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
