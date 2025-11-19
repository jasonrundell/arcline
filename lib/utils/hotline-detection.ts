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
    normalizedInput.includes("chicken")
  ) {
    return "chicken";
  }

  // Check for intel hotline
  if (
    normalizedInput.includes("news") ||
    normalizedInput.includes("rumors") ||
    normalizedInput.includes("rumor") ||
    normalizedInput.includes("faction") ||
    normalizedInput.includes("intel") ||
    normalizedInput.includes("gossip") ||
    // Check for phrases like "latest intel", "latest news", "what's the latest"
    (normalizedInput.includes("latest") &&
      (normalizedInput.includes("intel") ||
        normalizedInput.includes("news") ||
        normalizedInput.includes("rumor")))
  ) {
    return "intel";
  }

  return undefined;
}
