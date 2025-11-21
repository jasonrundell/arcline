/**
 * Utility functions for sending SMS via Twilio
 */

import twilio from "twilio";

/**
 * Sends an SMS message to a phone number using Twilio
 * @param to - The phone number to send the SMS to (E.164 format, e.g., +14169940497)
 * @param message - The message content to send
 * @returns Promise that resolves when SMS is sent
 */
export async function sendSMS(
  to: string,
  message: string
): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  let fromNumber =
    process.env.TWILIO_PHONE_NUMBER ||
    process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER;

  console.log("SMS configuration check:", {
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken,
    fromNumberRaw: fromNumber,
    fromNumberSource: process.env.TWILIO_PHONE_NUMBER
      ? "TWILIO_PHONE_NUMBER"
      : process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER
      ? "NEXT_PUBLIC_TWILIO_PHONE_NUMBER"
      : "none",
  });

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error(
      "Twilio credentials not configured. Need TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER"
    );
  }

  // Normalize phone number - ensure it starts with +
  const originalFromNumber = fromNumber;
  if (!fromNumber.startsWith("+")) {
    fromNumber = `+${fromNumber}`;
  }

  // Auto-fix common US number issues: if it starts with +8 and has 10 digits after, it's likely missing the "1"
  // Example: +8722825463 should be +18722825463
  if (fromNumber.startsWith("+8") && fromNumber.length === 11) {
    // Likely a US number missing the country code "1"
    fromNumber = `+1${fromNumber.substring(1)}`;
    console.log(
      `Auto-fixed phone number: ${originalFromNumber} -> ${fromNumber} (added country code "1")`
    );
  }

  // Validate phone number format (should be E.164 format)
  if (!/^\+[1-9]\d{1,14}$/.test(fromNumber)) {
    const errorMsg = `Invalid Twilio phone number format: ${fromNumber} (original: ${originalFromNumber}). Must be in E.164 format (e.g., +18722825463). Please check your TWILIO_PHONE_NUMBER environment variable.`;
    console.error(errorMsg, {
      originalValue: originalFromNumber,
      normalizedValue: fromNumber,
      expectedFormat: "E.164 format: +[country code][number]",
      example: "+18722825463",
    });
    throw new Error(errorMsg);
  }

  console.log("Sending SMS:", {
    from: fromNumber,
    to,
    messageLength: message.length,
  });

  const client = twilio(accountSid, authToken);

  // Twilio SMS has a 1600 character limit per message
  // If the message is longer, split it into multiple messages
  const MAX_SMS_LENGTH = 1600;
  
  try {
    if (message.length <= MAX_SMS_LENGTH) {
      // Single message - send as is
      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: to,
      });

      console.log("SMS sent successfully:", {
        to,
        messageSid: result.sid,
        status: result.status,
        messageLength: message.length,
      });
    } else {
      // Split message into multiple parts
      const parts: string[] = [];
      let currentIndex = 0;
      
      while (currentIndex < message.length) {
        let chunk = message.substring(currentIndex, currentIndex + MAX_SMS_LENGTH);
        
        // Try to break at a sentence boundary if possible (within last 100 chars)
        if (currentIndex + MAX_SMS_LENGTH < message.length) {
          const lastPeriod = chunk.lastIndexOf('.');
          const lastNewline = chunk.lastIndexOf('\n');
          const breakPoint = Math.max(lastPeriod, lastNewline);
          
          // If we found a good break point in the last 200 characters, use it
          if (breakPoint > MAX_SMS_LENGTH - 200) {
            chunk = chunk.substring(0, breakPoint + 1);
            currentIndex += breakPoint + 1;
          } else {
            currentIndex += MAX_SMS_LENGTH;
          }
        } else {
          currentIndex += MAX_SMS_LENGTH;
        }
        
        parts.push(chunk);
      }
      
      // Send all parts
      const results = [];
      for (let i = 0; i < parts.length; i++) {
        const partNumber = parts.length > 1 ? ` (${i + 1}/${parts.length})` : '';
        const partMessage = parts.length > 1 
          ? `${parts[i]}${partNumber}`
          : parts[i];
        
        // Ensure part doesn't exceed limit even with part number
        const finalMessage = partMessage.length > MAX_SMS_LENGTH
          ? parts[i] // Send without part number if it would exceed limit
          : partMessage;
        
        const result = await client.messages.create({
          body: finalMessage,
          from: fromNumber,
          to: to,
        });
        
        results.push(result);
        console.log(`SMS part ${i + 1}/${parts.length} sent:`, {
          to,
          messageSid: result.sid,
          status: result.status,
          partLength: finalMessage.length,
        });
        
        // Small delay between messages to avoid rate limiting
        if (i < parts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log("All SMS parts sent successfully:", {
        to,
        totalParts: parts.length,
        totalLength: message.length,
        messageSids: results.map(r => r.sid),
      });
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
}

