import {
  ConversationRelayRequest,
  ConversationRelayResponse,
} from "../../types/twilio";
import { supabase } from "../supabase";

export async function handleAlarmHotline(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  const input = request.CurrentInput.toLowerCase().trim();
  const step = (memory.step as string) || "greeting";

  const updatedMemory: Record<string, unknown> = {
    ...memory,
    hotlineType: "alarm",
  };

  switch (step) {
    case "greeting":
      updatedMemory.step = "time";
      return {
        actions: [
          {
            say: "Hey there, Raider! Lance here. Need a wake-up call or raid alarm? I've got you covered. Just tell me what time you want to be alerted. You can say something like '8 AM' or '14:30'—whatever works for you!",
            listen: true,
            remember: updatedMemory,
          },
        ],
      };

    case "time":
      const timeInput = request.CurrentInput;
      updatedMemory.alarmTime = timeInput;
      updatedMemory.step = "message";

      return {
        actions: [
          {
            say: `Got it! I've got ${timeInput} locked in. Now, what message do you want me to give you when I wake you up? Make it something that'll get you moving—or at least, that's the idea!`,
            listen: true,
            remember: updatedMemory,
          },
        ],
      };

    case "message":
      const message = request.CurrentInput;
      const alarmTime = updatedMemory.alarmTime as string;
      const phoneNumber = (memory.phoneNumber as string) || "unknown";

      try {
        // Parse time (simplified - in production, use proper date parsing)
        const now = new Date();
        let alarmDate = new Date();

        // Simple time parsing (this is a basic implementation)
        const timeMatch = alarmTime.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
          const period = timeMatch[3]?.toLowerCase();

          if (period === "pm" && hours !== 12) hours += 12;
          if (period === "am" && hours === 12) hours = 0;

          alarmDate.setHours(hours, minutes, 0, 0);
          if (alarmDate <= now) {
            alarmDate.setDate(alarmDate.getDate() + 1);
          }
        } else {
          // Default to 1 hour from now if parsing fails
          alarmDate.setHours(alarmDate.getHours() + 1);
        }

        await supabase.from("alarms").insert({
          phone_number: phoneNumber,
          alarm_time: alarmDate.toISOString(),
          message: message,
          status: "pending",
        });

        updatedMemory.step = "complete";
        return {
          actions: [
            {
              say: `Perfect! Your alarm's all set for ${alarmTime}. I'll make sure to give you a call with that message: ${message}. Don't worry, I'm pretty reliable—or so I'm told! Stay safe out there, Raider.`,
              listen: false,
              remember: updatedMemory,
            },
          ],
        };
      } catch (error) {
        console.error("Error setting alarm:", error);
        updatedMemory.step = "complete";
        return {
          actions: [
            {
              say: "Oh, shoot! Something went wrong on my end. My systems are acting up—happens sometimes, you know? Try calling back in a bit and we'll get that alarm set up for you. Sorry about that!",
              listen: false,
              remember: updatedMemory,
            },
          ],
        };
      }

    default:
      updatedMemory.step = "greeting";
      return {
        actions: [
          {
            say: "Thanks for calling, Raider! If you need anything else—patch job, pick-me-up, or another alarm—you know where to find me. Take care!",
            listen: false,
            remember: updatedMemory,
          },
        ],
      };
  }
}
