/**
 * Detects which hotline the user wants based on their input
 * @param input - User input (should be lowercase and trimmed)
 * @returns The hotline type string or undefined if no match
 */
export function detectHotlineType(input: string): string | undefined {
  const normalizedInput = input.toLowerCase().trim();
  console.log("detectHotlineType - normalized input:", normalizedInput);

  // Check for extraction hotline
  if (
    normalizedInput.includes("extraction") ||
    normalizedInput.includes("extract")
  ) {
    return "extraction";
  }

  // Check for loot hotline (most specific patterns first)
  if (
    normalizedInput.includes("loot") ||
    normalizedInput.includes("loots") ||
    normalizedInput.includes("loop") ||
    normalizedInput.includes("loops") ||
    normalizedInput.includes("lou") ||
    normalizedInput.includes("lous") ||
    normalizedInput.includes("item") ||
    normalizedInput.includes("items") ||
    normalizedInput.includes("flute") ||
    normalizedInput.includes("flutes") ||
    normalizedInput.includes("resource") ||
    normalizedInput.includes("resources") ||
    normalizedInput.includes("material") ||
    normalizedInput.includes("materials")
  ) {
    return "loot";
  }

  // Check for chicken/scrappy hotline
  if (
    normalizedInput.includes("scrappy") ||
    normalizedInput.includes("chicken") ||
    input.includes("crappy") ||
    input.includes("happy")
  ) {
    return "chicken";
  }

  // Check for submit intel hotline (check this first to avoid conflicts)
  if (
    normalizedInput.includes("submit intel") ||
    normalizedInput.includes("submitintel") ||
    (normalizedInput.includes("submit") && normalizedInput.includes("intel")) ||
    normalizedInput.includes("share intel") ||
    normalizedInput.includes("report intel") ||
    (normalizedInput.includes("share") && normalizedInput.includes("intel")) ||
    (normalizedInput.includes("report") && normalizedInput.includes("intel"))
  ) {
    return "submit-intel";
  }

  // Check for listen intel hotline
  if (
    normalizedInput.includes("listen to intel") ||
    normalizedInput.includes("listentointel") ||
    (normalizedInput.includes("listen") && normalizedInput.includes("intel")) ||
    normalizedInput.includes("latest intel") ||
    normalizedInput.includes("latestintel") ||
    (normalizedInput.includes("latest") && normalizedInput.includes("intel")) ||
    normalizedInput.includes("get intel") ||
    (normalizedInput.includes("get") && normalizedInput.includes("intel")) ||
    normalizedInput.includes("news") ||
    normalizedInput.includes("rumors") ||
    normalizedInput.includes("rumor") ||
    normalizedInput.includes("faction") ||
    (normalizedInput.includes("intel") &&
      !normalizedInput.includes("submit") &&
      !normalizedInput.includes("share") &&
      !normalizedInput.includes("report")) ||
    normalizedInput.includes("gossip") ||
    // Check for phrases like "what's the latest"
    (normalizedInput.includes("latest") &&
      (normalizedInput.includes("news") || normalizedInput.includes("rumor")))
  ) {
    return "listen-intel";
  }

  return undefined;
}
