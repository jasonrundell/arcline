/**
 * Checks if the user is asking to repeat the last response
 */
export function isRepeatRequest(input: string): boolean {
  const normalized = input.toLowerCase().trim();
  const repeatKeywords = [
    "repeat",
    "say again",
    "say that again",
    "what did you say",
    "what did you just say",
    "can you repeat",
    "could you repeat",
    "repeat that",
    "again",
    "pardon",
    // Removed "what" and "huh" as they're too generic and match too many legitimate questions
    // "what",
    // "huh",
  ];

  return repeatKeywords.some((keyword) => normalized.includes(keyword));
}

