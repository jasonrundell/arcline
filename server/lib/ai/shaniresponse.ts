// Perplexity API endpoint
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

// Shani's persona system prompt
const SHANI_SYSTEM_PROMPT = `You are Shani, Head of Security for Speranza Security in the ARC Raiders video game universe by Embark Studios.

PERSONALITY:
- Direct, tactical, professional communication style
- British English (en-GB) accent and phrasing
- Extremely detail-oriented and cautious
- Always monitoring and vigilant
- No-nonsense, mission-focused
- Brief and efficient - get to the point quickly

SPEECH PATTERNS:
- Use military/tactical language: "Copy that", "Request acknowledged", "Understood"
- Reference monitoring: "I'm monitoring feeds from security room", "Watching over Speranza"
- Include security warnings when relevant

TERMINOLOGY:
- topside = surface world above ground (dangerous, ARC-infested)
- Raider = player character / resident of Speranza
- Speranza = underground settlement Shani protects
- ARC activity = enemy machine movements and threats
- extraction hatch = safe extraction points back to Speranza
- security room = Shani's operational center
- feeds = surveillance camera/monitor feeds

GUIDELINES:
- Keep responses concise (2-3 sentences max for voice calls)
- Be direct and actionable
- Always maintain professional, tactical tone
- Never use casual or friendly language
- Reference security/monitoring when relevant
- Use ARC Raiders universe terminology correctly

IMPORTANT: Your responses will be converted to speech via text-to-speech. Keep them natural for speech, avoid complex punctuation, and stay concise.`;

interface GenerateShaniResponseParams {
  context: string; // Current hotline context (e.g., "Scrappy's material collection channel")
  userInput: string; // What the user said
  conversationHistory?: string; // Optional conversation context
  additionalContext?: string; // Any additional context (e.g., Scrappy's status)
}

/**
 * Generates a response from Shani using Perplexity's API
 * Falls back to a default response if API call fails
 */
export async function generateShaniResponse(
  params: GenerateShaniResponseParams
): Promise<string> {
  const { context, userInput, conversationHistory, additionalContext } = params;

  // Check if API key is configured
  if (!process.env.PERPLEXITY_API_KEY) {
    console.warn(
      "PERPLEXITY_API_KEY not configured, using fallback response. " +
        "Make sure PERPLEXITY_API_KEY is set in .env.local or .env file."
    );
    return getFallbackResponse(context, userInput);
  }

  try {
    // Build the user message
    let userMessage = `Context: ${context}\n`;
    if (additionalContext) {
      userMessage += `Additional Context: ${additionalContext}\n`;
    }
    if (conversationHistory) {
      userMessage += `Previous conversation: ${conversationHistory}\n`;
    }
    userMessage += `User said: "${userInput}"\n\nGenerate Shani's response in her voice. Keep it concise (2-3 sentences max) and natural for speech.`;

    // Call Perplexity API
    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        // Perplexity model options: sonar-small-online, sonar-medium-online, sonar-large-online, sonar-pro
        // See https://docs.perplexity.ai/getting-started/models for available models
        model: "sonar-pro", // sonar-pro is the best model for this use case
        messages: [
          {
            role: "system",
            content: SHANI_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 150, // Keep responses short for voice
        temperature: 0.7, // Balance between consistency and variety
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error:", response.status, errorText);
      return getFallbackResponse(context, userInput);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const aiResponse = data.choices?.[0]?.message?.content;

    if (aiResponse) {
      return aiResponse.trim();
    }

    // Fallback if response format is unexpected
    return getFallbackResponse(context, userInput);
  } catch (error) {
    console.error("Error generating Shani response:", error);
    // Fallback to scripted response on error
    return getFallbackResponse(context, userInput);
  }
}

/**
 * Fallback response generator when AI is unavailable
 */
function getFallbackResponse(context: string, userInput: string): string {
  const input = userInput.toLowerCase().trim();

  // Generic fallback responses based on context
  if (context.includes("Scrappy") || context.includes("material collection")) {
    if (
      input.includes("material") ||
      input.includes("collection") ||
      input.includes("status")
    ) {
      return "Scrappy's reporting successful material collection. That rooster's been busy topside—brought back standard salvage. No ARC contact detected during his run. Anything else you need to know?";
    }
    if (
      input.includes("route") ||
      input.includes("location") ||
      input.includes("where")
    ) {
      return "Scrappy's operating in low-threat zones—standard material collection routes. He knows which areas to avoid. ARC activity's unpredictable, but that rooster's got good instincts. Anything else?";
    }
    return "Copy that. Scrappy's material collection status is positive. That rooster's been reliable. What else do you need, Raider?";
  }

  // Generic fallback
  return "Understood. What else do you need, Raider?";
}
