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
    normalizedInput.includes("loop") ||
    normalizedInput.includes("lou") ||
    normalizedInput.includes("lous") ||
    normalizedInput.includes("item") ||
    normalizedInput.includes("flute") ||
    normalizedInput.includes("resource") ||
    normalizedInput.includes("material") ||
    normalizedInput.includes("clip") ||
    normalizedInput.includes("click") ||
    normalizedInput.includes("lipped")
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
    normalizedInput.includes("submit") ||
    normalizedInput.includes("report")
  ) {
    return "submit-intel";
  }

  // Check for listen intel hotline
  if (
    normalizedInput.includes("listen") ||
    normalizedInput.includes("intel") ||
    normalizedInput.includes("news") ||
    normalizedInput.includes("rumor")
  ) {
    return "listen-intel";
  }

  return undefined;
}
