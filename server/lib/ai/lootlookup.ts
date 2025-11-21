// Perplexity API endpoint
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

/**
 * Looks up loot location information for ARC Raiders using Perplexity
 * Returns a concise response about where to find specific loot items
 */
export async function lookupLootLocation(
  lootItem: string
): Promise<string> {
  // Check if API key is configured
  if (!process.env.PERPLEXITY_API_KEY) {
    console.warn(
      "PERPLEXITY_API_KEY not configured, using fallback response. " +
        "Make sure PERPLEXITY_API_KEY is set in .env.local or .env file."
    );
    return getFallbackLootResponse(lootItem);
  }

  try {
    // Build the user message for Perplexity
    const userMessage = `Where can I find "${lootItem}" in the video game ARC Raiders by Embark Studios? Provide a concise answer (2-3 sentences max) about the location and how to obtain it.`;

    // Call Perplexity API with online search enabled
    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: "sonar-pro", // Best model for online search
        messages: [
          {
            role: "system",
            content: `You are Shani, Head of Security for Speranza Security in ARC Raiders by Embark Studios. Provide concise, tactical information about loot locations in ARC Raiders. Keep responses to 2-3 sentences maximum. Use ARC Raiders terminology: topside (surface world), Raider (player), Speranza (underground settlement). Be direct and professional.`,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 150, // Keep responses short for voice
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error:", response.status, errorText);
      return getFallbackLootResponse(lootItem);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const aiResponse = data.choices?.[0]?.message?.content;

    if (aiResponse) {
      return aiResponse.trim();
    }

    // Fallback if response format is unexpected
    return getFallbackLootResponse(lootItem);
  } catch (error) {
    console.error("Error looking up loot location:", error);
    return getFallbackLootResponse(lootItem);
  }
}

/**
 * Fallback response when API is unavailable
 */
function getFallbackLootResponse(lootItem: string): string {
  return `I couldn't access the loot database right now. Try searching for ${lootItem} in common topside locations—check supply crates and defeated ARC units. Stay alert, Raider.`;
}

